/**
 * Direct download endpoint for ComfyUI images
 */

import { NextRequest, NextResponse } from 'next/server'
import { comfyUIClient } from '@/lib/local/comfyui-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename') || 'FLUX_generated_00016_.png'
    
    const blob = await comfyUIClient.getOutput(filename, '', 'output')
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type || 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Download failed' 
    }, { status: 500 })
  }
}