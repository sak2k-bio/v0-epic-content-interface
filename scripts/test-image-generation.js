/**
 * End-to-End Image Generation Test
 * Test the full pipeline from API call to image result
 */

const ComfyUIBaseURL = 'http://localhost:8188';
const NextJSBaseURL = 'http://localhost:3000';

async function testImageGeneration() {
  console.log('🎨 Testing End-to-End Image Generation...\n');
  
  const testPrompt = "A futuristic cityscape at sunset";
  
  try {
    // Step 1: Call your Next.js API
    console.log('1. 🚀 Starting image generation via Next.js API...');
    console.log(`Prompt: "${testPrompt}"`);
    
    const response = await fetch(`${NextJSBaseURL}/api/generate/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: testPrompt,
        negativePrompt: "",
        workflow: 'flux',
        steps: 20,
        cfgScale: 1.0,
        aspectRatio: '1:1',
        sampler: 'euler',
        scheduler: 'normal',
        denoise: 1.0
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.log('❌ API call failed:', response.status);
      console.log('Error:', error);
      return null;
    }
    
    const result = await response.json();
    console.log('✅ API call successful!');
    console.log(`🆔 Prompt ID: ${result.promptId}`);
    console.log(`📨 Message: ${result.message}`);
    
    // Step 2: Poll for results
    console.log('\n2. ⏱️  Polling for results...');
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max (60 * 2 seconds)
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`   Attempt ${attempts}/${maxAttempts}...`);
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      try {
        const pollResponse = await fetch(`${NextJSBaseURL}/api/generate/image?promptId=${result.promptId}`);
        
        if (!pollResponse.ok) {
          console.log(`   ⚠️  Poll failed: ${pollResponse.status}`);
          continue;
        }
        
        const pollResult = await pollResponse.json();
        console.log(`   📊 Status: ${pollResult.status}`);
        
        if (pollResult.status === 'completed') {
          console.log('✅ Generation completed!');
          console.log(`🖼️  Generated ${pollResult.images?.length || 0} images:`);
          
          if (pollResult.images && pollResult.images.length > 0) {
            pollResult.images.forEach((img, index) => {
              console.log(`   Image ${index + 1}: ${img.filename}`);
              console.log(`   Data URL length: ${img.dataUrl ? img.dataUrl.length : 'undefined'} chars`);
              console.log(`   Data URL starts with: ${img.dataUrl ? img.dataUrl.substring(0, 50) + '...' : 'undefined'}`);
            });
            
            return pollResult.images;
          } else {
            console.log('⚠️  Completed but no images found!');
            return [];
          }
        } else if (pollResult.status === 'error') {
          console.log('❌ Generation failed with error:', pollResult.error);
          return null;
        }
        
        // Continue polling if still processing
      } catch (pollError) {
        console.log(`   ❌ Poll error:`, pollError.message);
      }
    }
    
    console.log('❌ Generation timed out after 2 minutes');
    
    // Step 3: Check ComfyUI directly for debugging
    console.log('\n3. 🔍 Checking ComfyUI history directly...');
    await checkComfyUIHistory(result.promptId);
    
    return null;
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return null;
  }
}

async function checkComfyUIHistory(promptId) {
  try {
    console.log(`   Checking history for promptId: ${promptId}`);
    
    const historyResponse = await fetch(`${ComfyUIBaseURL}/history/${promptId}`);
    
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      
      if (history[promptId]) {
        const execution = history[promptId];
        console.log('   📋 Execution found in ComfyUI history');
        console.log('   📊 Status:', execution.status);
        console.log('   📁 Outputs:', Object.keys(execution.outputs || {}));
        
        if (execution.outputs) {
          Object.entries(execution.outputs).forEach(([nodeId, output]) => {
            if (output.images) {
              console.log(`   🖼️  Node ${nodeId} generated ${output.images.length} images:`);
              output.images.forEach(img => {
                console.log(`      - ${img.filename} (${img.subfolder || 'root'}/${img.type})`);
              });
            }
          });
        }
        
        if (execution.status?.messages) {
          console.log('   💬 Messages:', execution.status.messages);
        }
      } else {
        console.log('   ⚠️  Execution not found in ComfyUI history');
        
        // Show recent history for debugging
        const allHistoryResponse = await fetch(`${ComfyUIBaseURL}/history`);
        if (allHistoryResponse.ok) {
          const allHistory = await allHistoryResponse.json();
          console.log('   📜 Recent executions in ComfyUI:');
          Object.keys(allHistory).slice(-5).forEach(id => {
            console.log(`      - ${id}: ${allHistory[id].status?.status_str || 'unknown'}`);
          });
        }
      }
    } else {
      console.log('   ❌ Failed to fetch ComfyUI history:', historyResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Error checking ComfyUI history:', error.message);
  }
}

// Run the test
console.log('🧪 Starting End-to-End Image Generation Test');
console.log('=' .repeat(50));

testImageGeneration().then(images => {
  console.log('\n' + '=' .repeat(50));
  if (images && images.length > 0) {
    console.log('🎉 Test PASSED! Images generated successfully.');
    console.log('💡 Your image generation pipeline is working correctly.');
  } else {
    console.log('❌ Test FAILED! No images were generated.');
    console.log('\n🔧 Debugging suggestions:');
    console.log('1. Check if your Next.js dev server is running on port 3000');
    console.log('2. Check if ComfyUI is properly processing the workflow');
    console.log('3. Look for any errors in both Next.js and ComfyUI console logs');
    console.log('4. Verify the prompt is being passed correctly to CLIP nodes');
  }
  console.log('\n✨ Test complete!');
}).catch(console.error);