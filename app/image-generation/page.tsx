"use client"
import { useState } from "react"
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
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState("dall-e-3")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [steps, setSteps] = useState([30])
  const [cfgScale, setCfgScale] = useState([7])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      const newImages = [
        `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(prompt)}`,
        `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(prompt + " variation 1")}`,
        `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(prompt + " variation 2")}`,
        `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(prompt + " variation 3")}`,
      ]
      setGeneratedImages(newImages)
      setIsGenerating(false)
    }, 3000)
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
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black font-[var(--font-montserrat)] text-foreground">Image Generation</h1>
                  <p className="text-sm font-medium text-foreground/80">Create stunning images with AI</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                    <Label className="font-semibold text-foreground">AI Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dall-e-3">DALL-E 3 (Online)</SelectItem>
                        <SelectItem value="dall-e-2">DALL-E 2 (Online)</SelectItem>
                        <SelectItem value="stable-diffusion">Stable Diffusion (Local)</SelectItem>
                        <SelectItem value="midjourney">Midjourney (Online)</SelectItem>
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
                      <span className="text-sm font-medium text-foreground/70">{cfgScale[0]}</span>
                    </div>
                    <Slider
                      value={cfgScale}
                      onValueChange={setCfgScale}
                      max={20}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
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
                              src={image || "/placeholder.svg"}
                              alt={`Generated image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <Button size="sm" variant="secondary" className="gap-1">
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
