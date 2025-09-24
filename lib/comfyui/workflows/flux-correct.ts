/**
 * Corrected FLUX workflow based on actual ComfyUI setup
 */

import type { ComfyUIWorkflow } from '@/lib/local/comfyui-client'

export interface FLUXCorrectParams {
  prompt: string
  width?: number
  height?: number
  steps?: number
  seed?: number
  denoise?: number
}

export function createFLUXCorrectWorkflow(params: FLUXCorrectParams): ComfyUIWorkflow {
  const {
    prompt,
    width = 768,
    height = 1024,
    steps = 20,
    seed = Math.floor(Math.random() * 4294967295),
    denoise = 1.0
  } = params

  const workflow: ComfyUIWorkflow = {
    // Load Diffusion Model
    '1': {
      inputs: {
        unet_name: 'FLUX1\\flux1-dev-fp8.safetensors',
        weight_dtype: 'fp8_e4m3fn_fast'
      },
      class_type: 'UNETLoader',
      _meta: {
        title: 'Load Diffusion Model'
      }
    },

    // Load VAE
    '2': {
      inputs: {
        vae_name: 'flux_vae.safetensors'
      },
      class_type: 'VAELoader',
      _meta: {
        title: 'Load VAE'
      }
    },

    // DualCLIPLoader
    '3': {
      inputs: {
        clip_name1: 't5\\t5xxl_fp8_e4m3fn_scaled.safetensors',
        clip_name2: 'clip_l.safetensors',
        type: 'flux'
      },
      class_type: 'DualCLIPLoader',
      _meta: {
        title: 'DualCLIPLoader'
      }
    },

    // CLIP Text Encode (Positive Prompt)
    '4': {
      inputs: {
        text: prompt,
        clip: ['3', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'CLIP Text Encode (Positive Prompt)'
      }
    },

    // Empty Latent Image
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

    // KSamplerSelect
    '6': {
      inputs: {
        sampler_name: 'euler'
      },
      class_type: 'KSamplerSelect',
      _meta: {
        title: 'KSamplerSelect'
      }
    },

    // RandomNoise
    '7': {
      inputs: {
        noise_seed: seed,
        control_after_generate: 'randomize'
      },
      class_type: 'RandomNoise',
      _meta: {
        title: 'RandomNoise'
      }
    },

    // BasicGuider
    '8': {
      inputs: {
        model: ['1', 0],
        conditioning: ['4', 0]
      },
      class_type: 'BasicGuider',
      _meta: {
        title: 'BasicGuider'
      }
    },

    // BasicScheduler
    '9': {
      inputs: {
        scheduler: 'normal',
        steps,
        denoise,
        model: ['1', 0]
      },
      class_type: 'BasicScheduler',
      _meta: {
        title: 'BasicScheduler'
      }
    },

    // SamplerCustomAdvanced
    '10': {
      inputs: {
        noise: ['7', 0],
        guider: ['8', 0],
        sampler: ['6', 0],
        sigmas: ['9', 0],
        latent_image: ['5', 0]
      },
      class_type: 'SamplerCustomAdvanced',
      _meta: {
        title: 'SamplerCustomAdvanced'
      }
    },

    // VAE Decode
    '11': {
      inputs: {
        samples: ['10', 0],
        vae: ['2', 0]
      },
      class_type: 'VAEDecode',
      _meta: {
        title: 'VAE Decode'
      }
    },

    // Save Image
    '12': {
      inputs: {
        filename_prefix: 'ComfyUI',
        images: ['11', 0]
      },
      class_type: 'SaveImage',
      _meta: {
        title: 'Save Image'
      }
    }
  }

  return workflow
}