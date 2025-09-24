/**
 * Debug API Route: Check ComfyUI status, queue, and history
 */

import { NextRequest, NextResponse } from 'next/server'
import { comfyUIClient } from '@/lib/local/comfyui-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promptId = searchParams.get('promptId')

    // Get system status
    const isRunning = await comfyUIClient.isRunning()
    
    // Get queue status
    const queue = await comfyUIClient.getQueue()
    
    // Get history for specific prompt if provided
    let history = null
    if (promptId) {
      history = await comfyUIClient.getHistory(promptId)
    } else {
      // Get recent history
      const allHistory = await comfyUIClient.getHistory()
      history = allHistory
    }

    return NextResponse.json({
      isRunning,
      queue,
      history,
      promptId
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Debug API failed' },
      { status: 500 }
    )
  }
}