/**
 * Text-to-Image workflow template for ComfyUI
 */

import type { ComfyUIWorkflow } from '@/lib/local/comfyui-client'

export interface TextToImageParams {
  prompt: string
  negativePrompt?: string
  model?: string
  steps?: number
  cfgScale?: number
  width?: number
  height?: number
  seed?: number
  sampler?: string
  scheduler?: string
}

export function createTextToImageWorkflow(params: TextToImageParams): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    model = 'sd_xl_base_1.0.safetensors',
    steps = 20,
    cfgScale = 7.0,
    width = 1024,
    height = 1024,
    seed = Math.floor(Math.random() * 4294967295),
    sampler = 'euler',
    scheduler = 'normal'
  } = params

  const workflow: ComfyUIWorkflow = {
    '3': {
      inputs: {
        seed,
        steps,
        cfg: cfgScale,
        sampler_name: sampler,
        scheduler,
        denoise: 1,
        model: ['4', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['5', 0]
      },
      class_type: 'KSampler',
      _meta: {
        title: 'KSampler'
      }
    },
    '4': {
      inputs: {
        ckpt_name: model
      },
      class_type: 'CheckpointLoaderSimple',
      _meta: {
        title: 'Load Checkpoint'
      }
    },
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
    '6': {
      inputs: {
        text: prompt,
        clip: ['4', 1]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'CLIP Text Encode (Positive)'
      }
    },
    '7': {
      inputs: {
        text: negativePrompt,
        clip: ['4', 1]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'CLIP Text Encode (Negative)'
      }
    },
    '8': {
      inputs: {
        samples: ['3', 0],
        vae: ['4', 2]
      },
      class_type: 'VAEDecode',
      _meta: {
        title: 'VAE Decode'
      }
    },
    '9': {
      inputs: {
        filename_prefix: 'ComfyUI',
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