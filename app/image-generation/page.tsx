"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeftIcon,
  SparklesIcon,
  DownloadIcon,
  ShareIcon,
  RefreshCwIcon,
  ImageIcon,
  SettingsIcon,
  WandIcon,
  CopyIcon,
  HeartIcon,
} from "lucide-react"
import Link from "next/link"

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<Array<{filename: string, dataUrl: string}>>([])
  const [selectedModel, setSelectedModel] = useState("stable-diffusion")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [steps, setSteps] = useState([20])
  const [cfgScale, setCfgScale] = useState([7])
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null)
  const [comfyUIStatus, setComfyUIStatus] = useState<'checking' | 'running' | 'stopped'>('checking')
  const [progress, setProgress] = useState({ current: 0, total: 100 })
  const [workflowType, setWorkflowType] = useState<'flux' | 'flux-simple' | 'sdxl'>('flux')
  const [denoise, setDenoise] = useState([1.0])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedImages([])
    setProgress({ current: 0, total: 100 })

    try {
      // Start generation
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          steps: workflowType === 'flux' ? 20 : workflowType === 'flux-simple' ? 10 : steps[0],
          cfgScale: workflowType.startsWith('flux') ? 1.0 : cfgScale[0],
          aspectRatio,
          sampler: 'euler',
          scheduler: workflowType === 'flux-simple' ? 'simple' : 'normal',
          workflow: workflowType,
          denoise: denoise[0]
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start generation')
      }

      const result = await response.json()
      setCurrentPromptId(result.promptId)

      // Poll for results
      pollForResults(result.promptId)
    } catch (error) {
      console.error('Generation failed:', error)
      setIsGenerating(false)
    }
  }

  const pollForResults = async (promptId: string) => {
    let pollCount = 0
    const maxPolls = 150 // 5 minutes max (150 * 2 seconds)
    
    const pollInterval = setInterval(async () => {
      pollCount++
      
      // Timeout after max polls
      if (pollCount >= maxPolls) {
        console.error('Generation timed out after 5 minutes')
        setIsGenerating(false)
        setCurrentPromptId(null)
        clearInterval(pollInterval)
        return
      }
      
      try {
        const response = await fetch(`/api/generate/image?promptId=${promptId}`)
        if (!response.ok) throw new Error('Failed to check status')

        const result = await response.json()
        console.log('Poll result:', result)

        if (result.status === 'completed') {
          console.log('Received completed result:', result)
          console.log('Images received:', result.images)
          if (result.images && result.images.length > 0) {
            console.log('First image data:', result.images[0])
            console.log('DataUrl exists:', !!result.images[0].dataUrl)
            console.log('DataUrl starts with:', result.images[0].dataUrl?.substring(0, 50))
          }
          setGeneratedImages(result.images || [])
          setIsGenerating(false)
          setCurrentPromptId(null)
          clearInterval(pollInterval)
        } else if (result.status === 'error') {
          console.error('Generation error:', result.error)
          setIsGenerating(false)
          setCurrentPromptId(null)
          clearInterval(pollInterval)
        }
        // Continue polling if still processing
      } catch (error) {
        console.error('Polling error:', error)
        setIsGenerating(false)
        setCurrentPromptId(null)
        clearInterval(pollInterval)
      }
    }, 2000) // Poll every 2 seconds
  }

  // Check ComfyUI status on mount
  React.useEffect(() => {
    const checkComfyUIStatus = async () => {
      try {
        const response = await fetch('/api/generate/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'test' })
        })
        
        if (response.status === 503) {
          setComfyUIStatus('stopped')
        } else {
          setComfyUIStatus('running')
        }
      } catch {
        setComfyUIStatus('stopped')
      }
    }

    checkComfyUIStatus()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black font-[var(--font-montserrat)] text-foreground">Image Generation</h1>
                  <p className="text-sm font-medium text-foreground/80">Create stunning images with AI</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge 
                variant={comfyUIStatus === 'running' ? 'default' : 'destructive'} 
                className="gap-1"
              >
                <div className={`w-2 h-2 rounded-full ${
                  comfyUIStatus === 'running' ? 'bg-green-500' : 
                  comfyUIStatus === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                ComfyUI {comfyUIStatus === 'running' ? 'Connected' : 
                        comfyUIStatus === 'stopped' ? 'Offline' : 'Checking...'}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <SparklesIcon className="w-3 h-3" />
                {selectedModel.toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm">
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WandIcon className="w-5 h-5" />
                  Generation Settings
                </CardTitle>
                <CardDescription className="font-medium text-foreground/60">
                  Configure your image generation parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="font-semibold text-foreground">
                    Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the image you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="negative-prompt" className="font-semibold text-foreground">
                    Negative Prompt (Optional)
                  </Label>
                  <Textarea
                    id="negative-prompt"
                    placeholder="What to avoid in the image..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-foreground">Workflow Type</Label>
                    <Select value={workflowType} onValueChange={(value: 'flux' | 'flux-simple' | 'sdxl') => setWorkflowType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flux">FLUX (High Quality)</SelectItem>
                        <SelectItem value="flux-simple">FLUX Simple (Fast)</SelectItem>
                        <SelectItem value="sdxl">Stable Diffusion XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-foreground">AI Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable-diffusion">Stable Diffusion XL (ComfyUI)</SelectItem>
                        <SelectItem value="sd15">Stable Diffusion 1.5 (ComfyUI)</SelectItem>
                        <SelectItem value="flux">FLUX (ComfyUI)</SelectItem>
                        <SelectItem value="custom">Custom Model (ComfyUI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-foreground">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                        <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                        <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                        <SelectItem value="4:3">Classic (4:3)</SelectItem>
                        <SelectItem value="3:2">Photo (3:2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-foreground">Steps</Label>
                      <span className="text-sm font-medium text-foreground/70">{steps[0]}</span>
                    </div>
                    <Slider value={steps} onValueChange={setSteps} max={100} min={10} step={5} className="w-full" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-foreground">CFG Scale</Label>
                      <span className="text-sm font-medium text-foreground/70">
                        {workflowType.startsWith('flux') ? '1.0 (Fixed)' : cfgScale[0]}
                      </span>
                    </div>
                    {!workflowType.startsWith('flux') && (
                      <Slider
                        value={cfgScale}
                        onValueChange={setCfgScale}
                        max={20}
                        min={1}
                        step={0.5}
                        className="w-full"
                      />
                    )}
                    {workflowType.startsWith('flux') && (
                      <div className="text-sm text-muted-foreground">
                        FLUX uses CFG=1.0 for optimal results
                      </div>
                    )}
                  </div>

                  {workflowType.startsWith('flux') && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-foreground">Denoise</Label>
                        <span className="text-sm font-medium text-foreground/70">{denoise[0].toFixed(2)}</span>
                      </div>
                      <Slider
                        value={denoise}
                        onValueChange={setDenoise}
                        max={1.0}
                        min={0.1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating || comfyUIStatus !== 'running'}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCwIcon className="w-4 h-4 animate-spin" />
                      Generating with ComfyUI...
                    </>
                  ) : comfyUIStatus !== 'running' ? (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      ComfyUI Not Running
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      Generate Images
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Prompts</CardTitle>
                <CardDescription className="font-medium text-foreground/60">
                  Popular prompt templates to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    "A futuristic cityscape at sunset",
                    "Portrait of a wise old wizard",
                    "Abstract geometric patterns",
                    "Serene mountain landscape",
                    "Cyberpunk street scene",
                  ].map((quickPrompt, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setPrompt(quickPrompt)}
                    >
                      <span className="text-sm font-medium text-foreground/80">{quickPrompt}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Generated Images</CardTitle>
                <CardDescription className="font-medium text-foreground/60">
                  Your AI-generated creations will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                        <RefreshCwIcon className="w-8 h-8 text-accent animate-spin" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Generating your images...</p>
                        <p className="text-sm font-medium text-foreground/60">This may take a few moments</p>
                      </div>
                    </div>
                  </div>
                ) : generatedImages.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {generatedImages.map((image, index) => (
                        <div key={index} className="group relative">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <img
                              src={image.dataUrl || "/placeholder.svg"}
                              alt={`Generated image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onLoad={() => console.log('Image loaded successfully:', image.filename)}
                              onError={(e) => {
                                console.error('Image failed to load:', image.filename, e)
                                console.log('DataUrl preview:', image.dataUrl.substring(0, 100) + '...')
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="gap-1"
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = image.dataUrl
                                link.download = image.filename
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              }}
                            >
                              <DownloadIcon className="w-3 h-3" />
                              Download
                            </Button>
                            <Button size="sm" variant="secondary" className="gap-1">
                              <ShareIcon className="w-3 h-3" />
                              Share
                            </Button>
                            <Button size="sm" variant="secondary" className="gap-1">
                              <HeartIcon className="w-3 h-3" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                          <CopyIcon className="w-3 h-3" />
                          Copy Prompt
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                          <RefreshCwIcon className="w-3 h-3" />
                          Regenerate
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-foreground/60">4 images generated</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Ready to create</p>
                        <p className="text-sm font-medium text-foreground/60">
                          Enter a prompt and click generate to start creating images
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
