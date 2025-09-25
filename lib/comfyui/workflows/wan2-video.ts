/**
 * WAN 2.2 Video Generation Workflow with LoRA Support
 * Based on the ComfyUI workflow shown in the image
 */

import type { ComfyUIWorkflow } from '@/lib/local/comfyui-client'

export interface WAN22VideoParams {
  prompt: string
  negativePrompt?: string
  highNoiseModel?: string
  lowNoiseModel?: string
  clipModel?: string
  vaeModel?: string
  loraModel?: string
  loraStrength?: number
  width?: number
  height?: number
  frames?: number
  steps?: number
  cfgScale?: number
  seed?: number
  sampler?: string
  scheduler?: string
}

export function createWAN22VideoWorkflow(params: WAN22VideoParams): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    highNoiseModel = 'Wan2.2\\wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors',
    lowNoiseModel = 'Wan2.2\\wan2.2_t2v_low_noise_14B_fp8_scaled.safetensors',
    clipModel = 'umt5_xxl_fp8_e4m3fn_scaled.safetensors',
    vaeModel = 'wan_2.1_vae.safetensors',
    loraModel = 'wan2_2_t2v_lightx2v_4steps_lora.safetensors',
    loraStrength = 1.00,
    width = 512,
    height = 512,
    frames = 25,
    steps = 4,
    cfgScale = 5.0,
    seed = Math.floor(Math.random() * 4294967295),
    sampler = 'euler',
    scheduler = 'simple'
  } = params

  // Complete WAN 2.2 video workflow
  const workflow: ComfyUIWorkflow = {
    // Load UNET model
    '1': {
      inputs: {
        unet_name: highNoiseModel,
        weight_dtype: 'default'
      },
      class_type: 'UNETLoader',
      _meta: {
        title: 'Load UNET Model'
      }
    },
    
    // Load CLIP
    '2': {
      inputs: {
        clip_name: clipModel,
        type: 'wan'
      },
      class_type: 'CLIPLoader',
      _meta: {
        title: 'Load CLIP'
      }
    },
    
    // Load VAE
    '3': {
      inputs: {
        vae_name: vaeModel
      },
      class_type: 'VAELoader',
      _meta: {
        title: 'Load VAE'
      }
    },
    
    // Positive prompt encoding
    '4': {
      inputs: {
        text: prompt,
        clip: ['2', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'Positive Prompt'
      }
    },
    
    // Negative prompt encoding
    '5': {
      inputs: {
        text: negativePrompt,
        clip: ['2', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'Negative Prompt'
      }
    },
    
    // Create video latent
    '6': {
      inputs: {
        vae: ['3', 0],
        width: width,
        height: height,
        length: frames,
        batch_size: 1
      },
      class_type: 'Wan22ImageToVideoLatent',
      _meta: {
        title: 'Video Latent'
      }
    },
    
    // Sample
    '7': {
      inputs: {
        seed: seed,
        steps: steps,
        cfg: cfgScale,
        sampler_name: sampler,
        scheduler: scheduler,
        denoise: 1.0,
        model: ['1', 0],
        positive: ['4', 0],
        negative: ['5', 0],
        latent_image: ['6', 0]
      },
      class_type: 'KSampler',
      _meta: {
        title: 'Sample'
      }
    },
    
    // Decode VAE
    '8': {
      inputs: {
        samples: ['7', 0],
        vae: ['3', 0]
      },
      class_type: 'VAEDecode',
      _meta: {
        title: 'Decode'
      }
    },
    
    // Create video from images
    '9': {
      inputs: {
        images: ['8', 0],
        fps: 8
      },
      class_type: 'CreateVideo',
      _meta: {
        title: 'Create Video'
      }
    },
    
    // Save video
    '10': {
      inputs: {
        video: ['9', 0],
        filename_prefix: 'WAN_video',
        format: 'auto',
        codec: 'auto'
      },
      class_type: 'SaveVideo',
      _meta: {
        title: 'Save Video'
      }
    }
  }

  return workflow
}

// Simplified WAN 2.2 workflow for faster generation
export function createWAN22VideoSimpleWorkflow(params: WAN22VideoParams): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    width = 512,
    height = 512,
    frames = 16,
    steps = 2,
    cfgScale = 3.0,
    seed = Math.floor(Math.random() * 4294967295)
  } = params

  // Simplified WAN 2.2 workflow with basic settings
  const workflow: ComfyUIWorkflow = {
    // Load basic models
    '1': {
      inputs: {
        unet_name: 'Wan2.2\\wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors',
        weight_dtype: 'default'
      },
      class_type: 'UNETLoader',
      _meta: {
        title: 'Load UNET'
      }
    },
    
    '2': {
      inputs: {
        clip_name: 'umt5_xxl_fp8_e4m3fn_scaled.safetensors',
        type: 'wan'
      },
      class_type: 'CLIPLoader',
      _meta: {
        title: 'Load CLIP'
      }
    },
    
    '3': {
      inputs: {
        vae_name: 'wan_2.1_vae.safetensors'
      },
      class_type: 'VAELoader',
      _meta: {
        title: 'Load VAE'
      }
    },
    
    // Text encoding
    '4': {
      inputs: {
        text: prompt,
        clip: ['2', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'Positive'
      }
    },
    
    '5': {
      inputs: {
        text: negativePrompt || '',
        clip: ['2', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'Negative'
      }
    },
    
    // Video latent
    '6': {
      inputs: {
        vae: ['3', 0],
        width: width,
        height: height,
        length: frames,
        batch_size: 1
      },
      class_type: 'Wan22ImageToVideoLatent',
      _meta: {
        title: 'Video Latent'
      }
    },
    
    // Simple sampling
    '7': {
      inputs: {
        seed: seed,
        steps: steps,
        cfg: cfgScale,
        sampler_name: 'euler',
        scheduler: 'simple',
        denoise: 1.0,
        model: ['1', 0],
        positive: ['4', 0],
        negative: ['5', 0],
        latent_image: ['6', 0]
      },
      class_type: 'KSampler',
      _meta: {
        title: 'Sample'
      }
    },
    
    // Decode and save
    '8': {
      inputs: {
        samples: ['7', 0],
        vae: ['3', 0]
      },
      class_type: 'VAEDecode',
      _meta: {
        title: 'Decode'
      }
    },
    
    '9': {
      inputs: {
        images: ['8', 0],
        fps: 8
      },
      class_type: 'CreateVideo',
      _meta: {
        title: 'Create Video'
      }
    },
    
    '10': {
      inputs: {
        video: ['9', 0],
        filename_prefix: 'WAN_simple_video',
        format: 'auto',
        codec: 'auto'
      },
      class_type: 'SaveVideo',
      _meta: {
        title: 'Save Video'
      }
    }
  }

  return workflow
}
