/**
 * Local Ollama AI Client
 * Handles communication with locally running Ollama models
 */

export interface OllamaResponse {
  model: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaGenerateRequest {
  model: string
  prompt: string
  images?: string[] // Base64 encoded images for vision models
  stream?: boolean
  options?: {
    temperature?: number
    top_p?: number
    top_k?: number
    num_predict?: number
    stop?: string[]
  }
}

export class OllamaClient {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl
  }

  /**
   * Check if Ollama service is running
   */
  async isRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      return response.ok
    } catch (error) {
      console.error('Ollama service check failed:', error)
      return false
    }
  }

  /**
   * Get list of available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.models?.map((model: any) => model.name) || []
    } catch (error) {
      console.error('Failed to list Ollama models:', error)
      return []
    }
  }

  /**
   * Generate text using specified model
   */
  async generateText(
    prompt: string,
    model: string = 'gemma3:4b',
    options?: OllamaGenerateRequest['options']
  ): Promise<string> {
    try {
      const requestBody: OllamaGenerateRequest = {
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          ...options
        }
      }

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      const data: OllamaResponse = await response.json()
      return data.response
    } catch (error) {
      console.error('Text generation failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }

  /**
   * Analyze image using vision model (LLaVA or similar)
   */
  async analyzeImage(
    imageBase64: string,
    prompt: string = "Describe this image in detail",
    model: string = 'llava:7b'
  ): Promise<string> {
    try {
      const requestBody: OllamaGenerateRequest = {
        model,
        prompt,
        images: [imageBase64],
        stream: false,
        options: {
          temperature: 0.1, // Lower temperature for more consistent analysis
          top_p: 0.9
        }
      }

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      const data: OllamaResponse = await response.json()
      return data.response
    } catch (error) {
      console.error('Image analysis failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Image analysis failed')
    }
  }

  /**
   * Generate slide content from a topic
   */
  async generateSlideContent(topic: string, slideCount: number = 5): Promise<any> {
    const prompt = `Create a ${slideCount}-slide presentation about "${topic}". 
    Return ONLY valid JSON in this exact format:
    {
      "title": "Presentation Title",
      "slides": [
        {
          "title": "Slide Title",
          "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
          "notes": "Speaker notes for this slide"
        }
      ]
    }
    
    Make sure the content is professional, informative, and engaging.`

    try {
      const response = await this.generateText(prompt, 'deepseek-r1:14b', {
        temperature: 0.3, // Lower temperature for more structured output
        top_p: 0.8
      })

      // Clean up response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response')
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Slide generation failed:', error)
      throw new Error('Failed to generate slide content')
    }
  }

  /**
   * Generate chart data from description
   */
  async generateChartData(description: string): Promise<any> {
    const prompt = `Generate realistic chart data for: "${description}". 
    Return ONLY valid JSON in this exact format:
    {
      "title": "Chart Title",
      "type": "bar|pie|line|area",
      "data": [
        {"label": "Category 1", "value": 45},
        {"label": "Category 2", "value": 32},
        {"label": "Category 3", "value": 28}
      ],
      "description": "Brief description of what this data shows"
    }
    
    Use realistic values and appropriate chart type for the data.`

    try {
      const response = await this.generateText(prompt, 'deepseek-r1:14b', {
        temperature: 0.2,
        top_p: 0.8
      })

      // Clean up response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response')
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Chart data generation failed:', error)
      throw new Error('Failed to generate chart data')
    }
  }

  /**
   * Improve/expand text content
   */
  async improveText(
    text: string,
    instruction: string = "Make this text more professional and engaging"
  ): Promise<string> {
    const prompt = `${instruction}:

"${text}"

Return only the improved text without any additional commentary.`

    return this.generateText(prompt, 'deepseek-r1:14b', {
      temperature: 0.4,
      top_p: 0.9
    })
  }
}

// Export singleton instance
export const ollamaClient = new OllamaClient()

// Helper function to convert file to base64 for image analysis
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (data:image/jpeg;base64,)
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      } else {
        reject(new Error('Failed to read file as base64'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}