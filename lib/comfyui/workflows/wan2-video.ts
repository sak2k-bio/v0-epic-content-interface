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
    vaeModel = 'wan_2_1_vae.safetensors',
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

  const workflow: ComfyUIWorkflow = {
    // Step 1 - Load Models
    '1': {
      inputs: {
        ckpt_name: highNoiseModel,
        weight_dtype: 'default'
      },
      class_type: 'Load Diffusion Model',
      _meta: {
        title: 'Load Diffusion Model (High Noise)'
      }
    },
    '2': {
      inputs: {
        ckpt_name: lowNoiseModel,
        weight_dtype: 'default'
      },
      class_type: 'Load Diffusion Model',
      _meta: {
        title: 'Load Diffusion Model (Low Noise)'
      }
    },
    '3': {
      inputs: {
        clip: clipModel,
        type: 'wan',
        device: 'default'
      },
      class_type: 'Load CLIP',
      _meta: {
        title: 'Load CLIP'
      }
    },
    '4': {
      inputs: {
        vae_name: vaeModel
      },
      class_type: 'Load VAE',
      _meta: {
        title: 'Load VAE'
      }
    },
    
    // LoRA Loaders
    '5': {
      inputs: {
        model: ['1', 0], // High noise model
        lora_name: loraModel,
        strength_model: loraStrength,
        strength_clip: loraStrength
      },
      class_type: 'LoraLoader',
      _meta: {
        title: 'LoraLoader (High Noise)'
      }
    },
    '6': {
      inputs: {
        model: ['2', 0], // Low noise model
        lora_name: loraModel,
        strength_model: loraStrength,
        strength_clip: loraStrength
      },
      class_type: 'LoraLoader',
      _meta: {
        title: 'LoraLoader (Low Noise)'
      }
    },

    // Model Sampling nodes
    '7': {
      inputs: {
        model: ['5', 0],
        shift: 5.00
      },
      class_type: 'ModelSamplingSD3',
      _meta: {
        title: 'ModelSamplingSD3 (High Noise)'
      }
    },
    '8': {
      inputs: {
        model: ['6', 0],
        shift: 5.00
      },
      class_type: 'ModelSamplingSD3',
      _meta: {
        title: 'ModelSamplingSD3 (Low Noise)'
      }
    },

    // Step 2 - Video size (Empty Latent Video)
    '9': {
      inputs: {
        width,
        height,
        length: frames,
        batch_size: 1
      },
      class_type: 'EmptyLatentVideo',
      _meta: {
        title: 'Empty Latent Video'
      }
    },

    // Step 3 - Prompt encoding
    '10': {
      inputs: {
        text: prompt,
        clip: ['3', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'CLIP Text Encode (Positive Prompt)'
      }
    },
    '11': {
      inputs: {
        text: negativePrompt,
        clip: ['3', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'CLIP Text Encode (Negative Prompt)'
      }
    },

    // Sampling nodes (High noise first, then low noise)
    '12': {
      inputs: {
        seed,
        steps: Math.ceil(steps * 0.7), // 70% of steps for high noise
        cfg: cfgScale,
        sampler_name: sampler,
        scheduler,
        denoise: 1.0,
        model: ['7', 0],
        positive: ['10', 0],
        negative: ['11', 0],
        latent_image: ['9', 0]
      },
      class_type: 'KSampler',
      _meta: {
        title: 'KSampler (High Noise)'
      }
    },
    '13': {
      inputs: {
        seed,
        steps: Math.floor(steps * 0.3), // 30% of steps for low noise
        cfg: cfgScale,
        sampler_name: sampler,
        scheduler,
        denoise: 0.5, // Lower denoise for refinement
        model: ['8', 0],
        positive: ['10', 0],
        negative: ['11', 0],
        latent_image: ['12', 0] // Use output from high noise sampler
      },
      class_type: 'KSampler',
      _meta: {
        title: 'KSampler (Low Noise Refinement)'
      }
    },

    // VAE Decode
    '14': {
      inputs: {
        samples: ['13', 0],
        vae: ['4', 0]
      },
      class_type: 'VAEDecode',
      _meta: {
        title: 'VAE Decode'
      }
    },

    // Video Combine
    '15': {
      inputs: {
        images: ['14', 0],
        fps: 8,
        method: 'default',
        filename_prefix: 'WAN22_video',
        format: 'video/mp4',
        codec: 'libx264',
        crf: 22,
        save_output: true
      },
      class_type: 'VHS_VideoCombine',
      _meta: {
        title: 'Video Combine'
      }
    }
  }

  return workflow
}

// Alternative simplified WAN 2.2 workflow for faster generation
export function createWAN22VideoSimpleWorkflow(params: WAN22VideoParams): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    highNoiseModel = 'Wan2.2\\wan2.2_t2v_high_noise_14B_fp8_scaled.safetensors',
    clipModel = 'umt5_xxl_fp8_e4m3fn_scaled.safetensors',
    vaeModel = 'wan_2_1_vae.safetensors',
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

  const workflow: ComfyUIWorkflow = {
    // Load single model (high noise)
    '1': {
      inputs: {
        ckpt_name: highNoiseModel,
        weight_dtype: 'default'
      },
      class_type: 'Load Diffusion Model',
      _meta: {
        title: 'Load Diffusion Model'
      }
    },
    '2': {
      inputs: {
        clip: clipModel,
        type: 'wan',
        device: 'default'
      },
      class_type: 'Load CLIP',
      _meta: {
        title: 'Load CLIP'
      }
    },
    '3': {
      inputs: {
        vae_name: vaeModel
      },
      class_type: 'Load VAE',
      _meta: {
        title: 'Load VAE'
      }
    },
    
    // LoRA Loader
    '4': {
      inputs: {
        model: ['1', 0],
        lora_name: loraModel,
        strength_model: loraStrength,
        strength_clip: loraStrength
      },
      class_type: 'LoraLoader',
      _meta: {
        title: 'LoraLoader'
      }
    },

    // Model Sampling
    '5': {
      inputs: {
        model: ['4', 0],
        shift: 5.00
      },
      class_type: 'ModelSamplingSD3',
      _meta: {
        title: 'ModelSamplingSD3'
      }
    },

    // Video size
    '6': {
      inputs: {
        width,
        height,
        length: frames,
        batch_size: 1
      },
      class_type: 'EmptyLatentVideo',
      _meta: {
        title: 'Empty Latent Video'
      }
    },

    // Prompt encoding
    '7': {
      inputs: {
        text: prompt,
        clip: ['2', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'CLIP Text Encode (Positive)'
      }
    },
    '8': {
      inputs: {
        text: negativePrompt,
        clip: ['2', 0]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'CLIP Text Encode (Negative)'
      }
    },

    // Sampling
    '9': {
      inputs: {
        seed,
        steps,
        cfg: cfgScale,
        sampler_name: sampler,
        scheduler,
        denoise: 1.0,
        model: ['5', 0],
        positive: ['7', 0],
        negative: ['8', 0],
        latent_image: ['6', 0]
      },
      class_type: 'KSampler',
      _meta: {
        title: 'KSampler'
      }
    },

    // VAE Decode
    '10': {
      inputs: {
        samples: ['9', 0],
        vae: ['3', 0]
      },
      class_type: 'VAEDecode',
      _meta: {
        title: 'VAE Decode'
      }
    },

    // Video Combine
    '11': {
      inputs: {
        images: ['10', 0],
        fps: 8,
        method: 'default',
        filename_prefix: 'WAN22_simple_video',
        format: 'video/mp4',
        codec: 'libx264',
        crf: 22,
        save_output: true
      },
      class_type: 'VHS_VideoCombine',
      _meta: {
        title: 'Video Combine'
      }
    }
  }

  return workflow
}