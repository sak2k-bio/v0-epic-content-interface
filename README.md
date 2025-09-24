# Epic Content Interface

*AI-powered content creation platform with local generation capabilities*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/shark-cmds-projects/v0-epic-next-js-interface)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/OZvtG80Z3VV)

## Overview

A comprehensive content creation platform featuring:

- 🎨 **Local Image Generation** via ComfyUI integration
- 🎬 **Local Video Generation** using AnimateDiff workflows
- 🤖 **AI Chat Integration** with Ollama support
- 📊 **Data Visualization** tools
- 📋 **Presentation Builder** with AI assistance
- 🔍 **Research Tools** and data analysis

## Features

### ComfyUI Integration
- **Text-to-Image Generation**: Create stunning images with Stable Diffusion models
- **Text-to-Video Generation**: Generate videos using AnimateDiff workflows
- **Real-time Progress Tracking**: WebSocket-based status updates
- **Multiple Model Support**: SDXL, SD 1.5, FLUX, and custom models
- **Advanced Parameters**: Full control over sampling, CFG, dimensions, and more

### Local AI Processing
- **Ollama Integration**: Local LLM inference for privacy
- **ComfyUI Workflows**: Customizable generation pipelines
- **No API Costs**: Run everything locally on your hardware
- **Full Control**: Manage models, settings, and data locally

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- ComfyUI installed and running locally
- Ollama (optional, for AI chat features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd v0-epic-content-interface
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your settings
   ```

4. **Start ComfyUI** (in separate terminal):
   ```bash
   # In your ComfyUI directory
   python main.py
   ```

5. **Start the application**:
   ```bash
   npm run dev
   ```

6. **Open in browser**: Navigate to `http://localhost:3000`

## ComfyUI Setup

For detailed ComfyUI setup instructions, see: [ComfyUI Setup Guide](./docs/COMFYUI_SETUP.md)

### Quick Setup
1. Install ComfyUI from [GitHub](https://github.com/comfyanonymous/ComfyUI)
2. Download models (SDXL for images, AnimateDiff for videos)
3. Install required custom nodes:
   - AnimateDiff-Evolved
   - VideoHelperSuite
4. Start ComfyUI on `localhost:8188`

## Usage

### Image Generation
- Navigate to `/image-generation`
- Enter your prompt and adjust settings
- Click "Generate Images"
- Download results when complete

### Video Generation  
- Navigate to `/video-generation`
- Configure prompt, duration, and frame settings
- Generate videos with AnimateDiff workflows
- Download MP4 or GIF results

### AI Chat
- Navigate to `/test-ai`
- Chat with local Ollama models
- Get AI assistance for content creation

## Architecture

```
Frontend (Next.js) → API Routes → ComfyUI/Ollama
                ↓
            WebSocket Updates
```

### Key Components
- **ComfyUI Client**: Handles workflow execution and WebSocket communication
- **Workflow Templates**: Pre-built pipelines for common tasks
- **API Routes**: Bridge between frontend and local services
- **Real-time Updates**: Progress tracking via WebSocket

## Deployment

**Cloud Deployment**: [Vercel](https://vercel.com/shark-cmds-projects/v0-epic-next-js-interface)

**Local Development**: Follow installation steps above

**Note**: ComfyUI integration requires local setup and cannot run in cloud deployments without additional configuration.
