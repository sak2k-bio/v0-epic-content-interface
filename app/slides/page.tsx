"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeftIcon,
  SparklesIcon,
  DownloadIcon,
  ShareIcon,
  RefreshCwIcon,
  PresentationIcon,
  SettingsIcon,
  WandIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  CopyIcon,
  PlayIcon,
  FileTextIcon,
  ImageIcon,
  TypeIcon,
  LayoutIcon,
  PaletteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  UndoIcon,
  RedoIcon,
  SaveIcon,
  ZoomInIcon,
  ZoomOutIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "lucide-react"
import Link from "next/link"

interface SlideElement {
  id: string
  type: "text" | "image" | "chart"
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  style: Record<string, string>
  zIndex: number
}

interface Slide {
  id: string
  title: string
  elements: SlideElement[]
  layout: string
  background: string
  notes: string
}

interface Presentation {
  title: string
  slides: Slide[]
  theme: string
  template: string
}

export default function SlidesPage() {
  const [activeTab, setActiveTab] = useState("design")
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(100)
  const [isAutoSave, setIsAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date>(new Date())
  const canvasRef = useRef<HTMLDivElement>(null)

  const [presentation, setPresentation] = useState<Presentation>({
    title: "My Presentation",
    theme: "modern",
    template: "business",
    slides: [
      {
        id: "1",
        title: "Title Slide",
        layout: "title",
        background: "#ffffff",
        notes: "Welcome slide - introduce yourself and the presentation topic",
        elements: [
          {
            id: "title",
            type: "text",
            content: "Welcome to My Presentation",
            position: { x: 10, y: 25 },
            size: { width: 80, height: 20 },
            style: { fontSize: "36px", fontWeight: "bold", textAlign: "center", color: "#1a1a1a" },
            zIndex: 1,
          },
          {
            id: "subtitle",
            type: "text",
            content: "A professional presentation created with AI",
            position: { x: 15, y: 55 },
            size: { width: 70, height: 15 },
            style: { fontSize: "20px", textAlign: "center", color: "#666666" },
            zIndex: 2,
          },
        ],
      },
      {
        id: "2",
        title: "Content Slide",
        layout: "content",
        background: "#ffffff",
        notes: "Key points to cover in this section",
        elements: [
          {
            id: "heading",
            type: "text",
            content: "Key Points",
            position: { x: 10, y: 15 },
            size: { width: 80, height: 15 },
            style: { fontSize: "32px", fontWeight: "bold", color: "#1a1a1a" },
            zIndex: 1,
          },
          {
            id: "content",
            type: "text",
            content: "• First important point\n• Second key insight\n• Third valuable takeaway",
            position: { x: 10, y: 35 },
            size: { width: 80, height: 50 },
            style: { fontSize: "20px", lineHeight: "1.8", color: "#333333" },
            zIndex: 2,
          },
        ],
      },
    ],
  })

  const currentSlide = presentation.slides[currentSlideIndex]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            handleSave()
            break
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              handleRedo()
            } else {
              handleUndo()
            }
            break
          case "d":
            e.preventDefault()
            if (currentSlideIndex < presentation.slides.length - 1) {
              duplicateSlide(currentSlideIndex)
            }
            break
          case "n":
            e.preventDefault()
            addSlide()
            break
        }
      }

      // Arrow keys for slide navigation
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case "ArrowLeft":
            if (currentSlideIndex > 0) {
              setCurrentSlideIndex(currentSlideIndex - 1)
            }
            break
          case "ArrowRight":
            if (currentSlideIndex < presentation.slides.length - 1) {
              setCurrentSlideIndex(currentSlideIndex + 1)
            }
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentSlideIndex, presentation.slides.length])

  useEffect(() => {
    if (isAutoSave) {
      const autoSaveInterval = setInterval(() => {
        handleSave()
      }, 30000) // Auto-save every 30 seconds

      return () => clearInterval(autoSaveInterval)
    }
  }, [isAutoSave, presentation])

  const handleSave = useCallback(() => {
    // Simulate save operation
    setLastSaved(new Date())
    console.log("[v0] Presentation saved")
  }, [])

  const handleUndo = useCallback(() => {
    // Placeholder for undo functionality
    console.log("[v0] Undo action")
  }, [])

  const handleRedo = useCallback(() => {
    // Placeholder for redo functionality
    console.log("[v0] Redo action")
  }, [])

  const handleGenerateFromAI = async () => {
    if (!aiPrompt.trim()) return
    setIsGenerating(true)

    setTimeout(() => {
      const newSlide: Slide = {
        id: Date.now().toString(),
        title: "AI Generated Slide",
        layout: "content",
        background: "#ffffff",
        notes: `Generated from prompt: ${aiPrompt}`,
        elements: [
          {
            id: "ai-title",
            type: "text",
            content: "AI Generated Content",
            position: { x: 10, y: 15 },
            size: { width: 80, height: 15 },
            style: { fontSize: "32px", fontWeight: "bold", color: "#1a1a1a" },
            zIndex: 1,
          },
          {
            id: "ai-content",
            type: "text",
            content: `This slide was generated based on your prompt:\n\n"${aiPrompt}"\n\nKey insights and recommendations will be displayed here with proper formatting and structure.`,
            position: { x: 10, y: 35 },
            size: { width: 80, height: 50 },
            style: { fontSize: "18px", lineHeight: "1.6", color: "#333333" },
            zIndex: 2,
          },
        ],
      }
      setPresentation({
        ...presentation,
        slides: [...presentation.slides, newSlide],
      })
      setCurrentSlideIndex(presentation.slides.length)
      setIsGenerating(false)
      setAiPrompt("")
    }, 2000)
  }

  const addSlide = (template?: string) => {
    const slideNumber = presentation.slides.length + 1
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slideNumber}`,
      layout: template || "content",
      background: "#ffffff",
      notes: `Notes for slide ${slideNumber}`,
      elements: [
        {
          id: "new-title",
          type: "text",
          content: `Slide ${slideNumber} Title`,
          position: { x: 10, y: 15 },
          size: { width: 80, height: 15 },
          style: { fontSize: "32px", fontWeight: "bold", color: "#1a1a1a" },
          zIndex: 1,
        },
      ],
    }
    setPresentation({
      ...presentation,
      slides: [...presentation.slides, newSlide],
    })
    setCurrentSlideIndex(presentation.slides.length)
  }

  const deleteSlide = (index: number) => {
    if (presentation.slides.length <= 1) return
    const newSlides = presentation.slides.filter((_, i) => i !== index)
    setPresentation({ ...presentation, slides: newSlides })
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1)
    }
  }

  const duplicateSlide = (index: number) => {
    const slideToClone = presentation.slides[index]
    const newSlide: Slide = {
      ...slideToClone,
      id: Date.now().toString(),
      title: slideToClone.title + " (Copy)",
      elements: slideToClone.elements.map((el) => ({
        ...el,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      })),
    }
    const newSlides = [...presentation.slides]
    newSlides.splice(index + 1, 0, newSlide)
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(index + 1)
  }

  const updateSlideElement = (elementId: string, updates: Partial<SlideElement>) => {
    const updatedSlides = presentation.slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: slide.elements.map((el) => (el.id === elementId ? { ...el, ...updates } : el)),
        }
      }
      return slide
    })
    setPresentation({ ...presentation, slides: updatedSlides })
  }

  const addElement = (type: "text" | "image" | "chart") => {
    const newElement: SlideElement = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      content: type === "text" ? "New text element" : type === "image" ? "Image placeholder" : "Chart placeholder",
      position: { x: 20, y: 30 },
      size: { width: 60, height: 20 },
      style: {
        fontSize: "18px",
        fontWeight: "normal",
        textAlign: "left",
        color: "#333333",
      },
      zIndex: currentSlide.elements.length + 1,
    }

    const updatedSlides = presentation.slides.map((slide, index) =>
      index === currentSlideIndex ? { ...slide, elements: [...slide.elements, newElement] } : slide,
    )
    setPresentation({ ...presentation, slides: updatedSlides })
    setSelectedElement(newElement.id)
  }

  const moveSlide = (fromIndex: number, toIndex: number) => {
    const newSlides = [...presentation.slides]
    const [movedSlide] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, movedSlide)
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(toIndex)
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
                  <PresentationIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black font-[var(--font-montserrat)] text-foreground">Slide Creator</h1>
                  <p className="text-sm text-foreground/70">Design professional presentations</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                <Switch checked={isAutoSave} onCheckedChange={setIsAutoSave} className="scale-75" />
                <span>Auto-save</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" onClick={handleSave} className="gap-1 bg-transparent">
                <SaveIcon className="w-3 h-3" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleUndo} className="gap-1 bg-transparent">
                <UndoIcon className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRedo} className="gap-1 bg-transparent">
                <RedoIcon className="w-3 h-3" />
              </Button>
              <Badge variant="secondary" className="gap-1">
                <FileTextIcon className="w-3 h-3" />
                {presentation.slides.length} slides
              </Badge>
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                <PlayIcon className="w-3 h-3" />
                Present
              </Button>
              <Button variant="outline" size="sm">
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Slides</CardTitle>
                  <div className="flex gap-1">
                    <Button onClick={() => addSlide()} size="sm" className="gap-1 h-7 px-2">
                      <PlusIcon className="w-3 h-3" />
                      Add
                    </Button>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button onClick={() => addSlide("title")} variant="outline" size="sm" className="h-6 px-2 text-xs">
                    Title
                  </Button>
                  <Button onClick={() => addSlide("content")} variant="outline" size="sm" className="h-6 px-2 text-xs">
                    Content
                  </Button>
                  <Button
                    onClick={() => addSlide("two-column")}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    2-Col
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {presentation.slides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className={`group relative p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                          index === currentSlideIndex
                            ? "border-accent bg-accent/10 shadow-sm"
                            : "border-border hover:border-accent/50"
                        }`}
                        onClick={() => setCurrentSlideIndex(index)}
                        draggable
                        onDragStart={(e) => {
                          setIsDragging(true)
                          e.dataTransfer.setData("text/plain", index.toString())
                        }}
                        onDragEnd={() => setIsDragging(false)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const fromIndex = Number.parseInt(e.dataTransfer.getData("text/plain"))
                          if (fromIndex !== index) {
                            moveSlide(fromIndex, index)
                          }
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <GripVerticalIcon className="w-3 h-3 text-foreground/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex-1 min-w-0">
                            <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center text-xs text-foreground/60 relative overflow-hidden">
                              <span>Slide {index + 1}</span>
                              {slide.elements.length > 0 && (
                                <div className="absolute inset-1 bg-white/50 rounded-sm"></div>
                              )}
                            </div>
                            <p className="text-xs font-medium truncate text-foreground">{slide.title}</p>
                            <p className="text-xs text-foreground/60 truncate">{slide.elements.length} elements</p>
                          </div>
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-background/80"
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateSlide(index)
                            }}
                          >
                            <CopyIcon className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSlide(index)
                            }}
                            disabled={presentation.slides.length <= 1}
                          >
                            <TrashIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Slide Editor</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setZoom(Math.max(25, zoom - 25))}
                        className="h-7 w-7 p-0"
                      >
                        <ZoomOutIcon className="w-3 h-3" />
                      </Button>
                      <span className="text-xs text-foreground/70 min-w-[3rem] text-center">{zoom}%</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setZoom(Math.min(200, zoom + 25))}
                        className="h-7 w-7 p-0"
                      >
                        <ZoomInIcon className="w-3 h-3" />
                      </Button>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeftIcon className="w-3 h-3" />
                    </Button>
                    <span className="text-sm text-foreground/70 min-w-[3rem] text-center">
                      {currentSlideIndex + 1} / {presentation.slides.length}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))
                      }
                      disabled={currentSlideIndex === presentation.slides.length - 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronRightIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  ref={canvasRef}
                  className="aspect-video bg-white border border-border rounded-lg relative overflow-hidden shadow-sm"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
                  onClick={() => setSelectedElement(null)}
                >
                  {currentSlide.elements
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map((element) => (
                      <div
                        key={element.id}
                        className={`absolute border-2 cursor-pointer group transition-all duration-150 ${
                          selectedElement === element.id
                            ? "border-accent shadow-lg"
                            : "border-transparent hover:border-accent/50"
                        }`}
                        style={{
                          left: `${element.position.x}%`,
                          top: `${element.position.y}%`,
                          width: `${element.size.width}%`,
                          height: `${element.size.height}%`,
                          zIndex: element.zIndex,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedElement(element.id)
                        }}
                      >
                        {element.type === "text" && (
                          <div
                            className="w-full h-full flex items-center p-2"
                            style={{
                              fontSize: element.style.fontSize,
                              fontWeight: element.style.fontWeight,
                              textAlign: element.style.textAlign as any,
                              color: element.style.color,
                              lineHeight: element.style.lineHeight,
                            }}
                          >
                            <div className="w-full whitespace-pre-line">{element.content}</div>
                          </div>
                        )}
                        {element.type === "image" && (
                          <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-foreground/40" />
                          </div>
                        )}
                        {selectedElement === element.id && (
                          <div className="absolute -top-1 -right-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 bg-white shadow-sm border border-border hover:bg-accent/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                const updatedSlides = presentation.slides.map((slide, slideIndex) =>
                                  slideIndex === currentSlideIndex
                                    ? { ...slide, elements: slide.elements.filter((el) => el.id !== element.id) }
                                    : slide,
                                )
                                setPresentation({ ...presentation, slides: updatedSlides })
                                setSelectedElement(null)
                              }}
                            >
                              <TrashIcon className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-transparent"
                      onClick={() => addElement("text")}
                    >
                      <TypeIcon className="w-3 h-3" />
                      Add Text
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-transparent"
                      onClick={() => addElement("image")}
                    >
                      <ImageIcon className="w-3 h-3" />
                      Add Image
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                      <LayoutIcon className="w-3 h-3" />
                      Layout
                    </Button>
                    {selectedElement && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-transparent">
                            <BoldIcon className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-transparent">
                            <ItalicIcon className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-transparent">
                            <UnderlineIcon className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-transparent">
                            <AlignLeftIcon className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-transparent">
                            <AlignCenterIcon className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-transparent">
                            <AlignRightIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
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
              </CardContent>
            </Card>
          </div>

          {/* Properties Panel */}
          <div className="lg:col-span-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="ai">AI</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <PaletteIcon className="w-4 h-4" />
                      Presentation Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="presentation-title">Title</Label>
                      <Input
                        id="presentation-title"
                        value={presentation.title}
                        onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
                        placeholder="Presentation title..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select
                        value={presentation.theme}
                        onValueChange={(value) => setPresentation({ ...presentation, theme: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select
                        value={presentation.template}
                        onValueChange={(value) => setPresentation({ ...presentation, template: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="research">Research</SelectItem>
                          <SelectItem value="startup">Startup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Slide Layout</Label>
                      <Select
                        value={currentSlide.layout}
                        onValueChange={(value) => {
                          const updatedSlides = presentation.slides.map((slide, index) =>
                            index === currentSlideIndex ? { ...slide, layout: value } : slide,
                          )
                          setPresentation({ ...presentation, slides: updatedSlides })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title">Title Slide</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="two-column">Two Column</SelectItem>
                          <SelectItem value="image-text">Image + Text</SelectItem>
                          <SelectItem value="full-image">Full Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedElement && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <Label>Selected Element</Label>
                          <div className="space-y-2">
                            <Label className="text-xs">Font Size</Label>
                            <Slider
                              value={[
                                Number.parseInt(
                                  currentSlide.elements.find((el) => el.id === selectedElement)?.style.fontSize || "18",
                                ),
                              ]}
                              onValueChange={(value) => {
                                updateSlideElement(selectedElement, {
                                  style: {
                                    ...currentSlide.elements.find((el) => el.id === selectedElement)?.style,
                                    fontSize: `${value[0]}px`,
                                  },
                                })
                              }}
                              max={72}
                              min={8}
                              step={2}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Text Color</Label>
                            <Input
                              type="color"
                              value={
                                currentSlide.elements.find((el) => el.id === selectedElement)?.style.color || "#333333"
                              }
                              onChange={(e) => {
                                updateSlideElement(selectedElement, {
                                  style: {
                                    ...currentSlide.elements.find((el) => el.id === selectedElement)?.style,
                                    color: e.target.value,
                                  },
                                })
                              }}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <EditIcon className="w-4 h-4" />
                      Slide Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slide-title">Slide Title</Label>
                      <Input
                        id="slide-title"
                        value={currentSlide.title}
                        onChange={(e) => {
                          const updatedSlides = presentation.slides.map((slide, index) =>
                            index === currentSlideIndex ? { ...slide, title: e.target.value } : slide,
                          )
                          setPresentation({ ...presentation, slides: updatedSlides })
                        }}
                        placeholder="Slide title..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slide-notes">Speaker Notes</Label>
                      <Textarea
                        id="slide-notes"
                        value={currentSlide.notes}
                        onChange={(e) => {
                          const updatedSlides = presentation.slides.map((slide, index) =>
                            index === currentSlideIndex ? { ...slide, notes: e.target.value } : slide,
                          )
                          setPresentation({ ...presentation, slides: updatedSlides })
                        }}
                        placeholder="Add speaker notes for this slide..."
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Elements</Label>
                      {currentSlide.elements.map((element, index) => (
                        <div
                          key={element.id}
                          className={`p-3 border rounded-lg space-y-2 transition-colors ${
                            selectedElement === element.id ? "border-accent bg-accent/5" : "border-border"
                          }`}
                          onClick={() => setSelectedElement(element.id)}
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {element.type}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                const updatedSlides = presentation.slides.map((slide, slideIndex) =>
                                  slideIndex === currentSlideIndex
                                    ? { ...slide, elements: slide.elements.filter((el) => el.id !== element.id) }
                                    : slide,
                                )
                                setPresentation({ ...presentation, slides: updatedSlides })
                                if (selectedElement === element.id) {
                                  setSelectedElement(null)
                                }
                              }}
                            >
                              <TrashIcon className="w-3 h-3" />
                            </Button>
                          </div>
                          <Textarea
                            value={element.content}
                            onChange={(e) => updateSlideElement(element.id, { content: e.target.value })}
                            placeholder="Element content..."
                            className="text-sm min-h-[60px] resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <WandIcon className="w-4 h-4" />
                      AI Slide Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-prompt">Describe your slide</Label>
                      <Textarea
                        id="ai-prompt"
                        placeholder="e.g., 'Create a slide about quarterly sales results with key metrics and growth trends'"
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
                          Generate Slide
                        </>
                      )}
                    </Button>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Quick Prompts</Label>
                      <div className="space-y-1">
                        {[
                          "Introduction slide with company overview",
                          "Problem statement and solution overview",
                          "Market analysis with key statistics",
                          "Product features and benefits comparison",
                          "Financial projections and growth metrics",
                          "Team introduction and key roles",
                          "Thank you and contact information",
                        ].map((prompt, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start text-left h-auto p-2 text-xs hover:bg-accent/10"
                            onClick={() => setAiPrompt(prompt)}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
