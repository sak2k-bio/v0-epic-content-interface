/**
 * API Route: Video Generation with ComfyUI
 * Handles text-to-video generation requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { comfyUIClient, blobToDataURL } from '@/lib/local/comfyui-client'
import { createTextToVideoWorkflow } from '@/lib/comfyui/workflows/text-to-video'
import { createWAN22VideoWorkflow, createWAN22VideoSimpleWorkflow } from '@/lib/comfyui/workflows/wan2-video'
import { comfyUIConfig } from '@/lib/comfyui/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      prompt,
      negativePrompt,
      model,
      motionModule,
      steps,
      cfgScale,
      width,
      height,
      frames,
      fps,
      seed,
      sampler,
      scheduler,
      aspectRatio,
      workflow = 'wan22', // Default to WAN 2.2
      loraStrength,
      highNoiseModel,
      lowNoiseModel,
      clipModel,
      vaeModel,
      loraModel
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
    if (aspectRatio && comfyUIConfig.videoAspectRatios[aspectRatio as keyof typeof comfyUIConfig.videoAspectRatios]) {
      const dimensions = comfyUIConfig.videoAspectRatios[aspectRatio as keyof typeof comfyUIConfig.videoAspectRatios]
      finalWidth = dimensions.width
      finalHeight = dimensions.height
    }

    // Create workflow based on selected type
    let workflowToRun
    
    if (workflow === 'wan22') {
      workflowToRun = createWAN22VideoWorkflow({
        prompt,
        negativePrompt,
        highNoiseModel: highNoiseModel || 'Wan2.2\\wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors',
        lowNoiseModel: lowNoiseModel || 'Wan2.2\\wan2.2_t2v_low_noise_14B_fp8_scaled.safetensors',
        clipModel: clipModel || 'umt5_xxl_fp8_e4m3fn_scaled.safetensors',
        vaeModel: vaeModel || 'wan_2.1_vae.safetensors',
        loraModel: loraModel || 'wan2_2_t2v_lightx2v_4steps_lora.safetensors',
        loraStrength: loraStrength || 1.0,
        width: finalWidth || 512,
        height: finalHeight || 512,
        frames: frames || 25,
        steps: steps || 4,
        cfgScale: cfgScale || 5.0,
        seed,
        sampler: sampler || 'euler',
        scheduler: scheduler || 'simple'
      })
    } else if (workflow === 'wan22-simple') {
      workflowToRun = createWAN22VideoSimpleWorkflow({
        prompt,
        negativePrompt,
        highNoiseModel: highNoiseModel || 'Wan2.2\\wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors',
        clipModel: clipModel || 'umt5_xxl_fp8_e4m3fn_scaled.safetensors',
        vaeModel: vaeModel || 'wan_2.1_vae.safetensors',
        loraModel: loraModel || 'wan2_2_t2v_lightx2v_4steps_lora.safetensors',
        loraStrength: loraStrength || 1.0,
        width: finalWidth || 512,
        height: finalHeight || 512,
        frames: frames || 25,
        steps: steps || 4,
        cfgScale: cfgScale || 5.0,
        seed,
        sampler: sampler || 'euler',
        scheduler: scheduler || 'simple'
      })
    } else {
      // Fallback to AnimateDiff workflow
      workflowToRun = createTextToVideoWorkflow({
        prompt,
        negativePrompt,
        model: model || comfyUIConfig.models.defaultCheckpoint,
        motionModule: motionModule || comfyUIConfig.models.defaultMotionModule,
        steps: steps || comfyUIConfig.defaults.video.steps,
        cfgScale: cfgScale || comfyUIConfig.defaults.video.cfgScale,
        width: finalWidth || comfyUIConfig.defaults.video.width,
        height: finalHeight || comfyUIConfig.defaults.video.height,
        frames: frames || comfyUIConfig.defaults.video.frames,
        fps: fps || comfyUIConfig.defaults.video.fps,
        seed,
        sampler: sampler || comfyUIConfig.defaults.video.sampler,
        scheduler: scheduler || comfyUIConfig.defaults.video.scheduler
      })
    }

    // Queue the workflow
    const promptId = await comfyUIClient.queuePrompt(workflowToRun)

    // Return prompt ID for progress tracking
    return NextResponse.json({
      promptId,
      message: 'Video generation started'
    })
  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate video' },
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
    console.log('History for promptId', promptId, ':', JSON.stringify(history, null, 2))
    
    if (!history) {
      return NextResponse.json({
        status: 'processing',
        message: 'Generation in progress'
      })
    }

    // Check if completed
    if (history.status?.completed) {
      const results = []
      
      // Collect all videos from outputs
      for (const [nodeId, output] of Object.entries(history.outputs)) {
        console.log(`Processing node ${nodeId} with output:`, JSON.stringify(output, null, 2))
        
        // Check for videos (VHS_VideoCombine format)
        if (output.videos) {
          console.log('Found output.videos:', output.videos)
          for (const video of output.videos) {
            if (action === 'download') {
              // Return video blob for download
              const blob = await comfyUIClient.getOutput(
                video.filename,
                video.subfolder,
                video.type
              )
              
              return new NextResponse(blob, {
                headers: {
                  'Content-Type': 'video/mp4',
                  'Content-Disposition': `attachment; filename="${video.filename}"`
                }
              })
            } else {
              // Convert to data URL for preview
              const blob = await comfyUIClient.getOutput(
                video.filename,
                video.subfolder,
                video.type
              )
              
              // Convert blob to base64 data URL for server-side
              const arrayBuffer = await blob.arrayBuffer()
              const buffer = Buffer.from(arrayBuffer)
              const base64 = buffer.toString('base64')
              const mimeType = blob.type || 'video/mp4'
              const dataUrl = `data:${mimeType};base64,${base64}`
              
              results.push({
                filename: video.filename,
                dataUrl
              })
            }
          }
        }
        
        // Check for SaveVideo node outputs (stored in 'images' array for video files)
        if (output.images && output.animated && output.animated.includes(true)) {
          console.log('Found SaveVideo output in images array:', output.images)
          for (const video of output.images) {
            // Only process if filename indicates it's a video
            if (video.filename.match(/\.(mp4|avi|mov|webm|mkv)$/i)) {
              if (action === 'download') {
                // Return video blob for download
                const blob = await comfyUIClient.getOutput(
                  video.filename,
                  video.subfolder,
                  video.type
                )
                
                return new NextResponse(blob, {
                  headers: {
                    'Content-Type': 'video/mp4',
                    'Content-Disposition': `attachment; filename="${video.filename}"`
                  }
                })
              } else {
                // Convert to data URL for preview
                const blob = await comfyUIClient.getOutput(
                  video.filename,
                  video.subfolder,
                  video.type
                )
                
                // Convert blob to base64 data URL for server-side
                const arrayBuffer = await blob.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                const base64 = buffer.toString('base64')
                const mimeType = blob.type || 'video/mp4'
                const dataUrl = `data:${mimeType};base64,${base64}`
                
                results.push({
                  filename: video.filename,
                  dataUrl
                })
              }
            }
          }
        }
        
        
        // Also check for GIFs as fallback
        if (output.gifs) {
          for (const gif of output.gifs) {
            if (action === 'download') {
              const blob = await comfyUIClient.getOutput(
                gif.filename,
                gif.subfolder,
                gif.type
              )
              
              return new NextResponse(blob, {
                headers: {
                  'Content-Type': 'image/gif',
                  'Content-Disposition': `attachment; filename="${gif.filename}"`
                }
              })
            } else {
              const blob = await comfyUIClient.getOutput(
                gif.filename,
                gif.subfolder,
                gif.type
              )
              
              // Convert blob to base64 data URL for server-side
              const arrayBuffer = await blob.arrayBuffer()
              const buffer = Buffer.from(arrayBuffer)
              const base64 = buffer.toString('base64')
              const mimeType = blob.type || 'image/gif'
              const dataUrl = `data:${mimeType};base64,${base64}`
              
              results.push({
                filename: gif.filename,
                dataUrl,
                isGif: true
              })
            }
          }
        }
      }

      console.log('Returning completed results:', {
        status: 'completed',
        videos: results,
        videoCount: results.length
      })
      
      return NextResponse.json({
        status: 'completed',
        videos: results
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