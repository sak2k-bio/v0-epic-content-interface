# Epic AI Creative Studio

*Professional AI-powered content creation platform with local-first generation capabilities*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/shark-cmds-projects/v0-epic-next-js-interface)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/OZvtG80Z3VV)
[![Local-First AI](https://img.shields.io/badge/Local--First-AI%20Generation-green?style=for-the-badge)](https://github.com/comfyanonymous/ComfyUI)

## Overview

A comprehensive AI creative platform featuring **local-first** content generation:

- 🎨 **Advanced Image Generation** via ComfyUI with FLUX, WAN 2.2, and Stable Diffusion XL
- 🎬 **Professional Video Generation** using AnimateDiff and WAN 2.2 workflows  
- 🤖 **Local AI Processing** with Ollama integration for privacy-first text generation
- 📊 **Data Visualization** tools with AI-powered chart generation
- 📋 **Presentation Builder** with intelligent slide creation
- 🔍 **Research Tools** and comprehensive data analysis

## Features

### 🎨 Advanced Image Generation
- **Multiple Model Support**: FLUX 1.0, WAN 2.2, Stable Diffusion XL, and custom models
- **Professional Workflows**: Pre-built pipelines for different generation styles
- **Real-time Progress**: WebSocket-based status updates and live previews
- **Advanced Controls**: Full parameter control (steps, CFG scale, samplers, schedulers)
- **Aspect Ratios**: Support for multiple aspect ratios from square to ultrawide
- **Batch Processing**: Generate multiple images simultaneously

### 🎬 Professional Video Generation  
- **WAN 2.2 Integration**: State-of-the-art text-to-video generation
- **AnimateDiff Workflows**: High-quality video creation with motion control
- **Multiple Formats**: MP4, GIF, and optimized video outputs
- **Frame Control**: Customizable frame rates and durations
- **Motion Modules**: Advanced motion control and animation

### 🤖 Local AI Processing
- **Ollama Integration**: Local LLM inference for complete privacy
- **Zero API Costs**: Run everything locally on your hardware
- **Full Control**: Manage models, settings, and data locally
- **Offline Capability**: Work without internet connection
- **Custom Models**: Support for any Ollama-compatible model

## Quick Start

### Prerequisites
- **Node.js 18+** and pnpm
- **ComfyUI** installed and running locally (for image/video generation)
- **Ollama** installed (for local AI text processing)
- **GPU with 6GB+ VRAM** recommended for optimal performance

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/v0-epic-content-interface.git
   cd v0-epic-content-interface
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your ComfyUI and Ollama settings
   ```

4. **Install and start ComfyUI**:
   ```bash
   # Clone ComfyUI
   git clone https://github.com/comfyanonymous/ComfyUI.git
   cd ComfyUI
   pip install -r requirements.txt
   
   # Download models (see ComfyUI Setup section)
   # Start ComfyUI server
   python main.py --listen 127.0.0.1 --port 8188
   ```

5. **Install and start Ollama**:
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Install models
   ollama pull llama3.1
   ollama pull llava
   ```

6. **Start the application**:
   ```bash
   pnpm dev
   ```

7. **Open in browser**: Navigate to `http://localhost:3000`

## ComfyUI Setup

For detailed ComfyUI setup instructions, see: [ComfyUI Setup Guide](./docs/COMFYUI_SETUP.md)

### Required Models
1. **FLUX 1.0**: `flux1-dev-fp8.safetensors` - Latest image generation model
2. **WAN 2.2**: `wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors` - Advanced video generation
3. **Stable Diffusion XL**: `sd_xl_base_1.0.safetensors` - Reliable image generation
4. **AnimateDiff**: `animatediff_motion_adapter.ckpt` - Video motion control

### Custom Nodes Required
- **AnimateDiff-Evolved**: For video generation workflows
- **VideoHelperSuite**: For video processing and export
- **ComfyUI-Manager**: For easy node installation

### Environment Configuration
```env
# ComfyUI Settings
NEXT_PUBLIC_COMFYUI_URL=http://localhost:8188
NEXT_PUBLIC_COMFYUI_WS_URL=ws://localhost:8188

# Model Paths (adjust based on your setup)
NEXT_PUBLIC_DEFAULT_CHECKPOINT=sd_xl_base_1.0.safetensors
NEXT_PUBLIC_FLUX_MODEL=FLUX1/flux1-dev-fp8.safetensors
NEXT_PUBLIC_WAN22_HIGH_NOISE=Wan2.2/wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors
```

## Usage

### 🎨 Image Generation
- Navigate to `/image-generation`
- Select model (FLUX, WAN 2.2, or Stable Diffusion XL)
- Enter detailed prompts and negative prompts
- Adjust advanced parameters (steps, CFG scale, sampler, scheduler)
- Choose aspect ratio and batch size
- Monitor real-time progress via WebSocket
- Download high-quality results

### 🎬 Video Generation  
- Navigate to `/video-generation`
- Select WAN 2.2 or AnimateDiff workflow
- Configure prompt, duration, and frame settings
- Adjust motion parameters and frame rate
- Generate videos with professional quality
- Export as MP4 or GIF formats

### 🤖 Local AI Chat
- Navigate to `/test-ai`
- Chat with local Ollama models (Llama 3.1, LLaVA)
- Get AI assistance for content creation
- Analyze images with LLaVA vision model
- Generate code with CodeLlama

### 📊 Informatics & Charts
- Navigate to `/informatics`
- Create data visualizations with AI assistance
- Import CSV/JSON data
- Generate charts with intelligent recommendations
- Export as PNG, SVG, or PDF

### 📋 Presentation Builder
- Navigate to `/slides`
- Create professional presentations
- Use AI to generate slide content
- Apply templates and themes
- Export to PowerPoint or PDF

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   API Routes     │    │   Local AI      │
│                 │    │                  │    │                 │
│ • Image Gen UI  │◄──►│ • /api/generate/ │◄──►│ • ComfyUI       │
│ • Video Gen UI  │    │ • /api/local/    │    │ • Ollama        │
│ • AI Chat UI    │    │ • WebSocket      │    │ • WebSocket     │
│ • Informatics   │    │ • Progress API   │    │ • Model Mgmt    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Components
- **ComfyUI Client**: Advanced workflow execution with WebSocket communication
- **Workflow Templates**: Pre-built pipelines for FLUX, WAN 2.2, and AnimateDiff
- **Ollama Integration**: Local LLM processing for text generation and analysis
- **API Routes**: Comprehensive bridge between frontend and local AI services
- **Real-time Updates**: Live progress tracking and status updates via WebSocket
- **Model Management**: Dynamic model loading and configuration

## API Endpoints

### Image Generation
- `POST /api/generate/image` - Generate images with ComfyUI
- `GET /api/download-image` - Download generated images
- `POST /api/test-image` - Test image generation workflow

### Video Generation  
- `POST /api/generate/video` - Generate videos with WAN 2.2/AnimateDiff
- `GET /api/download-image` - Download generated videos

### Local AI Processing
- `POST /api/local/generate/text` - Generate text with Ollama
- `GET /api/debug/comfyui` - Debug ComfyUI connection
- `POST /api/diagnose-image` - Analyze images with LLaVA

## Deployment

### Cloud Deployment
**Live Demo**: [Vercel](https://vercel.com/shark-cmds-projects/v0-epic-next-js-interface)

### Local Development
Follow the installation steps above for full functionality.

### Important Notes
- **ComfyUI Integration**: Requires local ComfyUI server running on port 8188
- **Ollama Integration**: Requires local Ollama server running on port 11434  
- **GPU Requirements**: 6GB+ VRAM recommended for optimal performance
- **Model Downloads**: Initial setup requires downloading large model files (10GB+)

## Development Status

### ✅ Completed Features
- ComfyUI integration with WebSocket communication
- FLUX, WAN 2.2, and Stable Diffusion XL workflows
- Ollama integration for local text processing
- Real-time progress tracking and status updates
- Professional UI with shadcn/ui components
- Multiple aspect ratios and parameter controls

### 🚧 In Development
- Enhanced project management system
- Advanced file storage and organization
- User authentication and project sharing
- Performance optimizations and caching

### 📋 Planned Features
- Stripe payment integration for cloud services
- Advanced collaboration features
- Model fine-tuning capabilities
- Enterprise features and admin dashboard

## Local-First Philosophy

This project embraces a **local-first** approach to AI content generation:

### 🏠 Why Local-First?
- **Privacy**: Your data never leaves your machine
- **Cost**: Zero API costs after initial setup
- **Control**: Full control over models and parameters
- **Offline**: Works without internet connection
- **Performance**: No network latency for AI processing

### 🔧 Hardware Requirements
- **GPU**: 6GB+ VRAM (RTX 3060/4060 or better recommended)
- **RAM**: 16GB+ system RAM
- **Storage**: 50GB+ for models and generated content
- **CPU**: Modern multi-core processor

### 📦 Model Management
- **Automatic Downloads**: Models download automatically on first use
- **Version Control**: Easy model updates and rollbacks
- **Custom Models**: Support for community and custom models
- **Performance Monitoring**: Real-time GPU and memory usage tracking

## Contributing

We welcome contributions! Please see our [Development Plan](./DEVELOPMENT_PLAN.md) for current priorities and [Local-First Plan](./LOCAL_FIRST_PLAN.md) for technical details.

### Quick Contribution Areas
- 🐛 Bug fixes and performance improvements
- 🎨 UI/UX enhancements
- 🔧 New workflow templates
- 📚 Documentation improvements
- 🧪 Testing and quality assurance

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - Advanced image/video generation
- [Ollama](https://ollama.com/) - Local LLM inference
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [v0.app](https://v0.app/) - AI-powered development platform
