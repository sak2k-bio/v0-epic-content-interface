/**
 * ComfyUI Diagnostic Script
 * Test ComfyUI server connectivity and basic functionality
 */

const ComfyUIBaseURL = 'http://localhost:8188';

async function testComfyUIConnection() {
  console.log('🔍 Testing ComfyUI Server Connection...\n');
  
  try {
    // Test 1: Basic server health
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${ComfyUIBaseURL}/system_stats`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (healthResponse.ok) {
      const stats = await healthResponse.json();
      console.log('✅ Server is running');
      console.log('📊 System stats:', JSON.stringify(stats, null, 2));
    } else {
      console.log('❌ Server health check failed:', healthResponse.status);
      return false;
    }
    
    // Test 2: Check queue status
    console.log('\n2. Testing queue status...');
    const queueResponse = await fetch(`${ComfyUIBaseURL}/queue`);
    if (queueResponse.ok) {
      const queue = await queueResponse.json();
      console.log('✅ Queue accessible');
      console.log('📋 Queue status:', {
        running: queue.queue_running?.length || 0,
        pending: queue.queue_pending?.length || 0
      });
    } else {
      console.log('❌ Queue check failed:', queueResponse.status);
    }
    
    // Test 3: Check available nodes/object info
    console.log('\n3. Testing object info (available nodes)...');
    const objectInfoResponse = await fetch(`${ComfyUIBaseURL}/object_info`);
    if (objectInfoResponse.ok) {
      const objectInfo = await objectInfoResponse.json();
      console.log('✅ Object info accessible');
      
      // Check for FLUX-specific nodes
      const fluxNodes = {
        'UNETLoader': !!objectInfo['UNETLoader'],
        'DualCLIPLoader': !!objectInfo['DualCLIPLoader'],
        'BasicScheduler': !!objectInfo['BasicScheduler'],
        'BasicGuider': !!objectInfo['BasicGuider'],
        'SamplerCustomAdvanced': !!objectInfo['SamplerCustomAdvanced'],
        'RandomNoise': !!objectInfo['RandomNoise'],
        'SplitSigmas': !!objectInfo['SplitSigmas']
      };
      
      console.log('🧩 FLUX node availability:');
      Object.entries(fluxNodes).forEach(([node, available]) => {
        console.log(`  ${available ? '✅' : '❌'} ${node}`);
      });
      
      // Check for model availability
      if (objectInfo['UNETLoader']) {
        const unetOptions = objectInfo['UNETLoader'].input?.required?.unet_name;
        if (unetOptions && unetOptions[0]) {
          console.log('\n📦 Available UNET models:');
          unetOptions[0].slice(0, 5).forEach(model => console.log(`  - ${model}`));
          if (unetOptions[0].length > 5) {
            console.log(`  ... and ${unetOptions[0].length - 5} more`);
          }
        }
      }
      
    } else {
      console.log('❌ Object info check failed:', objectInfoResponse.status);
    }
    
    // Test 4: Check history
    console.log('\n4. Testing history access...');
    const historyResponse = await fetch(`${ComfyUIBaseURL}/history`);
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log('✅ History accessible');
      console.log('📜 Recent executions:', Object.keys(history).length);
    } else {
      console.log('❌ History check failed:', historyResponse.status);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure ComfyUI is running on localhost:8188');
    console.log('2. Check if any firewall is blocking the connection');
    console.log('3. Try accessing http://localhost:8188 in your browser');
    return false;
  }
}

// Test a simple workflow
async function testSimpleWorkflow() {
  console.log('\n\n🧪 Testing Simple Workflow Execution...\n');
  
  const simpleWorkflow = {
    "3": {
      "inputs": {
        "seed": 156680208700286,
        "steps": 20,
        "cfg": 7.0,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1.0,
        "model": ["4", 0],
        "positive": ["6", 0],
        "negative": ["7", 0],
        "latent_image": ["5", 0]
      },
      "class_type": "KSampler"
    },
    "4": {
      "inputs": {
        "ckpt_name": "sd_xl_base_1.0.safetensors"
      },
      "class_type": "CheckpointLoaderSimple"
    },
    "5": {
      "inputs": {
        "width": 512,
        "height": 512,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage"
    },
    "6": {
      "inputs": {
        "text": "a simple test image",
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "7": {
      "inputs": {
        "text": "",
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "8": {
      "inputs": {
        "samples": ["3", 0],
        "vae": ["4", 2]
      },
      "class_type": "VAEDecode"
    },
    "9": {
      "inputs": {
        "filename_prefix": "ComfyUI_test",
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };
  
  try {
    const response = await fetch(`${ComfyUIBaseURL}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: simpleWorkflow,
        client_id: 'diagnostic_test'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Workflow queued successfully');
      console.log('🆔 Prompt ID:', result.prompt_id);
      
      if (result.node_errors && Object.keys(result.node_errors).length > 0) {
        console.log('⚠️  Node errors detected:');
        console.log(JSON.stringify(result.node_errors, null, 2));
      }
      
      return result.prompt_id;
    } else {
      const errorText = await response.text();
      console.log('❌ Workflow queue failed:', response.status);
      console.log('Error details:', errorText);
      return null;
    }
  } catch (error) {
    console.log('❌ Workflow test failed:', error.message);
    return null;
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log('🩺 ComfyUI Integration Diagnostics\n');
  console.log('=' .repeat(50));
  
  const connectionOk = await testComfyUIConnection();
  
  if (connectionOk) {
    console.log('\n' + '=' .repeat(50));
    const promptId = await testSimpleWorkflow();
    
    if (promptId) {
      console.log('\n✨ Basic diagnostics completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('1. Check ComfyUI console for any error messages');
      console.log('2. Monitor the workflow execution in ComfyUI UI');
      console.log(`3. Check history for prompt ID: ${promptId}`);
    }
  } else {
    console.log('\n❌ Connection failed - cannot proceed with workflow tests');
    console.log('\n🔧 Please fix connection issues first');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('Diagnostics complete!');
}

// Run diagnostics
runDiagnostics().catch(console.error);