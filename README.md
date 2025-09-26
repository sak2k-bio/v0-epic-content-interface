# Epic AI Creative Studio

*AI-powered content creation platform with local-first generation capabilities*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/shark-cmds-projects/v0-epic-next-js-interface)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/OZvtG80Z3VV)
[![Local-First AI](https://img.shields.io/badge/Local--First-AI%20Generation-green?style=for-the-badge)](https://github.com/comfyanonymous/ComfyUI)

## Overview

A comprehensive AI creative platform featuring **local-first** content generation capabilities. Currently in active development with working ComfyUI integration for image and video generation.

**Current Status**: 🚧 **In Development** - Core image generation working, video generation ready for testing, backend infrastructure in progress.

### ✅ Currently Working
- 🎨 **Image Generation** via ComfyUI with FLUX and Stable Diffusion XL workflows
- 🎬 **Video Generation** using WAN 2.2 workflows (ready for testing)
- 🤖 **Local AI Processing** with Ollama integration for text generation
- 🎨 **Professional UI** with shadcn/ui components and responsive design

### 🚧 In Development  
- 📊 **Data Visualization** tools with AI-powered chart generation
- 📋 **Presentation Builder** with intelligent slide creation
- 🔍 **Research Tools** and comprehensive data analysis
- 💾 **Project Management** system for saving and loading creative works
- 🔐 **User Authentication** and data persistence

## Features

### 🎨 Image Generation (✅ Working)
- **FLUX Integration**: State-of-the-art image generation with FLUX 1.0 model
- **Stable Diffusion XL**: Reliable fallback with SDXL workflows
- **Real-time Progress**: WebSocket-based status updates and live previews
- **Advanced Controls**: Full parameter control (steps, CFG scale, samplers, schedulers)
- **Aspect Ratios**: Support for multiple aspect ratios from square to ultrawide
- **Model Management**: Dynamic model loading and configuration

### 🎬 Video Generation (🔄 Ready for Testing)
- **WAN 2.2 Integration**: Advanced text-to-video generation workflows
- **Complete Pipeline**: UNET, CLIP, VAE loading with proper model management
- **Multiple Formats**: MP4 output with customizable frame rates
- **Motion Control**: Advanced motion parameters and frame control
- **Status**: Fixed major workflow issues, ready for final testing

### 🤖 Local AI Processing (✅ Working)
- **Ollama Integration**: Local LLM inference for complete privacy
- **Zero API Costs**: Run everything locally on your hardware
- **Full Control**: Manage models, settings, and data locally
- **Offline Capability**: Work without internet connection
- **Custom Models**: Support for any Ollama-compatible model

### 📊 Data Visualization (🚧 Planned)
- **Chart Generation**: AI-powered data visualization tools
- **CSV/JSON Import**: Data import and processing capabilities
- **Export Options**: PNG, SVG, and PDF export formats
- **Status**: UI mockups complete, backend integration planned

### 📋 Presentation Builder (🚧 Planned)
- **Slide Creation**: Professional presentation editor
- **AI Assistance**: Intelligent slide content generation
- **Templates**: Professional design templates
- **Export**: PowerPoint and PDF export capabilities
- **Status**: UI mockups complete, backend integration planned

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
   
   # Download required models (see ComfyUI Setup section)
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

### ⚠️ Important Notes
- **ComfyUI Integration**: Requires local ComfyUI server running on port 8188
- **Ollama Integration**: Requires local Ollama server running on port 11434  
- **GPU Requirements**: 6GB+ VRAM recommended for optimal performance
- **Model Downloads**: Initial setup requires downloading large model files (10GB+)
- **Current Status**: Image generation is fully functional, video generation is ready for testing

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

### Current Implementation
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   API Routes     │    │   Local AI      │
│                 │    │                  │    │                 │
│ • Image Gen UI  │◄──►│ • /api/generate/ │◄──►│ • ComfyUI ✅    │
│ • Video Gen UI  │    │ • /api/local/    │    │ • Ollama ✅     │
│ • AI Chat UI    │    │ • WebSocket ✅   │    │ • WebSocket ✅  │
│ • Informatics   │    │ • Progress API ✅│    │ • Model Mgmt ✅ │
│ • Slides UI     │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Planned Architecture (Phase 2-3)
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   API Routes     │    │   Backend       │
│                 │    │                  │    │                 │
│ • Dashboard ✅  │◄──►│ • Auth API 🚧    │◄──►│ • Supabase 🚧   │
│ • Projects 🚧   │    │ • Projects API 🚧 │    │ • Database 🚧    │
│ • File Mgmt 🚧  │    │ • Storage API 🚧  │    │ • Storage 🚧     │
│ • Analytics 🚧  │    │ • Billing API 📋 │    │ • Auth 🚧        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Components

#### ✅ Working Components
- **ComfyUI Client**: Advanced workflow execution with WebSocket communication
- **Workflow Templates**: Pre-built pipelines for FLUX, WAN 2.2, and SDXL
- **Ollama Integration**: Local LLM processing for text generation and analysis
- **API Routes**: Bridge between frontend and local AI services
- **Real-time Updates**: Live progress tracking via WebSocket
- **Model Management**: Dynamic model loading and configuration

#### 🚧 In Development
- **Database Layer**: Supabase integration for data persistence
- **Authentication**: User management and session handling
- **File Storage**: Image/video upload and management system
- **Project System**: Save/load functionality for user work

#### 📋 Planned Components
- **Payment System**: Stripe integration for subscriptions
- **Collaboration**: Project sharing and team features
- **Analytics**: Usage tracking and performance monitoring
- **Admin Dashboard**: User management and system administration

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
- **ComfyUI Integration**: Full WebSocket communication and workflow execution
- **Image Generation**: FLUX and Stable Diffusion XL workflows working
- **Video Generation**: WAN 2.2 pipeline fixed and ready for testing
- **Ollama Integration**: Local LLM processing for text generation
- **Real-time Progress**: Live progress tracking and status updates
- **Professional UI**: Complete shadcn/ui component system with responsive design
- **Model Management**: Dynamic model loading and configuration
- **Advanced Controls**: Full parameter control for all generation types

### 🔄 Currently Testing
- **Video Generation**: WAN 2.2 workflows ready for final testing
- **Model Compatibility**: Ensuring all required models are properly loaded
- **Performance Optimization**: GPU memory management and generation speed

### 🚧 In Development
- **Project Management**: Save/load functionality for user projects
- **User Authentication**: Supabase Auth integration for user management
- **Data Persistence**: Database schema and storage system
- **File Management**: Image/video upload, storage, and export system
- **Informatics Backend**: Real chart generation and data visualization
- **Slides Backend**: Presentation editor with AI assistance

### 📋 Planned Features
- **Payment Integration**: Stripe subscription system for cloud services
- **Advanced Collaboration**: Project sharing and team features
- **Model Fine-tuning**: Custom model training capabilities
- **Enterprise Features**: Admin dashboard and advanced user management
- **Performance Monitoring**: Real-time GPU and memory usage tracking

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

## Current State & Next Steps

### 🎯 Immediate Priorities
1. **Test Video Generation**: Complete testing of WAN 2.2 video workflows
2. **Database Integration**: Implement Supabase for data persistence
3. **User Authentication**: Add Supabase Auth for user management
4. **Project Management**: Enable save/load functionality for user projects

### 📋 Development Roadmap
- **Phase 1**: Complete backend infrastructure (database, auth, file storage)
- **Phase 2**: Enhance informatics and slides with real functionality
- **Phase 3**: Add payment integration and advanced features
- **Phase 4**: Enterprise features and collaboration tools

### 🔗 Related Documentation
- [Development Plan](./DEVELOPMENT_PLAN.md) - Detailed development phases
- [Local-First Plan](./LOCAL_FIRST_PLAN.md) - Technical implementation details
- [Integration Status](./INTEGRATION_STATUS.md) - Current ComfyUI integration status
- [Next Steps](./NEXT_STEPS.md) - Immediate actionable tasks

## Contributing

We welcome contributions! Please see our [Development Plan](./DEVELOPMENT_PLAN.md) for current priorities and [Local-First Plan](./LOCAL_FIRST_PLAN.md) for technical details.

### Quick Contribution Areas
- 🐛 Bug fixes and performance improvements
- 🎨 UI/UX enhancements
- 🔧 New workflow templates
- 📚 Documentation improvements
- 🧪 Testing and quality assurance
- 🚧 Backend development (database, auth, file storage)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - Advanced image/video generation
- [Ollama](https://ollama.com/) - Local LLM inference
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [v0.app](https://v0.app/) - AI-powered development platform
