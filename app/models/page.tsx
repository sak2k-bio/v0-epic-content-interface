"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeftIcon,
  DownloadIcon,
  RefreshCwIcon,
  BrainIcon,
  SettingsIcon,
  TrashIcon,
  CloudIcon,
  MonitorIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  PlayIcon,
  PauseIcon,
  StampIcon as StopIcon,
  HardDriveIcon,
  WifiIcon,
  CpuIcon,
  MemoryStickIcon,
  DatabaseIcon,
} from "lucide-react"
import Link from "next/link"

interface AIModel {
  id: string
  name: string
  type: "image" | "video" | "text" | "audio"
  provider: "local" | "online"
  status: "active" | "inactive" | "downloading" | "error"
  version: string
  size: string
  description: string
  capabilities: string[]
  performance: {
    speed: number
    quality: number
    memory: string
  }
  downloadProgress?: number
}

export default function ModelsPage() {
  const [activeTab, setActiveTab] = useState("installed")
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [isInstalling, setIsInstalling] = useState<string | null>(null)
  const [models, setModels] = useState<AIModel[]>([
    {
      id: "dall-e-3",
      name: "DALL-E 3",
      type: "image",
      provider: "online",
      status: "active",
      version: "3.0",
      size: "N/A",
      description: "OpenAI's most advanced image generation model with exceptional quality and prompt adherence",
      capabilities: ["High-resolution images", "Complex prompts", "Style consistency", "Text in images"],
      performance: { speed: 8, quality: 10, memory: "Cloud" },
    },
    {
      id: "stable-diffusion-xl",
      name: "Stable Diffusion XL",
      type: "image",
      provider: "local",
      status: "inactive",
      version: "1.0",
      size: "6.9 GB",
      description: "High-quality open-source image generation model optimized for local deployment",
      capabilities: ["1024x1024 images", "Fine-tuning support", "ControlNet compatible", "Fast inference"],
      performance: { speed: 6, quality: 8, memory: "8 GB VRAM" },
    },
    {
      id: "runway-gen2",
      name: "Runway Gen-2",
      type: "video",
      provider: "online",
      status: "active",
      version: "2.0",
      size: "N/A",
      description: "Advanced video generation model capable of creating high-quality video content",
      capabilities: ["Text-to-video", "Image-to-video", "Video editing", "Motion control"],
      performance: { speed: 5, quality: 9, memory: "Cloud" },
    },
    {
      id: "stable-video-diffusion",
      name: "Stable Video Diffusion",
      type: "video",
      provider: "local",
      status: "downloading",
      version: "1.1",
      size: "4.2 GB",
      description: "Open-source video generation model for local deployment",
      capabilities: ["Image-to-video", "Short clips", "Customizable", "Privacy-focused"],
      performance: { speed: 4, quality: 7, memory: "12 GB VRAM" },
      downloadProgress: 65,
    },
    {
      id: "gpt-4-vision",
      name: "GPT-4 Vision",
      type: "text",
      provider: "online",
      status: "active",
      version: "4.0",
      size: "N/A",
      description: "Multimodal language model with vision capabilities for content analysis",
      capabilities: ["Image analysis", "Text generation", "Code generation", "Reasoning"],
      performance: { speed: 9, quality: 10, memory: "Cloud" },
    },
    {
      id: "whisper-large",
      name: "Whisper Large",
      type: "audio",
      provider: "local",
      status: "inactive",
      version: "3.0",
      size: "1.5 GB",
      description: "OpenAI's speech recognition model for audio transcription and translation",
      capabilities: ["Speech-to-text", "Multi-language", "Noise robust", "Real-time"],
      performance: { speed: 7, quality: 9, memory: "4 GB RAM" },
    },
  ])

  const availableModels: AIModel[] = [
    {
      id: "midjourney-v6",
      name: "Midjourney v6",
      type: "image",
      provider: "online",
      status: "inactive",
      version: "6.0",
      size: "N/A",
      description: "Latest Midjourney model with improved photorealism and artistic capabilities",
      capabilities: ["Photorealistic images", "Artistic styles", "Consistent characters", "Upscaling"],
      performance: { speed: 7, quality: 10, memory: "Cloud" },
    },
    {
      id: "llama-2-70b",
      name: "Llama 2 70B",
      type: "text",
      provider: "local",
      status: "inactive",
      version: "2.0",
      size: "140 GB",
      description: "Meta's large language model for advanced text generation and reasoning",
      capabilities: ["Text generation", "Code completion", "Reasoning", "Multi-turn chat"],
      performance: { speed: 5, quality: 9, memory: "80 GB VRAM" },
    },
    {
      id: "musicgen-large",
      name: "MusicGen Large",
      type: "audio",
      provider: "local",
      status: "inactive",
      version: "1.0",
      size: "3.3 GB",
      description: "Meta's music generation model for creating original compositions",
      capabilities: ["Music generation", "Style control", "Melody conditioning", "Multi-instrument"],
      performance: { speed: 6, quality: 8, memory: "6 GB VRAM" },
    },
  ]

  const handleInstallModel = async (modelId: string) => {
    setIsInstalling(modelId)
    // Simulate installation
    setTimeout(() => {
      const modelToInstall = availableModels.find((m) => m.id === modelId)
      if (modelToInstall) {
        setModels([...models, { ...modelToInstall, status: "inactive" }])
      }
      setIsInstalling(null)
    }, 3000)
  }

  const handleToggleModel = (modelId: string) => {
    setModels(
      models.map((model) =>
        model.id === modelId ? { ...model, status: model.status === "active" ? "inactive" : "active" } : model,
      ),
    )
  }

  const handleDeleteModel = (modelId: string) => {
    setModels(models.filter((model) => model.id !== modelId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case "inactive":
        return <XCircleIcon className="w-4 h-4 text-muted-foreground" />
      case "downloading":
        return <RefreshCwIcon className="w-4 h-4 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircleIcon className="w-4 h-4 text-red-500" />
      default:
        return <XCircleIcon className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🎨"
      case "video":
        return "🎬"
      case "text":
        return "📝"
      case "audio":
        return "🎵"
      default:
        return "🤖"
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
                  <BrainIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black font-[var(--font-montserrat)] text-foreground">Model Management</h1>
                  <p className="text-sm text-muted-foreground">Manage your AI models and configurations</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <DatabaseIcon className="w-3 h-3" />
                {models.filter((m) => m.status === "active").length} active
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
          {/* Models List */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="installed">Installed</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              <TabsContent value="installed" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Installed Models</CardTitle>
                    <CardDescription>Models currently installed on your system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {models.map((model) => (
                        <div
                          key={model.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedModel?.id === model.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50"
                          }`}
                          onClick={() => setSelectedModel(model)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{getTypeIcon(model.type)}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{model.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    v{model.version}
                                  </Badge>
                                  {model.provider === "local" ? (
                                    <MonitorIcon className="w-3 h-3 text-muted-foreground" />
                                  ) : (
                                    <CloudIcon className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>Size: {model.size}</span>
                                  <span>Type: {model.type}</span>
                                  <span>Memory: {model.performance.memory}</span>
                                </div>
                                {model.status === "downloading" && model.downloadProgress && (
                                  <div className="mt-2">
                                    <Progress value={model.downloadProgress} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Downloading... {model.downloadProgress}%
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(model.status)}
                              <Switch
                                checked={model.status === "active"}
                                onCheckedChange={() => handleToggleModel(model.id)}
                                disabled={model.status === "downloading"}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="available" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Models</CardTitle>
                    <CardDescription>Models available for installation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {availableModels
                        .filter((model) => !models.find((m) => m.id === model.id))
                        .map((model) => (
                          <div key={model.id} className="p-4 border border-border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">{getTypeIcon(model.type)}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium">{model.name}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      v{model.version}
                                    </Badge>
                                    {model.provider === "local" ? (
                                      <MonitorIcon className="w-3 h-3 text-muted-foreground" />
                                    ) : (
                                      <CloudIcon className="w-3 h-3 text-muted-foreground" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Size: {model.size}</span>
                                    <span>Type: {model.type}</span>
                                    <span>Memory: {model.performance.memory}</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleInstallModel(model.id)}
                                disabled={isInstalling === model.id}
                                className="gap-2"
                              >
                                {isInstalling === model.id ? (
                                  <>
                                    <RefreshCwIcon className="w-4 h-4 animate-spin" />
                                    Installing...
                                  </>
                                ) : (
                                  <>
                                    <DownloadIcon className="w-4 h-4" />
                                    Install
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Information</CardTitle>
                    <CardDescription>Hardware and system status for AI model execution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CpuIcon className="w-4 h-4 text-muted-foreground" />
                            <Label>CPU Usage</Label>
                          </div>
                          <Progress value={35} className="h-2" />
                          <p className="text-xs text-muted-foreground">35% - Intel i7-12700K</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MemoryStickIcon className="w-4 h-4 text-muted-foreground" />
                            <Label>GPU Memory</Label>
                          </div>
                          <Progress value={60} className="h-2" />
                          <p className="text-xs text-muted-foreground">12GB / 20GB - RTX 4090</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <HardDriveIcon className="w-4 h-4 text-muted-foreground" />
                            <Label>Storage</Label>
                          </div>
                          <Progress value={45} className="h-2" />
                          <p className="text-xs text-muted-foreground">450GB / 1TB SSD</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <WifiIcon className="w-4 h-4 text-muted-foreground" />
                            <Label>Network</Label>
                          </div>
                          <Progress value={85} className="h-2" />
                          <p className="text-xs text-muted-foreground">850 Mbps - Connected</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Active Processes</h4>
                        <div className="space-y-2">
                          {models
                            .filter((m) => m.status === "active")
                            .map((model) => (
                              <div key={model.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-sm">{model.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{model.performance.memory}</span>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                    <StopIcon className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Model Details */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Model Details</CardTitle>
                <CardDescription>
                  {selectedModel ? `Information about ${selectedModel.name}` : "Select a model to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedModel ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{getTypeIcon(selectedModel.type)}</div>
                      <h3 className="font-bold text-lg">{selectedModel.name}</h3>
                      <p className="text-sm text-muted-foreground">Version {selectedModel.version}</p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(selectedModel.status)}
                          <span className="text-sm capitalize">{selectedModel.status}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Provider</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedModel.provider === "local" ? (
                            <MonitorIcon className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <CloudIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-sm capitalize">{selectedModel.provider}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Performance</Label>
                        <div className="space-y-2 mt-1">
                          <div className="flex justify-between text-sm">
                            <span>Speed</span>
                            <span>{selectedModel.performance.speed}/10</span>
                          </div>
                          <Progress value={selectedModel.performance.speed * 10} className="h-1" />
                          <div className="flex justify-between text-sm">
                            <span>Quality</span>
                            <span>{selectedModel.performance.quality}/10</span>
                          </div>
                          <Progress value={selectedModel.performance.quality * 10} className="h-1" />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Capabilities</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedModel.capabilities.map((capability, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Button
                        className="w-full gap-2"
                        variant={selectedModel.status === "active" ? "outline" : "default"}
                        onClick={() => handleToggleModel(selectedModel.id)}
                        disabled={selectedModel.status === "downloading"}
                      >
                        {selectedModel.status === "active" ? (
                          <>
                            <PauseIcon className="w-4 h-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-4 h-4" />
                            Activate
                          </>
                        )}
                      </Button>
                      {selectedModel.provider === "local" && (
                        <Button
                          variant="outline"
                          className="w-full gap-2 bg-transparent"
                          onClick={() => handleDeleteModel(selectedModel.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                          Uninstall
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BrainIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a model to view details</p>
                    <p className="text-sm">Click on any model from the list</p>
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
