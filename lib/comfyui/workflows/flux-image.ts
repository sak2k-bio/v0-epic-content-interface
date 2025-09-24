/**
 * FLUX Image Generation Workflow
 * Based on the ComfyUI workflow shown in the image
 */

import type { ComfyUIWorkflow } from '@/lib/local/comfyui-client'

export interface FLUXImageParams {
  prompt: string
  negativePrompt?: string
  fluxModel?: string
  clipModel1?: string
  clipModel2?: string
  vaeModel?: string
  sampler?: string
  scheduler?: string
  steps?: number
  denoise?: number
  cfgScale?: number
  width?: number
  height?: number
  seed?: number
  sigmas?: {
    high_sigmas: number
    low_sigmas: number
    step: number
  }
}

export function createFLUXImageWorkflow(params: FLUXImageParams): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    fluxModel = 'FLUX1\\flux1-dev-fp8.safetensors',
    clipModel1 = 't5\\t5xxl_fp8_e4m3fn_scaled.safetensors',
    clipModel2 = 'clip_l.safetensors',
    vaeModel = 'flux_vae.safetensors',
    sampler = 'euler',
    scheduler = 'normal',
    steps = 20,
    denoise = 1.00,
    cfgScale = 1.0,
    width = 768,
    height = 1024,
    seed = Math.floor(Math.random() * 4294967295),
    sigmas = {
      high_sigmas: 1.0,
      low_sigmas: 0.0,
      step: 0
    }
  } = params

  // This workflow matches your JSON file exactly
  const workflow: ComfyUIWorkflow = {
    // UNETLoader - Node 12 in your JSON
    '12': {
      inputs: {
        unet_name: fluxModel,
        weight_dtype: 'fp8_e4m3fn'
      },
      class_type: 'UNETLoader',
      _meta: {
        title: 'Load Diffusion Model'
      }
    },

    // DualCLIPLoader - Node 11 in your JSON
    '11': {
      inputs: {
        clip_name1: clipModel1,
        clip_name2: clipModel2,
        type: 'flux'
      },
      class_type: 'DualCLIPLoader',
      _meta: {
        title: 'DualCLIPLoader'
      }
    },

    // CLIPTextEncode - Node 6 in your JSON
    '6': {
      inputs: {
        text: prompt,
        clip: ['11', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'CLIP Text Encode (Positive Prompt)'
      }
    },

    // BasicGuider - Node 22 in your JSON
    '22': {
      inputs: {
        model: ['12', 0],
        conditioning: ['6', 0]
      },
      class_type: 'BasicGuider',
      _meta: {
        title: 'BasicGuider'
      }
    },

    // KSamplerSelect - Node 16 in your JSON
    '16': {
      inputs: {
        sampler_name: sampler
      },
      class_type: 'KSamplerSelect',
      _meta: {
        title: 'KSamplerSelect'
      }
    },

    // BasicScheduler - Node 17 in your JSON
    '17': {
      inputs: {
        model: ['12', 0],
        scheduler,
        steps,
        denoise
      },
      class_type: 'BasicScheduler',
      _meta: {
        title: 'BasicScheduler'
      }
    },

    // RandomNoise - Node 50 in your JSON
    '50': {
      inputs: {
        noise_seed: seed
      },
      class_type: 'RandomNoise',
      _meta: {
        title: 'RandomNoise'
      }
    },

    // EmptyLatentImage - Node 51 in your JSON
    '51': {
      inputs: {
        width,
        height,
        batch_size: 1
      },
      class_type: 'EmptyLatentImage',
      _meta: {
        title: 'Empty Latent Image'
      }
    },

    // SplitSigmas - Node 38 in your JSON
    '38': {
      inputs: {
        sigmas: ['17', 0],
        step: sigmas.step
      },
      class_type: 'SplitSigmas',
      _meta: {
        title: 'SplitSigmas'
      }
    },

    // SamplerCustomAdvanced - Node 13 in your JSON
    '13': {
      inputs: {
        noise: ['50', 0],
        guider: ['22', 0],
        sampler: ['16', 0],
        sigmas: ['38', 1], // low_sigmas from SplitSigmas
        latent_image: ['51', 0]
      },
      class_type: 'SamplerCustomAdvanced',
      _meta: {
        title: 'SamplerCustomAdvanced'
      }
    },

    // VAELoader - Node 10 in your JSON
    '10': {
      inputs: {
        vae_name: vaeModel
      },
      class_type: 'VAELoader',
      _meta: {
        title: 'VAE Loader'
      }
    },

    // VAEDecode - Node 8 in your JSON
    '8': {
      inputs: {
        samples: ['13', 0],
        vae: ['10', 0]
      },
      class_type: 'VAEDecode',
      _meta: {
        title: 'VAE Decode'
      }
    },

    // SaveImage - Node 9 in your JSON
    '9': {
      inputs: {
        filename_prefix: 'FLUX',
        images: ['8', 0]
      },
      class_type: 'SaveImage',
      _meta: {
        title: 'Save Image'
      }
    }
  }

  return workflow
}

// Simplified FLUX workflow for faster generation
export function createFLUXImageSimpleWorkflow(params: FLUXImageParams): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    fluxModel = 'FLUX1\\flux1-dev-fp8.safetensors',
    clipModel1 = 't5\\t5xxl_fp8_e4m3fn_scaled.safetensors',
    clipModel2 = 'clip_l.safetensors',
    vaeModel = 'flux_vae.safetensors',
    sampler = 'euler',
    scheduler = 'simple',
    steps = 10, // Fewer steps for speed
    denoise = 1.00,
    width = 1024,
    height = 1024,
    seed = Math.floor(Math.random() * 4294967295)
  } = params

  const workflow: ComfyUIWorkflow = {
    // Load FLUX Model
    '1': {
      inputs: {
        unet_name: fluxModel,
        weight_dtype: 'fp8_e4m3fn_fast'
      },
      class_type: 'UNETLoader',
      _meta: {
        title: 'Load FLUX Model'
      }
    },

    // Dual CLIP Loader
    '2': {
      inputs: {
        clip_name1: clipModel1,
        clip_name2: clipModel2,
        type: 'flux'
      },
      class_type: 'DualCLIPLoader',
      _meta: {
        title: 'DualCLIPLoader'
      }
    },

    // VAE Loader
    '3': {
      inputs: {
        vae_name: vaeModel
      },
      class_type: 'VAELoader',
      _meta: {
        title: 'VAE Loader'
      }
    },

    // CLIP Text Encode
    '4': {
      inputs: {
        text: prompt,
        clip: ['2', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'CLIP Text Encode'
      }
    },

    // Empty Latent
    '5': {
      inputs: {
        width,
        height,
        batch_size: 1
      },
      class_type: 'EmptyLatentImage',
      _meta: {
        title: 'Empty Latent Image'
      }
    },

    // Basic Sampling (simplified)
    '6': {
      inputs: {
        seed,
        steps,
        cfg: 1.0, // FLUX works well with CFG=1
        sampler_name: sampler,
        scheduler,
        denoise,
        model: ['1', 0],
        positive: ['4', 0],
        negative: ['4', 0], // FLUX often uses same for both
        latent_image: ['5', 0]
      },
      class_type: 'KSampler',
      _meta: {
        title: 'KSampler'
      }
    },

    // VAE Decode
    '7': {
      inputs: {
        samples: ['6', 0],
        vae: ['3', 0]
      },
      class_type: 'VAEDecode',
      _meta: {
        title: 'VAE Decode'
      }
    },

    // Save Image
    '8': {
      inputs: {
        filename_prefix: 'FLUX_simple',
        images: ['7', 0]
      },
      class_type: 'SaveImage',
      _meta: {
        title: 'Save Image'
      }
    }
  }

  return workflow
}