/**
 * Test FLUX workflow with your exact configuration
 */

const ComfyUIBaseURL = 'http://localhost:8188';

async function testFLUXWorkflow() {
  console.log('🧪 Testing FLUX Workflow...\n');
  
  // This matches your JSON workflow structure exactly
  const fluxWorkflow = {
    "51": {
      "inputs": {
        "width": 768,
        "height": 1024,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage"
    },
    "50": {
      "inputs": {
        "noise_seed": Math.floor(Math.random() * 4294967295)
      },
      "class_type": "RandomNoise"
    },
    "16": {
      "inputs": {
        "sampler_name": "euler"
      },
      "class_type": "KSamplerSelect"
    },
    "38": {
      "inputs": {
        "sigmas": ["17", 0],
        "step": 0
      },
      "class_type": "SplitSigmas"
    },
    "17": {
      "inputs": {
        "model": ["12", 0],
        "scheduler": "normal",
        "steps": 20,
        "denoise": 1
      },
      "class_type": "BasicScheduler"
    },
    "22": {
      "inputs": {
        "model": ["12", 0],
        "conditioning": ["6", 0]
      },
      "class_type": "BasicGuider"
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
    "9": {
      "inputs": {
        "filename_prefix": "FLUX_test",
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    },
    "6": {
      "inputs": {
        "text": "a beautiful landscape with mountains and a lake, detailed, high quality",
        "clip": ["11", 0]
      },
      "class_type": "CLIPTextEncode"
    }
  };
  
  try {
    console.log('🚀 Queuing FLUX workflow...');
    const response = await fetch(`${ComfyUIBaseURL}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: fluxWorkflow,
        client_id: 'flux_test_client'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ FLUX workflow queued successfully!');
      console.log('🆔 Prompt ID:', result.prompt_id);
      
      if (result.node_errors && Object.keys(result.node_errors).length > 0) {
        console.log('⚠️  Node errors detected:');
        console.log(JSON.stringify(result.node_errors, null, 2));
        return null;
      }
      
      console.log('✨ Workflow is executing! Check ComfyUI UI for progress.');
      
      // Wait a bit and then check history
      console.log('\n⏱️  Waiting 5 seconds before checking execution status...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await checkExecutionStatus(result.prompt_id);
      
      return result.prompt_id;
    } else {
      const errorText = await response.text();
      console.log('❌ FLUX workflow queue failed:', response.status);
      console.log('Error details:', errorText);
      return null;
    }
  } catch (error) {
    console.log('❌ FLUX workflow test failed:', error.message);
    return null;
  }
}

async function checkExecutionStatus(promptId) {
  try {
    console.log('\n🔍 Checking execution status...');
    const historyResponse = await fetch(`${ComfyUIBaseURL}/history/${promptId}`);
    
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log('📊 History response:', JSON.stringify(history, null, 2));
      
      if (history[promptId]) {
        const execution = history[promptId];
        console.log('📋 Execution found');
        
        if (execution.status?.completed) {
          console.log('✅ Execution completed!');
          
          if (execution.outputs && Object.keys(execution.outputs).length > 0) {
            console.log('🖼️  Generated outputs:');
            Object.entries(execution.outputs).forEach(([nodeId, output]) => {
              if (output.images) {
                console.log(`  Node ${nodeId}: ${output.images.length} image(s)`);
                output.images.forEach(img => {
                  console.log(`    - ${img.filename} (${img.type})`);
                });
              }
            });
          }
        } else if (execution.status?.status_str === 'error') {
          console.log('❌ Execution failed with errors');
          if (execution.status.messages) {
            execution.status.messages.forEach(msg => {
              console.log(`  Error: ${msg[0]} - ${JSON.stringify(msg[1])}`);
            });
          }
        } else {
          console.log('⏳ Execution still in progress...');
        }
      } else {
        console.log('⏳ Execution not found in history yet - still processing...');
      }
    } else {
      console.log('❌ Failed to fetch execution history');
    }
  } catch (error) {
    console.log('❌ Error checking execution status:', error.message);
  }
}

// Run the test
testFLUXWorkflow().then(promptId => {
  if (promptId) {
    console.log('\n🎉 Test completed successfully!');
    console.log('💡 If no errors were shown, your FLUX workflow should be working.');
    console.log('   Check the ComfyUI interface to see the actual image generation.');
  } else {
    console.log('\n❌ Test failed - check the errors above.');
  }
}).catch(console.error);