# Epic AI Creative Studio - Local-First Development Plan

## 🎯 **LOCAL-FIRST APPROACH: Why This Is Better**

Starting with local models gives us:
- **Zero API costs** during development
- **Full control** over AI processing
- **Privacy-first** approach (no data sent to external APIs)
- **Faster iteration** without rate limits
- **Offline capability**

---

## 🚀 **PHASE 1: Local AI Infrastructure (Weeks 1-3)**

### **Week 1: Local Model Setup**

#### **Option A: Ollama (Recommended - Easiest)**
```bash
# Install Ollama on Windows
winget install Ollama.Ollama
# Or download from https://ollama.com/download

# Install models for different tasks
ollama pull llama3.1        # Text generation
ollama pull llava           # Vision model (image analysis)
ollama pull codellama       # Code generation
```

#### **Option B: ComfyUI for Image Generation**
```bash
# Clone ComfyUI
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# Install Python dependencies
pip install -r requirements.txt

# Download Stable Diffusion models (free)
# SDXL Base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
# Place in: ComfyUI/models/checkpoints/
```

#### **Option C: Automatic1111 (Alternative)**
```bash
# Clone A1111 WebUI
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui

# Run installer
./webui-user.bat  # Will auto-install everything
```

### **Week 2: Backend Integration**

#### **Local AI API Routes Structure**
```
app/api/
├── local/
│   ├── generate/
│   │   ├── image/route.ts      # ComfyUI integration
│   │   ├── text/route.ts       # Ollama integration
│   │   └── analyze/route.ts    # LLaVA for image analysis
│   ├── models/
│   │   ├── status/route.ts     # Check if models are running
│   │   └── list/route.ts       # List available local models
```

### **Week 3: Database & Storage**

#### **Local-First Database Setup**
```sql
-- Modified schema for local-first approach
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade,
  title text not null,
  description text,
  type text check (type in ('image', 'video', 'informatics', 'slides')),
  data jsonb not null default '{}',
  local_model_used text,          -- Track which local model was used
  processing_time integer,        -- Track generation time
  thumbnail_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Local generations tracking
create table public.local_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade,
  type text check (type in ('image', 'text', 'analysis')),
  prompt text not null,
  local_model text not null,
  parameters jsonb default '{}',
  result_path text,               -- Local file path or Supabase storage URL
  processing_time_ms integer,
  status text check (status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

---

## 🎨 **PHASE 2: Local Image Generation (Weeks 4-5)**

### **ComfyUI REST API Integration**

#### **ComfyUI Server Setup**
```python
# Create ComfyUI API wrapper: comfyui_server.py
import json
import requests
import websocket
import uuid
import os

class ComfyUIClient:
    def __init__(self, server_address="127.0.0.1:8188"):
        self.server_address = server_address
        
    def generate_image(self, prompt, negative_prompt="", steps=20, cfg_scale=7):
        # Implementation for API calls to ComfyUI
        pass
```

#### **Next.js API Route**
```typescript
// app/api/local/generate/image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { ComfyUIClient } from '@/lib/local/comfyui-client'

const comfyui = new ComfyUIClient()

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, negative_prompt, steps, cfg_scale } = await request.json()
    
    // Generate image locally
    const result = await comfyui.generate_image(prompt, negative_prompt, steps, cfg_scale)
    
    // Save to Supabase Storage
    const imageUrl = await uploadToStorage(result.image_path)
    
    // Save generation record
    await supabase.from('local_generations').insert({
      user_id: session.user.id,
      type: 'image',
      prompt,
      local_model: 'stable-diffusion-xl',
      parameters: { steps, cfg_scale, negative_prompt },
      result_path: imageUrl,
      processing_time_ms: result.processing_time
    })

    return NextResponse.json({ 
      success: true, 
      image_url: imageUrl,
      processing_time: result.processing_time 
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
```

---

## 🤖 **PHASE 3: Local Text AI Integration (Week 6)**

### **Ollama Integration for Content Generation**

#### **Ollama Client Setup**
```typescript
// lib/local/ollama-client.ts
export class OllamaClient {
  private baseUrl = 'http://localhost:11434'
  
  async generateText(prompt: string, model: string = 'llama3.1'): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    })
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.response
  }
  
  async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
    // Use LLaVA model for image analysis
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llava',
        prompt,
        images: [imageBase64]
      })
    })
    
    const data = await response.json()
    return data.response
  }
}
```

### **Smart Content Generation Features**

#### **AI-Powered Slide Generation**
```typescript
// lib/local/slide-generator.ts
export async function generateSlideContent(topic: string, slideCount: number) {
  const ollama = new OllamaClient()
  
  const prompt = `Create a ${slideCount}-slide presentation about "${topic}". 
  Return JSON format with title, bullet points, and speaker notes for each slide.`
  
  const response = await ollama.generateText(prompt, 'llama3.1')
  return JSON.parse(response)
}
```

#### **Chart Data Generation**
```typescript
// lib/local/chart-generator.ts
export async function generateChartData(description: string) {
  const ollama = new OllamaClient()
  
  const prompt = `Generate realistic chart data for: "${description}". 
  Return JSON with labels, values, and chart type recommendation.`
  
  const response = await ollama.generateText(prompt, 'llama3.1')
  return JSON.parse(response)
}
```

---

## 💻 **PHASE 4: System Requirements & Setup (Week 7)**

### **Hardware Requirements**
- **For Image Generation (ComfyUI):**
  - GPU: 6GB+ VRAM recommended (RTX 3060/4060 or better)
  - RAM: 16GB+ system RAM
  - Storage: 50GB+ for models

- **For Text Generation (Ollama):**
  - RAM: 8GB+ for Llama3.1-8B
  - CPU: Modern multi-core processor
  - Storage: 10GB+ for models

### **Installation Scripts**

#### **Windows Setup Script**
```powershell
# setup-local-ai.ps1
Write-Host "Setting up Epic AI Studio Local Environment..."

# Install Ollama
if (!(Get-Command ollama -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Ollama..."
    winget install Ollama.Ollama
}

# Install required models
Write-Host "Installing AI models..."
ollama pull llama3.1
ollama pull llava
ollama pull codellama

# Install Python for ComfyUI
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Python..."
    winget install Python.Python.3.11
}

# Clone and setup ComfyUI
if (!(Test-Path ".\ComfyUI")) {
    Write-Host "Setting up ComfyUI..."
    git clone https://github.com/comfyanonymous/ComfyUI.git
    cd ComfyUI
    pip install -r requirements.txt
    cd ..
}

Write-Host "Local AI setup complete!"
Write-Host "Next: Download Stable Diffusion models to ComfyUI/models/checkpoints/"
```

### **Model Management Dashboard**

#### **Local Model Status Component**
```typescript
// components/local/model-status.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ModelStatus {
  name: string
  status: 'running' | 'stopped' | 'error'
  memory_usage?: string
  last_used?: Date
}

export function ModelStatusDashboard() {
  const [models, setModels] = useState<ModelStatus[]>([])
  
  useEffect(() => {
    // Check status of local AI services
    checkModelStatus()
  }, [])
  
  const checkModelStatus = async () => {
    try {
      // Check Ollama
      const ollamaResponse = await fetch('/api/local/models/status')
      const ollamaStatus = await ollamaResponse.json()
      
      // Check ComfyUI
      const comfyResponse = await fetch('/api/local/comfyui/status')
      const comfyStatus = await comfyResponse.json()
      
      setModels([...ollamaStatus.models, ...comfyStatus.models])
    } catch (error) {
      console.error('Failed to check model status:', error)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Local AI Models Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <div key={model.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{model.name}</p>
                {model.memory_usage && (
                  <p className="text-sm text-muted-foreground">RAM: {model.memory_usage}</p>
                )}
              </div>
              <Badge variant={model.status === 'running' ? 'default' : 'secondary'}>
                {model.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🎯 **Immediate Next Steps (This Week)**

### **Day 1-2: Environment Setup**
```bash
# 1. Install Ollama
winget install Ollama.Ollama

# 2. Install basic models
ollama pull llama3.1    # 4.7GB - for text generation
ollama pull llava       # 4.5GB - for image analysis

# 3. Install Python and Git (if not installed)
winget install Python.Python.3.11
winget install Git.Git

# 4. Test Ollama is working
ollama run llama3.1 "Hello, tell me about AI image generation"
```

### **Day 3-5: ComfyUI Setup**
```bash
# 1. Clone ComfyUI
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# 2. Install dependencies
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt

# 3. Download Stable Diffusion XL model (6.9GB)
# Download from: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors
# Place in: ComfyUI/models/checkpoints/

# 4. Start ComfyUI server
python main.py --listen 127.0.0.1 --port 8188
```

### **Day 6-7: Basic Integration**
```bash
# 1. Install new dependencies for the app
pnpm add @supabase/supabase-js zod uuid sharp

# 2. Create local AI integration files
mkdir -p lib/local
touch lib/local/ollama-client.ts
touch lib/local/comfyui-client.ts

# 3. Create API routes
mkdir -p app/api/local/generate
touch app/api/local/generate/image/route.ts
touch app/api/local/generate/text/route.ts
```

---

## 🔧 **Technical Advantages of Local-First**

### **Performance Benefits**
- No network latency for AI processing
- Can process multiple requests simultaneously
- No rate limits or quotas
- Faster iteration during development

### **Privacy & Security**
- All data stays on your machine
- No external API keys required
- Full control over model behavior
- GDPR-compliant by default

### **Cost Benefits**
- Zero API costs during development
- One-time hardware investment
- Can run offline
- Scale without per-request costs

### **Development Benefits**
- Deterministic outputs for testing
- Can modify models if needed
- No API downtime issues
- Full debugging capability

---

## 🎮 **Ready to Start?**

The local-first approach is actually **better** than starting with paid APIs because:

1. **Faster Development**: No API setup, keys, or billing
2. **Better Testing**: Deterministic results, no rate limits
3. **Full Control**: Modify parameters without external constraints
4. **Privacy First**: Important for user trust
5. **Zero Costs**: Perfect for MVP development

**Next Action**: Shall I help you install Ollama and get the first local model running right now?