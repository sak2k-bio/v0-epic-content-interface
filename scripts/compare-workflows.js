/**
 * Compare Working Workflow vs TypeScript Generated Workflow
 */

// Import your TypeScript workflow function (we'll simulate it)
function createFLUXImageWorkflow(params) {
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
  } = params;

  // This workflow matches your JSON file exactly
  const workflow = {
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
  };

  return workflow;
}

function compareWorkflows() {
  console.log('🔍 Comparing Workflows...\n');
  
  const testPrompt = "A futuristic cityscape at sunset";
  const testSeed = 123456789;
  
  // Create the known working workflow
  const workingWorkflow = {
    "12": {
      "inputs": {
        "unet_name": "FLUX1\\flux1-dev-fp8.safetensors",
        "weight_dtype": "fp8_e4m3fn"
      },
      "class_type": "UNETLoader"
    },
    "11": {
      "inputs": {
        "clip_name1": "t5\\t5xxl_fp8_e4m3fn_scaled.safetensors",
        "clip_name2": "clip_l.safetensors",
        "type": "flux"
      },
      "class_type": "DualCLIPLoader"
    },
    "6": {
      "inputs": {
        "text": testPrompt,
        "clip": ["11", 0]
      },
      "class_type": "CLIPTextEncode"
    },
    "22": {
      "inputs": {
        "model": ["12", 0],
        "conditioning": ["6", 0]
      },
      "class_type": "BasicGuider"
    },
    "16": {
      "inputs": {
        "sampler_name": "euler"
      },
      "class_type": "KSamplerSelect"
    },
    "17": {
      "inputs": {
        "model": ["12", 0],
        "scheduler": "normal",
        "steps": 20,
        "denoise": 1.0
      },
      "class_type": "BasicScheduler"
    },
    "50": {
      "inputs": {
        "noise_seed": testSeed
      },
      "class_type": "RandomNoise"
    },
    "51": {
      "inputs": {
        "width": 1024,
        "height": 1024,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage"
    },
    "38": {
      "inputs": {
        "sigmas": ["17", 0],
        "step": 0
      },
      "class_type": "SplitSigmas"
    },
    "13": {
      "inputs": {
        "noise": ["50", 0],
        "guider": ["22", 0],
        "sampler": ["16", 0],
        "sigmas": ["38", 1],
        "latent_image": ["51", 0]
      },
      "class_type": "SamplerCustomAdvanced"
    },
    "10": {
      "inputs": {
        "vae_name": "flux_vae.safetensors"
      },
      "class_type": "VAELoader"
    },
    "8": {
      "inputs": {
        "samples": ["13", 0],
        "vae": ["10", 0]
      },
      "class_type": "VAEDecode"
    },
    "9": {
      "inputs": {
        "filename_prefix": "FLUX_compare",
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };
  
  // Create the TypeScript generated workflow
  const typeScriptWorkflow = createFLUXImageWorkflow({
    prompt: testPrompt,
    seed: testSeed,
    width: 1024,
    height: 1024
  });
  
  console.log('🟢 Known Working Workflow:');
  console.log(JSON.stringify(workingWorkflow, null, 2));
  
  console.log('\n🟡 TypeScript Generated Workflow:');
  console.log(JSON.stringify(typeScriptWorkflow, null, 2));
  
  // Compare key differences
  console.log('\n🔍 Key Differences Analysis:');
  
  const workingKeys = Object.keys(workingWorkflow);
  const tsKeys = Object.keys(typeScriptWorkflow);
  
  console.log(`📊 Working workflow nodes: ${workingKeys.length}`);
  console.log(`📊 TypeScript workflow nodes: ${tsKeys.length}`);
  
  // Check for missing nodes
  const missingInTS = workingKeys.filter(key => !tsKeys.includes(key));
  const extraInTS = tsKeys.filter(key => !workingKeys.includes(key));
  
  if (missingInTS.length > 0) {
    console.log('❌ Missing in TypeScript:', missingInTS);
  }
  
  if (extraInTS.length > 0) {
    console.log('➕ Extra in TypeScript:', extraInTS);
  }
  
  // Compare each node in detail
  workingKeys.forEach(nodeId => {
    if (tsKeys.includes(nodeId)) {
      const workingNode = workingWorkflow[nodeId];
      const tsNode = typeScriptWorkflow[nodeId];
      
      // Compare class_type
      if (workingNode.class_type !== tsNode.class_type) {
        console.log(`❌ Node ${nodeId} class_type mismatch: ${workingNode.class_type} vs ${tsNode.class_type}`);
      }
      
      // Compare inputs (key by key)
      const workingInputs = workingNode.inputs || {};
      const tsInputs = tsNode.inputs || {};
      
      Object.keys(workingInputs).forEach(inputKey => {
        const workingValue = workingInputs[inputKey];
        const tsValue = tsInputs[inputKey];
        
        if (JSON.stringify(workingValue) !== JSON.stringify(tsValue)) {
          console.log(`⚠️  Node ${nodeId}.${inputKey}: ${JSON.stringify(workingValue)} vs ${JSON.stringify(tsValue)}`);
        }
      });
    }
  });
  
  console.log('\n✅ Comparison complete!');
}

// Run the comparison
compareWorkflows();