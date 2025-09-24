/**
 * Test endpoint to validate base64 image conversion
 */

import { NextRequest, NextResponse } from 'next/server'
import { comfyUIClient } from '@/lib/local/comfyui-client'

export async function GET(request: NextRequest) {
  try {
    // Get the latest image from ComfyUI output
    const filename = 'FLUX_generated_00012_.png' // Use the filename from logs
    
    const blob = await comfyUIClient.getOutput(filename, '', 'output')
    
    // Convert blob to base64 data URL
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const mimeType = blob.type || 'image/png'
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    // Return as HTML for direct testing
    return new NextResponse(`
      <html>
        <head><title>Image Test</title></head>
        <body>
          <h1>Image Test</h1>
          <p>Blob size: ${blob.size} bytes</p>
          <p>MIME type: ${mimeType}</p>
          <p>Base64 length: ${base64.length}</p>
          <p>Data URL length: ${dataUrl.length}</p>
          <img src="${dataUrl}" alt="Test image" style="max-width: 500px; border: 1px solid red;" />
          <hr>
          <textarea rows="5" cols="100" readonly>${dataUrl.substring(0, 200)}...</textarea>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Test failed' })
  }
}