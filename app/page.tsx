"use client"

import type React from "react"
import Link from "next/link"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ImageIcon,
  VideoIcon,
  BarChart3Icon,
  PresentationIcon,
  SettingsIcon,
  SparklesIcon,
  BrainIcon,
  CloudIcon,
  MonitorIcon,
  PlusIcon,
} from "lucide-react"

export default function HomePage() {
  const [activeModel, setActiveModel] = useState<"local" | "online">("online")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black font-[var(--font-montserrat)] text-foreground">Epic AI Studio</h1>
                <p className="text-sm font-medium text-foreground/80">Professional Creative Interface</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                <Button
                  variant={activeModel === "local" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveModel("local")}
                  className="gap-2"
                >
                  <MonitorIcon className="w-4 h-4" />
                  Local
                </Button>
                <Button
                  variant={activeModel === "online" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveModel("online")}
                  className="gap-2"
                >
                  <CloudIcon className="w-4 h-4" />
                  Online
                </Button>
              </div>
              <ThemeToggle />
              <Link href="/models">
                <Button variant="outline" size="sm">
                  <SettingsIcon className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black font-[var(--font-montserrat)] text-foreground mb-2">
            Create Something Epic
          </h2>
          <p className="text-foreground/70 text-lg font-medium">
            Choose your creative tool and start generating professional content with AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/image-generation">
            <CreativeToolCard
              icon={<ImageIcon className="w-8 h-8" />}
              title="Image Generation"
              description="Create stunning images from text prompts with advanced AI models"
              badge="Popular"
              badgeVariant="secondary"
            />
          </Link>
          <Link href="/video-generation">
            <CreativeToolCard
              icon={<VideoIcon className="w-8 h-8" />}
              title="Video Creation"
              description="Generate and edit videos with AI-powered tools and effects"
              badge="New"
              badgeVariant="default"
            />
          </Link>
          <Link href="/informatics">
            <CreativeToolCard
              icon={<BarChart3Icon className="w-8 h-8" />}
              title="Informatics Design"
              description="Build beautiful infographics and data visualizations"
              badge="Pro"
              badgeVariant="outline"
            />
          </Link>
          <Link href="/slides">
            <CreativeToolCard
              icon={<PresentationIcon className="w-8 h-8" />}
              title="Slide Creator"
              description="Design professional presentations and educational slides"
              badge="Featured"
              badgeVariant="secondary"
            />
          </Link>
        </div>

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainIcon className="w-5 h-5" />
                  Recent Projects
                </CardTitle>
                <CardDescription className="font-medium text-foreground/60">
                  Your latest creative works and ongoing projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-foreground/60">
                  <PlusIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No recent projects yet</p>
                  <p className="text-sm font-medium">Start creating to see your work here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Library</CardTitle>
                <CardDescription className="font-medium text-foreground/60">
                  Pre-built templates to jumpstart your creative process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-foreground/60">
                  <SparklesIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Template library coming soon</p>
                  <p className="text-sm font-medium">Professional templates for all creative needs</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Models</CardTitle>
                <CardDescription className="font-medium text-foreground/60">
                  Manage your local and online AI model configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-foreground">DALL-E 3</p>
                        <p className="text-sm font-medium text-foreground/60">Online • Image Generation</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-foreground">Stable Diffusion</p>
                        <p className="text-sm font-medium text-foreground/60">Local • Image Generation</p>
                      </div>
                    </div>
                    <Badge variant="outline">Offline</Badge>
                  </div>
                  <div className="text-center pt-4">
                    <Link href="/models">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <SettingsIcon className="w-4 h-4" />
                        Manage All Models
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function CreativeToolCard({
  icon,
  title,
  description,
  badge,
  badgeVariant = "default",
}: {
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "outline"
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-accent/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
            {icon}
          </div>
          {badge && (
            <Badge variant={badgeVariant} className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-bold font-[var(--font-montserrat)]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
        <Button className="w-full mt-4 group-hover:bg-accent group-hover:text-white transition-colors">
          Get Started
        </Button>
      </CardContent>
    </Card>
  )
}
