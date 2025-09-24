/**
 * Diagnostic endpoint to analyze generated images
 */

import { NextRequest, NextResponse } from 'next/server'
import { comfyUIClient } from '@/lib/local/comfyui-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename') || 'FLUX_generated_00016_.png'
    
    const blob = await comfyUIClient.getOutput(filename, '', 'output')
    
    // Get raw bytes for analysis
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Check PNG header
    const pngHeader = buffer.slice(0, 8).toString('hex')
    const isPNG = pngHeader === '89504e470d0a1a0a'
    
    // Get image dimensions from PNG IHDR chunk
    let width = 0, height = 0
    if (isPNG && buffer.length > 24) {
      width = buffer.readUInt32BE(16)
      height = buffer.readUInt32BE(20)
    }
    
    // Sample some pixel data (skip header, look at actual image data)
    const sampleBytes = []
    for (let i = 100; i < Math.min(buffer.length, 200); i += 10) {
      sampleBytes.push(buffer[i])
    }
    
    // Check if all bytes are zero/black
    const nonZeroBytes = sampleBytes.filter(b => b > 0).length
    const avgByte = sampleBytes.reduce((a, b) => a + b, 0) / sampleBytes.length
    
    // Look for IDAT chunks (actual image data)
    let idatFound = false
    let idatSize = 0
    for (let i = 8; i < buffer.length - 12; i++) {
      if (buffer.toString('ascii', i, i + 4) === 'IDAT') {
        idatFound = true
        idatSize = buffer.readUInt32BE(i - 4)
        break
      }
    }
    
    // Extract text chunks if any
    const textChunks = []
    for (let i = 8; i < buffer.length - 12; i++) {
      if (buffer.toString('ascii', i, i + 4) === 'tEXt') {
        const chunkSize = buffer.readUInt32BE(i - 4)
        const textData = buffer.toString('utf8', i + 4, i + 4 + Math.min(chunkSize, 100))
        textChunks.push(textData)
      }
    }
    
    return NextResponse.json({
      filename,
      fileSize: blob.size,
      mimeType: blob.type,
      isPNG,
      dimensions: { width, height },
      analysis: {
        sampleBytes,
        nonZeroBytes,
        averageByteValue: avgByte,
        likelyBlank: avgByte < 10,
        headerHex: pngHeader,
        idatFound,
        idatSize,
        textChunks,
        expectedMinSize: width * height * 3 / 10 // Rough minimum for compressed RGB
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Diagnosis failed' 
    }, { status: 500 })
  }
}