/**
 * API Route: Image Generation with ComfyUI
 * Handles text-to-image generation requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { comfyUIClient, blobToDataURL } from '@/lib/local/comfyui-client'
import { createTextToImageWorkflow } from '@/lib/comfyui/workflows/text-to-image'
import { createFLUXImageWorkflow, createFLUXImageSimpleWorkflow } from '@/lib/comfyui/workflows/flux-image'
import { comfyUIConfig } from '@/lib/comfyui/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      prompt,
      negativePrompt,
      model,
      steps,
      cfgScale,
      width,
      height,
      seed,
      sampler,
      scheduler,
      aspectRatio,
      workflow = 'flux', // Default to FLUX
      fluxModel,
      clipModel1,
      clipModel2,
      vaeModel,
      denoise
    } = body

    // Check if ComfyUI is running
    const isRunning = await comfyUIClient.isRunning()
    if (!isRunning) {
      return NextResponse.json(
        { error: 'ComfyUI server is not running. Please start ComfyUI on localhost:8188' },
        { status: 503 }
      )
    }

    // Use aspect ratio dimensions if provided
    let finalWidth = width
    let finalHeight = height
    if (aspectRatio && comfyUIConfig.aspectRatios[aspectRatio as keyof typeof comfyUIConfig.aspectRatios]) {
      const dimensions = comfyUIConfig.aspectRatios[aspectRatio as keyof typeof comfyUIConfig.aspectRatios]
      finalWidth = dimensions.width
      finalHeight = dimensions.height
    }

    // Create workflow based on selected type
    let workflowToRun
    
    if (workflow === 'flux') {
      workflowToRun = createFLUXImageWorkflow({
        prompt,
        negativePrompt,
        fluxModel: fluxModel || 'FLUX1\\flux1-dev-fp8.safetensors',
        clipModel1: clipModel1 || 't5\\t5xxl_fp8_e4m3fn_scaled.safetensors',
        clipModel2: clipModel2 || 'clip_l.safetensors',
        vaeModel: vaeModel || 'flux_vae.safetensors',
        sampler: sampler || 'euler',
        scheduler: scheduler || 'normal',
        steps: steps || 20,
        denoise: denoise || 1.0,
        cfgScale: cfgScale || 1.0, // FLUX uses low CFG
        width: finalWidth || 1024,
        height: finalHeight || 1024,
        seed
      })
    } else if (workflow === 'flux-simple') {
      workflowToRun = createFLUXImageSimpleWorkflow({
        prompt,
        negativePrompt,
        fluxModel: fluxModel || 'FLUX1\\flux1-dev-fp8.safetensors',
        clipModel1: clipModel1 || 't5\\t5xxl_fp8_e4m3fn_scaled.safetensors',
        clipModel2: clipModel2 || 'clip_l.safetensors',
        vaeModel: vaeModel || 'flux_vae.safetensors',
        sampler: sampler || 'euler',
        scheduler: scheduler || 'simple',
        steps: steps || 10, // Fewer steps for simple
        denoise: denoise || 1.0,
        width: finalWidth || 1024,
        height: finalHeight || 1024,
        seed
      })
    } else {
      // Fallback to SDXL workflow
      workflowToRun = createTextToImageWorkflow({
        prompt,
        negativePrompt,
        model: model || comfyUIConfig.models.defaultCheckpoint,
        steps: steps || comfyUIConfig.defaults.image.steps,
        cfgScale: cfgScale || comfyUIConfig.defaults.image.cfgScale,
        width: finalWidth || comfyUIConfig.defaults.image.width,
        height: finalHeight || comfyUIConfig.defaults.image.height,
        seed,
        sampler: sampler || comfyUIConfig.defaults.image.sampler,
        scheduler: scheduler || comfyUIConfig.defaults.image.scheduler
      })
    }

    // Queue the workflow
    console.log('Queueing workflow:', JSON.stringify(workflowToRun, null, 2))
    const promptId = await comfyUIClient.queuePrompt(workflowToRun)

    // Return prompt ID for progress tracking
    return NextResponse.json({
      promptId,
      message: 'Image generation started'
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    )
  }
}

// Get generation progress and results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promptId = searchParams.get('promptId')
    const action = searchParams.get('action')

    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      )
    }

    // Check history for results
    const history = await comfyUIClient.getHistory(promptId)
    
    console.log('History for promptId:', promptId, history)
    
    if (!history) {
      return NextResponse.json({
        status: 'processing',
        message: 'Generation in progress'
      })
    }

    // Check if completed - also check if outputs exist even without explicit completion status
    const hasOutputs = history.outputs && Object.keys(history.outputs).length > 0
    if (history.status?.completed || hasOutputs) {
      const results = []
      
      // Collect all images from outputs
      for (const [nodeId, output] of Object.entries(history.outputs)) {
        console.log('Processing node output:', nodeId, output)
        if (output.images) {
          console.log('Found images:', output.images)
          for (const image of output.images) {
            console.log('Processing image:', image)
            if (action === 'download') {
              // Return image blob for download
              const blob = await comfyUIClient.getOutput(
                image.filename,
                image.subfolder,
                image.type
              )
              
              return new NextResponse(blob, {
                headers: {
                  'Content-Type': 'image/png',
                  'Content-Disposition': `attachment; filename="${image.filename}"`
                }
              })
            } else {
              // Convert to data URL for preview
              const blob = await comfyUIClient.getOutput(
                image.filename,
                image.subfolder,
                image.type
              )
              
              // Convert blob to base64 data URL for server-side
              console.log('Blob info:', { size: blob.size, type: blob.type })
              const arrayBuffer = await blob.arrayBuffer()
              const buffer = Buffer.from(arrayBuffer)
              const base64 = buffer.toString('base64')
              const mimeType = blob.type || 'image/png'
              const dataUrl = `data:${mimeType};base64,${base64}`
              console.log('Generated dataUrl length:', dataUrl.length, 'first 100 chars:', dataUrl.substring(0, 100))
              
              results.push({
                filename: image.filename,
                dataUrl
              })
            }
          }
        }
      }

      return NextResponse.json({
        status: 'completed',
        images: results
      })
    }

    // Check for errors
    if (history.status?.status_str === 'error' || (history.status?.messages && history.status.messages.some(msg => msg[0] === 'execution_error'))) {
      const errorMessage = history.status?.messages?.find(msg => msg[0] === 'execution_error')?.[1] || 'Unknown error occurred'
      console.error('ComfyUI execution error:', errorMessage)
      return NextResponse.json({
        status: 'error',
        error: errorMessage
      })
    }

    // Still processing
    return NextResponse.json({
      status: 'processing',
      message: 'Generation in progress'
    })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch results' },
      { status: 500 }
    )
  }
}