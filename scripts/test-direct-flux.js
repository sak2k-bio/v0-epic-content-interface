/**
 * Direct ComfyUI FLUX Test
 * Test FLUX generation directly with ComfyUI API using your exact prompt
 */

const ComfyUIBaseURL = 'http://localhost:8188';

async function testDirectFLUX() {
  console.log('🧪 Testing Direct FLUX Generation...\n');
  
  const testPrompt = "A futuristic cityscape at sunset";
  const seed = Math.floor(Math.random() * 4294967295);
  
  // Your exact FLUX workflow structure
  const fluxWorkflow = {
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
        "text": testPrompt, // Your exact prompt
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
        "noise_seed": seed
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
        "filename_prefix": "FLUX_direct_test",
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };
  
  console.log(`📝 Prompt: "${testPrompt}"`);
  console.log(`🎲 Seed: ${seed}`);
  console.log(`📐 Size: 1024x1024`);
  
  try {
    // Queue the workflow
    console.log('\n🚀 Queueing FLUX workflow directly to ComfyUI...');
    
    const response = await fetch(`${ComfyUIBaseURL}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: fluxWorkflow,
        client_id: 'direct_flux_test'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Workflow queue failed:', response.status);
      console.log('Error details:', errorText);
      return null;
    }
    
    const result = await response.json();
    console.log('✅ Workflow queued successfully!');
    console.log(`🆔 Prompt ID: ${result.prompt_id}`);
    
    if (result.node_errors && Object.keys(result.node_errors).length > 0) {
      console.log('⚠️  Node errors detected:');
      console.log(JSON.stringify(result.node_errors, null, 2));
      return null;
    }
    
    // Monitor execution
    console.log('\n⏱️  Monitoring execution...');
    await monitorExecution(result.prompt_id);
    
    return result.prompt_id;
    
  } catch (error) {
    console.log('❌ Direct FLUX test failed:', error.message);
    return null;
  }
}

async function monitorExecution(promptId) {
  const maxChecks = 60; // 2 minutes max
  let checks = 0;
  
  const checkInterval = setInterval(async () => {
    checks++;
    
    try {
      const historyResponse = await fetch(`${ComfyUIBaseURL}/history/${promptId}`);
      
      if (historyResponse.ok) {
        const history = await historyResponse.json();
        
        if (history[promptId]) {
          const execution = history[promptId];
          
          if (execution.status?.completed) {
            console.log('✅ Execution completed!');
            
            if (execution.outputs && Object.keys(execution.outputs).length > 0) {
              console.log('🖼️  Generated outputs:');
              Object.entries(execution.outputs).forEach(([nodeId, output]) => {
                if (output.images) {
                  console.log(`   Node ${nodeId}: ${output.images.length} image(s)`);
                  output.images.forEach(img => {
                    console.log(`      - ${img.filename} (${img.subfolder || 'root'}/${img.type})`);
                  });
                }
              });
              
              console.log('\n🎉 SUCCESS! Image was generated with your prompt!');
            } else {
              console.log('⚠️  Completed but no outputs found');
            }
            
            clearInterval(checkInterval);
            return;
          } else if (execution.status?.status_str === 'error') {
            console.log('❌ Execution failed with errors');
            if (execution.status.messages) {
              execution.status.messages.forEach(msg => {
                console.log(`   Error: ${msg[0]} - ${JSON.stringify(msg[1])}`);
              });
            }
            clearInterval(checkInterval);
            return;
          }
        }
      }
      
      if (checks >= maxChecks) {
        console.log('❌ Monitoring timed out after 2 minutes');
        clearInterval(checkInterval);
        return;
      }
      
      if (checks % 5 === 0) {
        console.log(`   Still processing... (${checks}/${maxChecks})`);
      }
      
    } catch (error) {
      console.log('   ❌ Monitor error:', error.message);
    }
  }, 2000); // Check every 2 seconds
}

// Run the test
console.log('🧪 Direct ComfyUI FLUX Test');
console.log('=' .repeat(50));

testDirectFLUX().then(promptId => {
  console.log('\n' + '=' .repeat(50));
  if (promptId) {
    console.log('✨ Direct test completed!');
    console.log('💡 Check ComfyUI interface to see if the image matches your prompt.');
    console.log('💡 If the image is correct, the issue is in your Next.js polling logic.');
    console.log('💡 If the image is wrong, the issue is in the prompt processing.');
  } else {
    console.log('❌ Direct test failed!');
    console.log('💡 Check ComfyUI console for detailed error messages.');
  }
}).catch(console.error);
