/**
 * Text-to-Video workflow template for ComfyUI using AnimateDiff
 */

import type { ComfyUIWorkflow } from '@/lib/local/comfyui-client'

export interface TextToVideoParams {
  prompt: string
  negativePrompt?: string
  model?: string
  motionModule?: string
  steps?: number
  cfgScale?: number
  width?: number
  height?: number
  frames?: number
  fps?: number
  seed?: number
  sampler?: string
  scheduler?: string
}

export function createTextToVideoWorkflow(params: TextToVideoParams): ComfyUIWorkflow {
  const {
    prompt,
    negativePrompt = '',
    model = 'sd_xl_base_1.0.safetensors',
    motionModule = 'animatediff_motion_adapter.ckpt',
    steps = 25,
    cfgScale = 7.5,
    width = 512,
    height = 512,
    frames = 16,
    fps = 8,
    seed = Math.floor(Math.random() * 4294967295),
    sampler = 'euler',
    scheduler = 'karras'
  } = params

  const workflow: ComfyUIWorkflow = {
    '3': {
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
        batch_size: frames
      },
      class_type: 'EmptyLatentImage',
      _meta: {
        title: 'Empty Latent Image'
      }
    },
    '6': {
      inputs: {
        text: prompt,
        clip: ['3', 1]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'Positive Prompt'
      }
    },
    '7': {
      inputs: {
        text: negativePrompt,
        clip: ['3', 1]
      },
      class_type: 'CLIPTextEncode',
      _meta: {
        title: 'Negative Prompt'
      }
    },
    '10': {
      inputs: {
        model_name: motionModule
      },
      class_type: 'ADE_LoadAnimateDiffModel',
      _meta: {
        title: 'Load AnimateDiff Model'
      }
    },
    '11': {
      inputs: {
        motion_model: ['10', 0],
        model: ['3', 0]
      },
      class_type: 'ADE_ApplyAnimateDiffModel',
      _meta: {
        title: 'Apply AnimateDiff Model'
      }
    },
    '12': {
      inputs: {
        seed,
        steps,
        cfg: cfgScale,
        sampler_name: sampler,
        scheduler,
        denoise: 1,
        model: ['11', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['5', 0]
      },
      class_type: 'KSampler',
      _meta: {
        title: 'KSampler'
      }
    },
    '8': {
      inputs: {
        samples: ['12', 0],
        vae: ['3', 2]
      },
      class_type: 'VAEDecode',
      _meta: {
        title: 'VAE Decode'
      }
    },
    '14': {
      inputs: {
        images: ['8', 0],
        fps,
        method: 'default',
        filename_prefix: 'ComfyUI_video',
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