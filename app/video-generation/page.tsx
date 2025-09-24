"use client"
import React, { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  ArrowLeftIcon,
  SparklesIcon,
  DownloadIcon,
  ShareIcon,
  RefreshCwIcon,
  VideoIcon,
  SettingsIcon,
  WandIcon,
  PlayIcon,
  PauseIcon,
  VolumeXIcon,
  Volume2Icon,
  UploadIcon,
  FilmIcon,
  ClockIcon,
} from "lucide-react"
import Link from "next/link"

export default function VideoGenerationPage() {
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideos, setGeneratedVideos] = useState<Array<{filename: string, dataUrl: string, isGif?: boolean}>>([])
  const [selectedModel, setSelectedModel] = useState("stable-video")
  const [duration, setDuration] = useState([4])
  const [fps, setFps] = useState([8])
  const [resolution, setResolution] = useState("512x512")
  const [frames, setFrames] = useState([16])
  const [motionStrength, setMotionStrength] = useState([5])
  const [seedImage, setSeedImage] = useState<string | null>(null)
  const [useAudio, setUseAudio] = useState(false)
  const [audioPrompt, setAudioPrompt] = useState("")
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null)
  const [comfyUIStatus, setComfyUIStatus] = useState<'checking' | 'running' | 'stopped'>('checking')
  const [workflowType, setWorkflowType] = useState<'wan22' | 'wan22-simple' | 'animatediff'>('wan22')
  const [loraStrength, setLoraStrength] = useState([1.0])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedVideos([])

    try {
      // Start video generation
      const response = await fetch('/api/generate/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          frames: frames[0],
          fps: fps[0],
          steps: workflowType.startsWith('wan22') ? 4 : 25,
          cfgScale: workflowType.startsWith('wan22') ? 5.0 : 7.5,
          aspectRatio: resolution === '512x512' ? '1:1' : '16:9',
          sampler: 'euler',
          scheduler: workflowType.startsWith('wan22') ? 'simple' : 'karras',
          workflow: workflowType,
          loraStrength: loraStrength[0]
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start video generation')
      }

      const result = await response.json()
      setCurrentPromptId(result.promptId)

      // Poll for results
      pollForResults(result.promptId)
    } catch (error) {
      console.error('Video generation failed:', error)
      setIsGenerating(false)
    }
  }

  const pollForResults = async (promptId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate/video?promptId=${promptId}`)
        if (!response.ok) throw new Error('Failed to check status')

        const result = await response.json()

        if (result.status === 'completed') {
          setGeneratedVideos(result.videos || [])
          setIsGenerating(false)
          setCurrentPromptId(null)
          clearInterval(pollInterval)
        } else if (result.status === 'error') {
          console.error('Video generation error:', result.error)
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
    }, 3000) // Poll every 3 seconds for video (slower than images)
  }

  // Check ComfyUI status on mount
  React.useEffect(() => {
    const checkComfyUIStatus = async () => {
      try {
        const response = await fetch('/api/generate/video', {
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSeedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

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
                  <VideoIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black font-[var(--font-montserrat)] text-foreground">Video Generation</h1>
                  <p className="text-sm text-muted-foreground">Create dynamic videos with AI</p>
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
                <FilmIcon className="w-3 h-3" />
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
                  Video Settings
                </CardTitle>
                <CardDescription>Configure your video generation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Video Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the video you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
                  <Textarea
                    id="negative-prompt"
                    placeholder="What to avoid in the video..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Workflow Type</Label>
                    <Select value={workflowType} onValueChange={(value: 'wan22' | 'wan22-simple' | 'animatediff') => setWorkflowType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wan22">WAN 2.2 (High Quality)</SelectItem>
                        <SelectItem value="wan22-simple">WAN 2.2 Simple (Fast)</SelectItem>
                        <SelectItem value="animatediff">AnimateDiff (Classic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>AI Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable-video">Stable Video Diffusion (ComfyUI)</SelectItem>
                        <SelectItem value="animatediff">AnimateDiff (ComfyUI)</SelectItem>
                        <SelectItem value="zeroscope">Zeroscope (ComfyUI)</SelectItem>
                        <SelectItem value="custom">Custom Model (ComfyUI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="512x512">512x512 (Square)</SelectItem>
                        <SelectItem value="1024x576">1024x576 (16:9)</SelectItem>
                        <SelectItem value="576x1024">576x1024 (9:16)</SelectItem>
                        <SelectItem value="768x768">768x768 (Square HD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Duration (seconds)</Label>
                      <span className="text-sm text-muted-foreground">{duration[0]}s</span>
                    </div>
                    <Slider value={duration} onValueChange={setDuration} max={10} min={2} step={1} className="w-full" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Frame Rate (FPS)</Label>
                      <span className="text-sm text-muted-foreground">{fps[0]}</span>
                    </div>
                    <Slider value={fps} onValueChange={setFps} max={30} min={6} step={2} className="w-full" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Frame Count</Label>
                      <span className="text-sm text-muted-foreground">{frames[0]}</span>
                    </div>
                    <Slider value={frames} onValueChange={setFrames} max={32} min={8} step={8} className="w-full" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Motion Strength</Label>
                      <span className="text-sm text-muted-foreground">{motionStrength[0]}</span>
                    </div>
                    <Slider
                      value={motionStrength}
                      onValueChange={setMotionStrength}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {workflowType.startsWith('wan22') && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>LoRA Strength</Label>
                        <span className="text-sm text-muted-foreground">{loraStrength[0].toFixed(2)}</span>
                      </div>
                      <Slider
                        value={loraStrength}
                        onValueChange={setLoraStrength}
                        max={2.0}
                        min={0.1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Seed Image (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="seed-image"
                      />
                      <Label
                        htmlFor="seed-image"
                        className="flex-1 flex items-center justify-center gap-2 h-10 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md cursor-pointer transition-colors"
                      >
                        <UploadIcon className="w-4 h-4" />
                        Upload Image
                      </Label>
                    </div>
                    {seedImage && (
                      <div className="mt-2">
                        <img
                          src={seedImage || "/placeholder.svg"}
                          alt="Seed"
                          className="w-full h-20 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Generate Audio</Label>
                      <p className="text-xs text-muted-foreground">Add AI-generated sound effects</p>
                    </div>
                    <Switch checked={useAudio} onCheckedChange={setUseAudio} />
                  </div>

                  {useAudio && (
                    <div className="space-y-2">
                      <Label htmlFor="audio-prompt">Audio Description</Label>
                      <Input
                        id="audio-prompt"
                        placeholder="Describe the audio/music..."
                        value={audioPrompt}
                        onChange={(e) => setAudioPrompt(e.target.value)}
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
                      Generate Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Video Prompts</CardTitle>
                <CardDescription>Popular video concepts to inspire you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    "A serene ocean wave crashing on shore",
                    "Time-lapse of clouds moving across sky",
                    "A cat walking through a garden",
                    "Abstract colorful paint mixing",
                    "Campfire flames dancing at night",
                  ].map((quickPrompt, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setPrompt(quickPrompt)}
                    >
                      <span className="text-sm">{quickPrompt}</span>
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
                <CardTitle>Generated Videos</CardTitle>
                <CardDescription>Your AI-generated videos will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                        <RefreshCwIcon className="w-8 h-8 text-accent animate-spin" />
                      </div>
                      <div>
                        <p className="font-medium">Generating your video...</p>
                        <p className="text-sm text-muted-foreground">This may take several minutes</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <ClockIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Estimated: 3-8 minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : generatedVideos.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      {generatedVideos.map((video, index) => (
                        <VideoPlayer key={index} src={video.dataUrl} filename={video.filename} index={index} isGif={video.isGif} />
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                          <RefreshCwIcon className="w-3 h-3" />
                          Regenerate
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                          <UploadIcon className="w-3 h-3" />
                          Extend Video
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{generatedVideos.length} videos generated</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <VideoIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Ready to create</p>
                        <p className="text-sm text-muted-foreground">
                          Enter a prompt and click generate to start creating videos
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

function VideoPlayer({ src, filename, index, isGif }: { src: string; filename: string; index: number; isGif?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  return (
    <div className="group relative bg-muted rounded-lg overflow-hidden">
      <div className="aspect-video bg-muted flex items-center justify-center">
        <img
          src={src || "/placeholder.svg"}
          alt={`Generated video ${index + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full w-12 h-12 p-0"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
              </Button>
              <span className="text-white text-sm">0:00 / {4}:00</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white hover:bg-white/20 gap-1"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = src
                  link.download = filename
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                <DownloadIcon className="w-3 h-3" />
                Download
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 gap-1">
                <ShareIcon className="w-3 h-3" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
