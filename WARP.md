# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Epic AI Creative Studio is a Next.js application that provides a professional interface for AI-powered creative content generation. The app is automatically synced with v0.app deployments and handles image generation, video creation, informatics design, and slide creation.

## Common Development Commands

### Development Server
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### Package Management
The project uses pnpm as the package manager. Always use pnpm commands instead of npm or yarn.

## Architecture & Code Structure

### App Router Architecture
- Uses Next.js 14 App Router (`app/` directory)
- File-based routing with page.tsx files for each route
- Root layout provides theming and font configuration

### UI Component System
- Built on shadcn/ui components with Radix UI primitives
- Tailwind CSS v4 for styling with CSS variables for theming
- Components follow the "New York" shadcn style variant
- Comprehensive component library in `components/ui/`

### Key Application Areas
1. **Image Generation** (`app/image-generation/`) - AI image creation with model selection, prompt engineering, and parameter controls
2. **Video Generation** (`app/video-generation/`) - Video creation with duration, FPS, and motion controls
3. **Informatics** (`app/informatics/`) - Data visualization and infographic design
4. **Slides** (`app/slides/`) - Presentation creation tools
5. **Models** (`app/models/`) - AI model management for local and online providers

### State Management
- Uses React hooks (useState) for local component state
- No global state management library implemented
- Model selection and configuration handled per feature

### Styling System
- Tailwind CSS with custom CSS variables for theme consistency
- Dark/light theme support via next-themes
- Font stack: Geist Sans/Mono + Montserrat for headings
- Consistent spacing and color tokens throughout

### AI Integration Architecture
The app is designed to work with both local and online AI models:
- **Online providers**: DALL-E, Runway, Midjourney
- **Local models**: Stable Diffusion, Stable Video Diffusion
- Model status tracking and switching between local/cloud modes
- Parameter controls specific to each model type

## Development Guidelines

### Component Patterns
- All pages use "use client" directive for interactivity
- Consistent header pattern with back navigation and model status badges
- Card-based layouts for content organization
- Responsive grid systems (particularly 3-column layouts)

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Path aliases configured (`@/*` maps to root)
- ESLint and TypeScript errors are ignored during builds (configured in next.config.mjs)

### Theming
- Uses CSS variables for consistent theming
- ThemeProvider wrapper enables system/dark/light mode switching
- Theme toggle component available throughout the app

### Performance Considerations
- Images are unoptimized (configured in next.config.mjs)
- Vercel Analytics integrated
- Suspense boundaries for loading states

## File Organization

### Critical Configuration Files
- `components.json` - shadcn/ui configuration with aliases
- `next.config.mjs` - Build configuration with TypeScript/ESLint bypass
- `tsconfig.json` - TypeScript configuration with strict settings
- `package.json` - pnpm-based dependency management

### Key Directories
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable UI components and theme providers
- `components/ui/` - shadcn/ui component library
- `lib/` - Utility functions (primarily Tailwind class merging)
- `styles/` - Global CSS and Tailwind imports
- `public/` - Static assets and placeholder images

## Deployment & Sync

The project is automatically synced with v0.app and deployed on Vercel. Any changes made in the v0.app interface are automatically pushed to this repository, and Vercel deploys the latest version.

## Testing

No test framework is currently configured. When adding tests, follow the user's rules about writing thorough tests for all major functionality.

## AI Model Integration Notes

When working with AI features:
- Model switching affects available parameters and capabilities
- Local models require VRAM considerations (specified in model performance data)
- Online models use cloud-based processing
- Parameter controls (steps, CFG scale, duration, FPS) vary by model type
- Status indicators show model availability and download progress for local models