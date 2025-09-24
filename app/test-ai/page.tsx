'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  SparklesIcon, 
  BrainIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon
} from 'lucide-react'
import Link from 'next/link'

export default function TestAIPage() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serviceStatus, setServiceStatus] = useState<any>(null)
  const [selectedType, setSelectedType] = useState('general')
  const [selectedModel, setSelectedModel] = useState('gemma3:4b')

  const checkServiceStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/local/generate/text', {
        method: 'GET'
      })
      const data = await response.json()
      setServiceStatus(data)
    } catch (error) {
      setError('Failed to check service status')
    } finally {
      setIsLoading(false)
    }
  }

  const generateContent = async () => {
    if (!prompt.trim()) return

    try {
      setIsLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch('/api/local/generate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          type: selectedType,
          options: {
            temperature: 0.7,
            slideCount: selectedType === 'slides' ? 3 : undefined
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setResult(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const renderResult = () => {
    if (!result) return null

    const { data, metadata } = result

    switch (selectedType) {
      case 'slides':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{data.title}</h3>
            {data.slides?.map((slide: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{slide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {slide.content?.map((point: string, i: number) => (
                      <li key={i} className="text-sm">{point}</li>
                    ))}
                  </ul>
                  {slide.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Notes: {slide.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )

      case 'chart_data':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{data.title}</h3>
            <Badge variant="outline">{data.type} chart</Badge>
            <p className="text-sm text-muted-foreground">{data.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.data?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{data}</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">← Back to App</Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <BrainIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black font-[var(--font-montserrat)] text-foreground">
                    Local AI Test Lab
                  </h1>
                  <p className="text-sm text-muted-foreground">Test your local AI models</p>
                </div>
              </div>
            </div>
            <Button onClick={checkServiceStatus} disabled={isLoading} variant="outline" size="sm">
              {isLoading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Check Status'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                AI Generation Test
              </CardTitle>
              <CardDescription>
                Test your local Ollama models with different generation types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Status */}
              {serviceStatus && (
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {serviceStatus.status === 'online' ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium capitalize">{serviceStatus.status}</span>
                  </div>
                  {serviceStatus.models && (
                    <div className="text-xs text-muted-foreground">
                      Available models: {serviceStatus.models.length}
                    </div>
                  )}
                </div>
              )}

              {/* Generation Type */}
              <div className="space-y-2">
                <Label>Generation Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Text</SelectItem>
                    <SelectItem value="slides">Slide Generation</SelectItem>
                    <SelectItem value="chart_data">Chart Data</SelectItem>
                    <SelectItem value="improve_text">Improve Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemma3:4b">Gemma 3 4B (Fast)</SelectItem>
                    <SelectItem value="deepseek-r1:14b">DeepSeek R1 14B (Smart)</SelectItem>
                    <SelectItem value="llava:7b">LLaVA 7B (Vision)</SelectItem>
                    <SelectItem value="mistral-small3.2:24b">Mistral Small 24B (Powerful)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <Label>
                  Prompt {selectedType === 'slides' && '(Topic)'}
                  {selectedType === 'chart_data' && '(Data Description)'}
                </Label>
                <Textarea
                  placeholder={
                    selectedType === 'slides' ? 'Enter presentation topic (e.g., "AI in Healthcare")' :
                    selectedType === 'chart_data' ? 'Describe the data you want (e.g., "Monthly sales by region")' :
                    selectedType === 'improve_text' ? 'Enter text to improve' :
                    'Enter your prompt here...'
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateContent}
                disabled={!prompt.trim() || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Generate with Local AI
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              {result && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {result.metadata?.processing_time_ms}ms
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {result.metadata?.model}
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <LoaderIcon className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {result && !isLoading && (
                <div className="space-y-4">
                  {renderResult()}
                </div>
              )}

              {!result && !isLoading && (
                <div className="text-center py-12 text-muted-foreground">
                  <BrainIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a prompt and click generate to test your local AI</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}