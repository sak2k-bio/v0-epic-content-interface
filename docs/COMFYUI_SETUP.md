# ComfyUI Integration Setup Guide

This guide will help you set up local image and video generation using ComfyUI with your v0-epic-content-interface application.

## Prerequisites

1. **ComfyUI Installation**: Install ComfyUI on your local machine
2. **Models**: Download required models for Stable Diffusion and AnimateDiff
3. **Custom Nodes**: Install necessary custom nodes for video generation

## ComfyUI Installation

### Option 1: Standalone Installation
1. Download ComfyUI from: https://github.com/comfyanonymous/ComfyUI
2. Follow the installation instructions for your operating system
3. Start ComfyUI with: `python main.py`

### Option 2: ComfyUI Manager (Recommended)
1. Use ComfyUI Manager for easier model and node management
2. Install from: https://github.com/ltdrdata/ComfyUI-Manager

## Required Models

### For Image Generation
- **Stable Diffusion XL Base**: `sd_xl_base_1.0.safetensors`
- **VAE**: `sdxl_vae.safetensors` (optional, can use built-in)

### For FLUX Image Generation
- **FLUX Model**: `FLUX1\flux1-dev-fp8.safetensors`
- **T5 CLIP Model**: `umt5_xxl_fp8_e4m3fn_scaled.safetensors`
- **CLIP-L Model**: `clip_l.safetensors`
- **FLUX VAE**: `flux_vae.safetensors`

### For Video Generation  
- **AnimateDiff Motion Module**: `mm_sd_v15_v2.ckpt`
- **Base Model**: Any SD 1.5 compatible model
- **Video Helper Suite**: Install the VHS custom nodes

### For WAN 2.2 Video Generation
- **WAN 2.2 High Noise Model**: `Wan2.2wan2_2_t2v_high_noise_14B_fp8_scaled.safetensors`
- **WAN 2.2 Low Noise Model**: `Wan2.2wan2_2_t2v_low_noise_14B_fp8_scaled.safetensors`
- **umT5 CLIP Model**: `umT5_xxl_fp8_e4m3n_scaled.safetensors`
- **WAN 2.2 VAE**: `wan_2_1_vae.safetensors`
- **LightX2V LoRA**: `wan2_2_t2v_lightx2v_4steps_lora.safetensors`

### Model Locations
Place models in your ComfyUI directory:
```
ComfyUI/
├── models/
│   ├── checkpoints/          # SD models (.safetensors, .ckpt)
│   ├── unet/                 # FLUX models
│   ├── diffusion_models/     # WAN 2.2 models
│   ├── clip/                 # CLIP models (T5, CLIP-L)
│   ├── vae/                  # VAE models
│   ├── loras/                # LoRA models
│   ├── animatediff_models/   # Motion modules
│   └── ...
```

## Required Custom Nodes

### For Video Generation
1. **AnimateDiff**: https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved
2. **Video Helper Suite**: https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite

Install via ComfyUI Manager or manually:
```bash
cd ComfyUI/custom_nodes
git clone https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved
git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite
```

## Project Configuration

1. **Copy Environment File**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update Configuration**:
   Edit `.env.local` with your model names and settings:
   ```env
   NEXT_PUBLIC_DEFAULT_CHECKPOINT=your_model_name.safetensors
   NEXT_PUBLIC_DEFAULT_MOTION_MODULE=your_motion_module.ckpt
   ```

## Running the Application

1. **Start ComfyUI**:
   ```bash
   # In your ComfyUI directory
   python main.py
   ```
   ComfyUI should be running on `http://localhost:8188`

2. **Start the Next.js Application**:
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Navigate to `http://localhost:3000`
   - Go to `/image-generation` or `/video-generation`
   - The ComfyUI status indicator should show "Connected"

## Workflow Templates

The application includes pre-built workflow templates:

### Text-to-Image Workflow
- Located: `lib/comfyui/workflows/text-to-image.ts`
- Uses: CheckpointLoader, KSampler, VAEDecode, SaveImage nodes
- Supports: Positive/negative prompts, various samplers, custom dimensions

### FLUX Image Workflow
- Located: `lib/comfyui/workflows/flux-image.ts`
- Uses: UNETLoader, DualCLIPLoader, BasicGuider, SamplerCustomAdvanced
- Features: Advanced sampling with split sigmas, dual CLIP encoders, CFG=1.0 optimization
- Variants: Full quality and simplified (faster) workflows

### Text-to-Video Workflow  
- Located: `lib/comfyui/workflows/text-to-video.ts`
- Uses: AnimateDiff nodes, Video combine nodes
- Supports: Frame count, FPS control, motion strength

### WAN 2.2 Video Workflow
- Located: `lib/comfyui/workflows/wan2-video.ts`
- Uses: WAN 2.2 dual-noise pipeline with LoRA support
- Features: High/low noise models, LoRA strength control, optimized for 4-step generation
- Variants: Full quality and simplified (faster) workflows

## API Endpoints

### Image Generation
- **POST** `/api/generate/image` - Start image generation
- **GET** `/api/generate/image?promptId=xxx` - Check status/get results

### Video Generation
- **POST** `/api/generate/video` - Start video generation  
- **GET** `/api/generate/video?promptId=xxx` - Check status/get results

## Troubleshooting

### ComfyUI Not Connecting
- Ensure ComfyUI is running on `localhost:8188`
- Check firewall settings
- Verify no other applications are using port 8188

### Missing Models Error
- Download required models to correct directories
- Update model names in `.env.local`
- Restart ComfyUI after adding models

### Video Generation Fails
- Ensure AnimateDiff custom nodes are installed
- Check that motion modules are in the correct directory
- Verify Video Helper Suite is properly installed

### Memory Issues
- Reduce image/video dimensions in settings
- Lower frame count for videos
- Close other GPU-intensive applications

## Performance Tips

1. **For Better Performance**:
   - Use smaller dimensions for faster generation
   - Reduce step count for quicker results
   - Enable model offloading in ComfyUI settings

2. **For Better Quality**:
   - Increase step count (20-50)
   - Use higher CFG scale (7-12)
   - Try different samplers (euler, dpmpp_2m)

## Custom Workflows

You can create custom workflows by:

1. Design workflow in ComfyUI interface
2. Export workflow JSON via "Save (API Format)"
3. Convert to TypeScript template in `lib/comfyui/workflows/`
4. Add new API route for the workflow

## Support

For issues specific to:
- **ComfyUI**: Check ComfyUI GitHub issues
- **AnimateDiff**: Check AnimateDiff-Evolved issues  
- **This Integration**: Check project issues or documentation

## Model Recommendations

### Image Generation
- **SDXL Base**: High quality, versatile
- **FLUX**: Cutting-edge results (if supported)
- **Custom Fine-tunes**: Specialized styles

### Video Generation
- **AnimateDiff v2**: Stable, good quality
- **Stable Video Diffusion**: Camera motion control
- **Custom Motion Modules**: Specialized movements