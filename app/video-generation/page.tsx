"use client"
import { useState } from "react"
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
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState("runway-gen2")
  const [duration, setDuration] = useState([4])
  const [fps, setFps] = useState([24])
  const [resolution, setResolution] = useState("1024x576")
  const [motionStrength, setMotionStrength] = useState([5])
  const [seedImage, setSeedImage] = useState<string | null>(null)
  const [useAudio, setUseAudio] = useState(false)
  const [audioPrompt, setAudioPrompt] = useState("")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      const newVideos = [
        `/placeholder.svg?height=576&width=1024&query=${encodeURIComponent("Video: " + prompt)}`,
        `/placeholder.svg?height=576&width=1024&query=${encodeURIComponent("Video: " + prompt + " alt version")}`,
      ]
      setGeneratedVideos(newVideos)
      setIsGenerating(false)
    }, 8000)
  }

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
                    <Label>AI Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="runway-gen2">Runway Gen-2 (Online)</SelectItem>
                        <SelectItem value="pika-labs">Pika Labs (Online)</SelectItem>
                        <SelectItem value="stable-video">Stable Video Diffusion (Local)</SelectItem>
                        <SelectItem value="zeroscope">Zeroscope (Local)</SelectItem>
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
                    <Slider value={fps} onValueChange={setFps} max={60} min={12} step={6} className="w-full" />
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
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCwIcon className="w-4 h-4 animate-spin" />
                      Generating...
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
                        <VideoPlayer key={index} src={video} index={index} />
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

function VideoPlayer({ src, index }: { src: string; index: number }) {
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
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 gap-1">
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
