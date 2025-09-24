import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ollamaClient } from '@/lib/local/ollama-client'

// Request validation schema
const generateTextSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().optional().default('gemma3:4b'),
  type: z.enum(['general', 'slides', 'chart_data', 'improve_text']).optional().default('general'),
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    slideCount: z.number().min(1).max(20).optional(), // For slide generation
    instruction: z.string().optional() // For text improvement
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { prompt, model, type, options } = generateTextSchema.parse(body)

    // Check if Ollama is running
    const isRunning = await ollamaClient.isRunning()
    if (!isRunning) {
      return NextResponse.json(
        { 
          error: 'Ollama service is not running. Please start Ollama and try again.',
          suggestion: 'Run "ollama serve" in your terminal to start the service.'
        },
        { status: 503 }
      )
    }

    let result: any
    const startTime = Date.now()

    // Handle different generation types
    switch (type) {
      case 'slides':
        result = await ollamaClient.generateSlideContent(prompt, options?.slideCount || 5)
        break
        
      case 'chart_data':
        result = await ollamaClient.generateChartData(prompt)
        break
        
      case 'improve_text':
        result = await ollamaClient.improveText(prompt, options?.instruction)
        break
        
      case 'general':
      default:
        result = await ollamaClient.generateText(prompt, model, {
          temperature: options?.temperature,
          top_p: options?.top_p
        })
        break
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        model: model,
        type: type,
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Local text generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Text generation failed',
          message: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// GET endpoint to check service status and list available models
export async function GET(request: NextRequest) {
  try {
    const isRunning = await ollamaClient.isRunning()
    
    if (!isRunning) {
      return NextResponse.json({
        status: 'offline',
        message: 'Ollama service is not running'
      })
    }

    const models = await ollamaClient.listModels()
    
    return NextResponse.json({
      status: 'online',
      service: 'ollama',
      models: models,
      capabilities: [
        'text_generation',
        'slide_generation',
        'chart_data_generation',
        'text_improvement',
        'image_analysis'
      ]
    })

  } catch (error) {
    console.error('Service status check failed:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to check service status'
      },
      { status: 500 }
    )
  }
}