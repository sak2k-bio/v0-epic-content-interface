/**
 * ComfyUI Client for local image and video generation
 * Handles WebSocket and HTTP communication with ComfyUI API
 */

import { v4 as uuidv4 } from 'uuid'

// Types for ComfyUI API
export interface ComfyUIWorkflow {
  [nodeId: string]: {
    inputs: { [key: string]: any }
    class_type: string
    _meta?: { title: string }
  }
}

export interface ComfyUIPromptResponse {
  prompt_id: string
  number: number
  node_errors: { [key: string]: any }
}

export interface ComfyUIProgress {
  value: number
  max: number
  prompt_id?: string
  node?: string
}

export interface ComfyUIExecutionResult {
  images?: Array<{
    filename: string
    subfolder: string
    type: string
  }>
  gifs?: Array<{
    filename: string
    subfolder: string
    type: string
  }>
  videos?: Array<{
    filename: string
    subfolder: string
    type: string
  }>
}

export interface ComfyUIHistoryItem {
  prompt: [number, string, ComfyUIWorkflow, {}, string[]]
  outputs: { [nodeId: string]: ComfyUIExecutionResult }
  status?: {
    status_str: string
    completed: boolean
    messages?: Array<[string, any]>
  }
}

export class ComfyUIClient {
  private httpUrl: string
  private wsUrl: string
  private ws: WebSocket | null = null
  private clientId: string
  private progressCallbacks: Map<string, (progress: ComfyUIProgress) => void> = new Map()
  private completionCallbacks: Map<string, (result: ComfyUIExecutionResult) => void> = new Map()

  constructor(baseUrl: string = 'http://localhost:8188') {
    this.httpUrl = baseUrl
    this.wsUrl = baseUrl.replace('http', 'ws')
    this.clientId = uuidv4()
  }

  /**
   * Connect to ComfyUI WebSocket for real-time updates
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.wsUrl}/ws?clientId=${this.clientId}`)
        
        this.ws.onopen = () => {
          console.log('Connected to ComfyUI WebSocket')
          resolve()
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            this.handleWebSocketMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = () => {
          console.log('Disconnected from ComfyUI WebSocket')
          this.ws = null
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: any): void {
    const { type, data } = message

    switch (type) {
      case 'progress':
        if (data.prompt_id && this.progressCallbacks.has(data.prompt_id)) {
          this.progressCallbacks.get(data.prompt_id)!(data)
        }
        break
      
      case 'executing':
        if (data.prompt_id && data.node === null) {
          // Execution completed, fetch results
          this.handleExecutionComplete(data.prompt_id)
        }
        break

      case 'execution_cached':
        console.log('Using cached execution for prompt:', data.prompt_id)
        break

      case 'status':
        console.log('ComfyUI Status:', data.status)
        break
    }
  }

  /**
   * Handle execution completion
   */
  private async handleExecutionComplete(promptId: string): Promise<void> {
    try {
      const history = await this.getHistory(promptId)
      if (history && this.completionCallbacks.has(promptId)) {
        const outputs = history.outputs
        const results: ComfyUIExecutionResult = {
          images: [],
          videos: [],
          gifs: []
        }

        // Collect all outputs
        for (const nodeOutputs of Object.values(outputs)) {
          if (nodeOutputs.images) results.images!.push(...nodeOutputs.images)
          if (nodeOutputs.gifs) results.gifs!.push(...nodeOutputs.gifs)
          if (nodeOutputs.videos) results.videos!.push(...nodeOutputs.videos)
        }

        this.completionCallbacks.get(promptId)!(results)
      }
    } catch (error) {
      console.error('Failed to fetch execution results:', error)
    } finally {
      // Clean up callbacks
      this.progressCallbacks.delete(promptId)
      this.completionCallbacks.delete(promptId)
    }
  }

  /**
   * Check if ComfyUI server is running
   */
  async isRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.httpUrl}/system_stats`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch (error) {
      console.error('ComfyUI service check failed:', error)
      return false
    }
  }

  /**
   * Get system stats
   */
  async getSystemStats(): Promise<any> {
    const response = await fetch(`${this.httpUrl}/system_stats`)
    if (!response.ok) throw new Error('Failed to get system stats')
    return response.json()
  }

  /**
   * Queue a workflow prompt for execution
   */
  async queuePrompt(
    workflow: ComfyUIWorkflow,
    onProgress?: (progress: ComfyUIProgress) => void,
    onComplete?: (result: ComfyUIExecutionResult) => void
  ): Promise<string> {
    // Ensure WebSocket is connected for progress updates
    if (!this.ws && (onProgress || onComplete)) {
      await this.connect()
    }

    const body = {
      prompt: workflow,
      client_id: this.clientId
    }

    const response = await fetch(`${this.httpUrl}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('ComfyUI queue prompt failed:', {
        status: response.status,
        statusText: response.statusText,
        error: error,
        workflow: JSON.stringify(workflow, null, 2)
      })
      throw new Error(`Failed to queue prompt: ${error}`)
    }

    const result: ComfyUIPromptResponse = await response.json()

    // Check for node errors in the response
    if (result.node_errors && Object.keys(result.node_errors).length > 0) {
      console.error('ComfyUI node errors detected:', result.node_errors)
      throw new Error(`Workflow validation failed: ${JSON.stringify(result.node_errors, null, 2)}`)
    }

    console.log('ComfyUI workflow queued successfully:', {
      promptId: result.prompt_id,
      number: result.number
    })

    // Register callbacks
    if (onProgress) {
      this.progressCallbacks.set(result.prompt_id, onProgress)
    }
    if (onComplete) {
      this.completionCallbacks.set(result.prompt_id, onComplete)
    }

    return result.prompt_id
  }

  /**
   * Get workflow execution history
   */
  async getHistory(promptId?: string): Promise<ComfyUIHistoryItem | null> {
    const url = promptId 
      ? `${this.httpUrl}/history/${promptId}`
      : `${this.httpUrl}/history`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.log(`History request failed: ${response.status} ${response.statusText}`)
      return null
    }

    const history = await response.json()
    console.log('Raw history response:', history)
    
    if (promptId && history[promptId]) {
      return history[promptId]
    }
    
    // If no specific prompt ID, return the full history for debugging
    if (!promptId) {
      return history
    }
    
    return null
  }

  /**
   * Get generated image/video data
   */
  async getOutput(filename: string, subfolder: string = '', type: string = 'output'): Promise<Blob> {
    const params = new URLSearchParams({
      filename,
      subfolder,
      type
    })

    const response = await fetch(`${this.httpUrl}/view?${params}`)
    if (!response.ok) throw new Error('Failed to get output')

    return response.blob()
  }

  /**
   * Upload an image to ComfyUI
   */
  async uploadImage(file: File, subfolder: string = '', overwrite: boolean = true): Promise<{
    name: string
    subfolder: string
    type: string
  }> {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('subfolder', subfolder)
    formData.append('type', 'input')
    formData.append('overwrite', overwrite.toString())

    const response = await fetch(`${this.httpUrl}/upload/image`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) throw new Error('Failed to upload image')

    return response.json()
  }

  /**
   * Get list of available models
   */
  async getModels(type: 'checkpoints' | 'loras' | 'vae' | 'embeddings' = 'checkpoints'): Promise<string[]> {
    const response = await fetch(`${this.httpUrl}/object_info`)
    if (!response.ok) throw new Error('Failed to get models')

    const objectInfo = await response.json()
    
    // Find the appropriate loader node based on type
    let loaderNode: string
    switch (type) {
      case 'checkpoints':
        loaderNode = 'CheckpointLoaderSimple'
        break
      case 'loras':
        loaderNode = 'LoraLoader'
        break
      case 'vae':
        loaderNode = 'VAELoader'
        break
      case 'embeddings':
        loaderNode = 'CLIPTextEncode'
        break
      default:
        return []
    }

    const nodeInfo = objectInfo[loaderNode]
    if (!nodeInfo) return []

    // Extract model names from the appropriate input field
    const inputField = type === 'checkpoints' ? 'ckpt_name' 
                    : type === 'loras' ? 'lora_name'
                    : type === 'vae' ? 'vae_name'
                    : null

    if (inputField && nodeInfo.input?.required?.[inputField]) {
      return nodeInfo.input.required[inputField][0] || []
    }

    return []
  }

  /**
   * Interrupt current execution
   */
  async interrupt(): Promise<void> {
    const response = await fetch(`${this.httpUrl}/interrupt`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to interrupt execution')
  }

  /**
   * Get queue status
   */
  async getQueue(): Promise<{
    queue_running: Array<[number, string, any]>
    queue_pending: Array<[number, string, any]>
  }> {
    const response = await fetch(`${this.httpUrl}/queue`)
    if (!response.ok) throw new Error('Failed to get queue')
    return response.json()
  }

  /**
   * Clear the queue
   */
  async clearQueue(): Promise<void> {
    const response = await fetch(`${this.httpUrl}/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ clear: true })
    })
    if (!response.ok) throw new Error('Failed to clear queue')
  }

  /**
   * Delete a queued item
   */
  async deleteQueueItem(promptId: string): Promise<void> {
    const response = await fetch(`${this.httpUrl}/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ delete: [promptId] })
    })
    if (!response.ok) throw new Error('Failed to delete queue item')
  }
}

// Export singleton instance
export const comfyUIClient = new ComfyUIClient()

// Helper function to create base64 data URL from blob
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Helper function to download blob as file
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}