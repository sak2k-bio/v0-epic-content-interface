/**
 * ComfyUI Configuration
 * Manages environment settings and defaults for ComfyUI integration
 */

export const comfyUIConfig = {
  // Server configuration
  server: {
    url: process.env.NEXT_PUBLIC_COMFYUI_URL || 'http://localhost:8188',
    wsUrl: process.env.NEXT_PUBLIC_COMFYUI_WS_URL || 'ws://localhost:8188',
  },

  // Default models
  models: {
    defaultCheckpoint: process.env.NEXT_PUBLIC_DEFAULT_CHECKPOINT || 'sd_xl_base_1.0.safetensors',
    defaultVAE: process.env.NEXT_PUBLIC_DEFAULT_VAE || 'automatic',
    defaultMotionModule: process.env.NEXT_PUBLIC_DEFAULT_MOTION_MODULE || 'animatediff_motion_adapter.ckpt',
    
    // WAN 2.2 specific models
    wan22HighNoise: process.env.NEXT_PUBLIC_WAN22_HIGH_NOISE || 'Wan2.2\\wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors',
    wan22LowNoise: process.env.NEXT_PUBLIC_WAN22_LOW_NOISE || 'Wan2.2\\wan2.2_t2v_low_noise_14B_fp8_scaled.safetensors',
    wan22CLIP: process.env.NEXT_PUBLIC_WAN22_CLIP || 'umt5_xxl_fp8_e4m3fn_scaled.safetensors',
    wan22VAE: process.env.NEXT_PUBLIC_WAN22_VAE || 'wan_2_1_vae.safetensors',
    wan22LoRA: process.env.NEXT_PUBLIC_WAN22_LORA || 'wan2_2_t2v_lightx2v_4steps_lora.safetensors',
    
    // FLUX specific models
    fluxModel: process.env.NEXT_PUBLIC_FLUX_MODEL || 'FLUX1\\flux1-dev-fp8.safetensors',
    fluxCLIP1: process.env.NEXT_PUBLIC_FLUX_CLIP1 || 't5\\t5xxl_fp8_e4m3fn_scaled.safetensors',
    fluxCLIP2: process.env.NEXT_PUBLIC_FLUX_CLIP2 || 'clip_l.safetensors',
    fluxVAE: process.env.NEXT_PUBLIC_FLUX_VAE || 'flux_vae.safetensors',
  },

  // Generation defaults
  defaults: {
    image: {
      steps: parseInt(process.env.NEXT_PUBLIC_DEFAULT_STEPS || '20'),
      cfgScale: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_CFG_SCALE || '7.0'),
      width: parseInt(process.env.NEXT_PUBLIC_DEFAULT_WIDTH || '1024'),
      height: parseInt(process.env.NEXT_PUBLIC_DEFAULT_HEIGHT || '1024'),
      sampler: process.env.NEXT_PUBLIC_DEFAULT_SAMPLER || 'euler',
      scheduler: process.env.NEXT_PUBLIC_DEFAULT_SCHEDULER || 'normal',
    },
    video: {
      steps: parseInt(process.env.NEXT_PUBLIC_DEFAULT_VIDEO_STEPS || '25'),
      cfgScale: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_VIDEO_CFG_SCALE || '7.5'),
      width: parseInt(process.env.NEXT_PUBLIC_DEFAULT_VIDEO_WIDTH || '512'),
      height: parseInt(process.env.NEXT_PUBLIC_DEFAULT_VIDEO_HEIGHT || '512'),
      frames: parseInt(process.env.NEXT_PUBLIC_DEFAULT_VIDEO_FRAMES || '16'),
      fps: parseInt(process.env.NEXT_PUBLIC_DEFAULT_VIDEO_FPS || '8'),
      sampler: process.env.NEXT_PUBLIC_DEFAULT_VIDEO_SAMPLER || 'euler',
      scheduler: process.env.NEXT_PUBLIC_DEFAULT_VIDEO_SCHEDULER || 'karras',
    }
  },

  // Available samplers
  samplers: [
    'euler',
    'euler_ancestral',
    'heun',
    'heunpp2',
    'dpm_2',
    'dpm_2_ancestral',
    'dpm_fast',
    'dpm_adaptive',
    'lms',
    'dpmpp_2s_ancestral',
    'dpmpp_2m',
    'dpmpp_sde',
    'dpmpp_sde_gpu',
    'dpmpp_2m_sde',
    'dpmpp_2m_sde_gpu',
    'dpmpp_3m_sde',
    'dpmpp_3m_sde_gpu',
    'ddpm',
    'ddim',
    'uni_pc',
    'uni_pc_bh2'
  ],

  // Available schedulers
  schedulers: [
    'normal',
    'karras',
    'exponential',
    'sgm_uniform',
    'simple',
    'ddim_uniform'
  ],

  // Aspect ratios with their dimensions
  aspectRatios: {
    '1:1': { width: 1024, height: 1024, label: 'Square' },
    '16:9': { width: 1920, height: 1080, label: 'Landscape' },
    '9:16': { width: 1080, height: 1920, label: 'Portrait' },
    '4:3': { width: 1024, height: 768, label: 'Classic' },
    '3:2': { width: 1536, height: 1024, label: 'Photo' },
    '21:9': { width: 2560, height: 1080, label: 'Ultrawide' },
    '2:3': { width: 1024, height: 1536, label: 'Vertical' },
  },

  // Video specific aspect ratios (smaller for performance)
  videoAspectRatios: {
    '1:1': { width: 512, height: 512, label: 'Square' },
    '16:9': { width: 768, height: 432, label: 'Landscape' },
    '9:16': { width: 432, height: 768, label: 'Portrait' },
    '4:3': { width: 640, height: 480, label: 'Classic' },
  }
}

export type AspectRatio = keyof typeof comfyUIConfig.aspectRatios
export type VideoAspectRatio = keyof typeof comfyUIConfig.videoAspectRatios
export type Sampler = typeof comfyUIConfig.samplers[number]
export type Scheduler = typeof comfyUIConfig.schedulers[number]