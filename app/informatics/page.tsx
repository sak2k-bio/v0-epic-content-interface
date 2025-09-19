"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeftIcon,
  SparklesIcon,
  DownloadIcon,
  ShareIcon,
  RefreshCwIcon,
  BarChart3Icon,
  SettingsIcon,
  WandIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  PieChartIcon,
  BarChartIcon,
  LineChartIcon,
  TrendingUpIcon,
  DatabaseIcon,
  LayoutIcon,
} from "lucide-react"
import Link from "next/link"

interface DataPoint {
  id: string
  label: string
  value: number
  color?: string
}

interface ChartConfig {
  title: string
  type: "bar" | "pie" | "line" | "area"
  data: DataPoint[]
  colorScheme: string
}

export default function InformaticsPage() {
  const [activeTab, setActiveTab] = useState("design")
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    title: "Sample Data Visualization",
    type: "bar",
    data: [
      { id: "1", label: "Category A", value: 45, color: "#8b5cf6" },
      { id: "2", label: "Category B", value: 32, color: "#06b6d4" },
      { id: "3", label: "Category C", value: 28, color: "#10b981" },
      { id: "4", label: "Category D", value: 15, color: "#f59e0b" },
    ],
    colorScheme: "modern",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("business-report")

  const handleGenerateFromAI = async () => {
    if (!aiPrompt.trim()) return
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setChartConfig({
        title: "AI Generated Visualization",
        type: "pie",
        data: [
          { id: "1", label: "AI Generated A", value: 35, color: "#8b5cf6" },
          { id: "2", label: "AI Generated B", value: 25, color: "#06b6d4" },
          { id: "3", label: "AI Generated C", value: 20, color: "#10b981" },
          { id: "4", label: "AI Generated D", value: 20, color: "#f59e0b" },
        ],
        colorScheme: "modern",
      })
      setIsGenerating(false)
    }, 3000)
  }

  const addDataPoint = () => {
    const newPoint: DataPoint = {
      id: Date.now().toString(),
      label: `New Item ${chartConfig.data.length + 1}`,
      value: 10,
      color: "#8b5cf6",
    }
    setChartConfig({
      ...chartConfig,
      data: [...chartConfig.data, newPoint],
    })
  }

  const removeDataPoint = (id: string) => {
    setChartConfig({
      ...chartConfig,
      data: chartConfig.data.filter((point) => point.id !== id),
    })
  }

  const updateDataPoint = (id: string, field: keyof DataPoint, value: string | number) => {
    setChartConfig({
      ...chartConfig,
      data: chartConfig.data.map((point) => (point.id === id ? { ...point, [field]: value } : point)),
    })
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
                  <BarChart3Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black font-[var(--font-montserrat)] text-foreground">
                    Informatics Designer
                  </h1>
                  <p className="text-sm text-muted-foreground">Create beautiful data visualizations</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <PieChartIcon className="w-3 h-3" />
                {chartConfig.type.toUpperCase()}
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="ai">AI</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutIcon className="w-5 h-5" />
                      Chart Design
                    </CardTitle>
                    <CardDescription>Customize the appearance of your visualization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chart-title">Chart Title</Label>
                      <Input
                        id="chart-title"
                        value={chartConfig.title}
                        onChange={(e) => setChartConfig({ ...chartConfig, title: e.target.value })}
                        placeholder="Enter chart title..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Chart Type</Label>
                      <Select
                        value={chartConfig.type}
                        onValueChange={(value: "bar" | "pie" | "line" | "area") =>
                          setChartConfig({ ...chartConfig, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">
                            <div className="flex items-center gap-2">
                              <BarChartIcon className="w-4 h-4" />
                              Bar Chart
                            </div>
                          </SelectItem>
                          <SelectItem value="pie">
                            <div className="flex items-center gap-2">
                              <PieChartIcon className="w-4 h-4" />
                              Pie Chart
                            </div>
                          </SelectItem>
                          <SelectItem value="line">
                            <div className="flex items-center gap-2">
                              <LineChartIcon className="w-4 h-4" />
                              Line Chart
                            </div>
                          </SelectItem>
                          <SelectItem value="area">
                            <div className="flex items-center gap-2">
                              <TrendingUpIcon className="w-4 h-4" />
                              Area Chart
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Color Scheme</Label>
                      <Select
                        value={chartConfig.colorScheme}
                        onValueChange={(value) => setChartConfig({ ...chartConfig, colorScheme: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern Purple</SelectItem>
                          <SelectItem value="business">Business Blue</SelectItem>
                          <SelectItem value="nature">Nature Green</SelectItem>
                          <SelectItem value="warm">Warm Orange</SelectItem>
                          <SelectItem value="cool">Cool Teal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business-report">Business Report</SelectItem>
                          <SelectItem value="academic-paper">Academic Paper</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="infographic">Infographic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DatabaseIcon className="w-5 h-5" />
                      Data Points
                    </CardTitle>
                    <CardDescription>Manage your chart data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {chartConfig.data.map((point, index) => (
                        <div key={point.id} className="flex items-center gap-2 p-3 border border-border rounded-lg">
                          <div className="flex-1 space-y-2">
                            <Input
                              value={point.label}
                              onChange={(e) => updateDataPoint(point.id, "label", e.target.value)}
                              placeholder="Label"
                              className="text-sm"
                            />
                            <Input
                              type="number"
                              value={point.value}
                              onChange={(e) => updateDataPoint(point.id, "value", Number(e.target.value))}
                              placeholder="Value"
                              className="text-sm"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <div
                              className="w-6 h-6 rounded border border-border cursor-pointer"
                              style={{ backgroundColor: point.color }}
                              title="Color"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeDataPoint(point.id)}
                              className="p-1 h-6 w-6"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button onClick={addDataPoint} variant="outline" className="w-full gap-2 bg-transparent">
                      <PlusIcon className="w-4 h-4" />
                      Add Data Point
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <WandIcon className="w-5 h-5" />
                      AI Generation
                    </CardTitle>
                    <CardDescription>Generate visualizations with AI</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-prompt">Describe your data visualization</Label>
                      <Textarea
                        id="ai-prompt"
                        placeholder="e.g., 'Create a pie chart showing quarterly sales data with 4 categories'"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                    </div>

                    <Button
                      onClick={handleGenerateFromAI}
                      disabled={!aiPrompt.trim() || isGenerating}
                      className="w-full gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCwIcon className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4" />
                          Generate with AI
                        </>
                      )}
                    </Button>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Quick AI Prompts</Label>
                      <div className="space-y-1">
                        {[
                          "Sales performance by quarter",
                          "Website traffic sources",
                          "Customer satisfaction ratings",
                          "Market share comparison",
                          "Budget allocation breakdown",
                        ].map((prompt, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start text-left h-auto p-2"
                            onClick={() => setAiPrompt(prompt)}
                          >
                            <span className="text-sm">{prompt}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Your data visualization will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Chart Preview */}
                  <div className="bg-muted/30 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-4 w-full">
                      <h3 className="text-xl font-bold font-[var(--font-montserrat)]">{chartConfig.title}</h3>

                      {/* Simulated Chart */}
                      {chartConfig.type === "bar" && (
                        <div className="flex items-end justify-center gap-4 h-48">
                          {chartConfig.data.map((point, index) => (
                            <div key={point.id} className="flex flex-col items-center gap-2">
                              <div
                                className="w-12 rounded-t"
                                style={{
                                  height: `${(point.value / Math.max(...chartConfig.data.map((p) => p.value))) * 150}px`,
                                  backgroundColor: point.color,
                                }}
                              />
                              <span className="text-xs text-muted-foreground">{point.label}</span>
                              <span className="text-xs font-medium">{point.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {chartConfig.type === "pie" && (
                        <div className="flex items-center justify-center">
                          <div className="w-48 h-48 rounded-full border-8 border-muted flex items-center justify-center relative">
                            <span className="text-sm text-muted-foreground">Pie Chart Preview</span>
                            {/* Simplified pie segments */}
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                              {chartConfig.data.map((point, index) => (
                                <div
                                  key={point.id}
                                  className="absolute inset-0"
                                  style={{
                                    background: `conic-gradient(${point.color} 0deg ${
                                      (point.value / chartConfig.data.reduce((sum, p) => sum + p.value, 0)) * 360
                                    }deg, transparent 0deg)`,
                                    transform: `rotate(${
                                      (chartConfig.data.slice(0, index).reduce((sum, p) => sum + p.value, 0) /
                                        chartConfig.data.reduce((sum, p) => sum + p.value, 0)) *
                                      360
                                    }deg)`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {(chartConfig.type === "line" || chartConfig.type === "area") && (
                        <div className="flex items-end justify-center gap-8 h-48 border-l border-b border-muted">
                          {chartConfig.data.map((point, index) => (
                            <div key={point.id} className="flex flex-col items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: point.color,
                                  marginBottom: `${(point.value / Math.max(...chartConfig.data.map((p) => p.value))) * 150}px`,
                                }}
                              />
                              <span className="text-xs text-muted-foreground">{point.label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Legend */}
                      <div className="flex flex-wrap justify-center gap-4 mt-6">
                        {chartConfig.data.map((point) => (
                          <div key={point.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: point.color }} />
                            <span className="text-sm">{point.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                        <EditIcon className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                        <RefreshCwIcon className="w-3 h-3" />
                        Regenerate
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="gap-1">
                        <DownloadIcon className="w-3 h-3" />
                        Export
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                        <ShareIcon className="w-3 h-3" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
