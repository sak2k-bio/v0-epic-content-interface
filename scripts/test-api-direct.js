/**
 * Direct API Test - Test Next.js API route manually
 */

async function testAPIRoute() {
  console.log('🧪 Testing Next.js API Route Directly...\n');
  
  const testData = {
    prompt: "A futuristic cityscape at sunset",
    negativePrompt: "",
    workflow: 'flux',
    steps: 20,
    cfgScale: 1.0,
    aspectRatio: '1:1',
    sampler: 'euler',
    scheduler: 'normal',
    denoise: 1.0
  };
  
  console.log('📋 Request data:');
  console.log(JSON.stringify(testData, null, 2));
  
  try {
    console.log('\n🚀 Calling POST /api/generate/image...');
    
    const response = await fetch('http://localhost:3000/api/generate/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📝 Raw response:', responseText);
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ API call successful!');
        console.log('🆔 Prompt ID:', result.promptId);
        console.log('📨 Message:', result.message);
        
        // Immediately check ComfyUI history to see if this prompt ID exists
        console.log('\n🔍 Checking ComfyUI immediately for this prompt ID...');
        await checkComfyUIForPrompt(result.promptId);
        
      } catch (parseError) {
        console.log('❌ Failed to parse successful response as JSON');
      }
    } else {
      console.log('❌ API call failed');
      try {
        const errorResult = JSON.parse(responseText);
        console.log('Error details:', errorResult);
      } catch {
        console.log('Raw error response:', responseText);
      }
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

async function checkComfyUIForPrompt(promptId) {
  try {
    const historyResponse = await fetch(`http://localhost:8188/history/${promptId}`);
    
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      
      if (history[promptId]) {
        console.log('✅ Found prompt in ComfyUI history immediately!');
        console.log('📊 Status:', history[promptId].status);
      } else {
        console.log('⚠️  Prompt NOT found in ComfyUI history');
        
        // Check recent history
        const allHistoryResponse = await fetch('http://localhost:8188/history');
        if (allHistoryResponse.ok) {
          const allHistory = await allHistoryResponse.json();
          console.log('📜 Recent ComfyUI prompts:');
          Object.keys(allHistory).slice(-3).forEach(id => {
            console.log(`   - ${id}: ${allHistory[id].status?.status_str || 'unknown'}`);
          });
        }
      }
    } else {
      console.log('❌ Failed to check ComfyUI history');
    }
  } catch (error) {
    console.log('❌ Error checking ComfyUI:', error.message);
  }
}

// Also test the queue endpoint directly to see what's in ComfyUI's queue
async function checkComfyUIQueue() {
  try {
    console.log('\n🔍 Checking ComfyUI queue status...');
    const queueResponse = await fetch('http://localhost:8188/queue');
    
    if (queueResponse.ok) {
      const queue = await queueResponse.json();
      console.log('📋 Queue status:');
      console.log('  Running:', queue.queue_running?.length || 0);
      console.log('  Pending:', queue.queue_pending?.length || 0);
      
      if (queue.queue_running && queue.queue_running.length > 0) {
        console.log('🏃 Currently running:');
        queue.queue_running.forEach(item => {
          console.log(`   - ${item[1]} (number: ${item[0]})`);
        });
      }
      
      if (queue.queue_pending && queue.queue_pending.length > 0) {
        console.log('⏳ Pending:');
        queue.queue_pending.forEach(item => {
          console.log(`   - ${item[1]} (number: ${item[0]})`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Error checking queue:', error.message);
  }
}

// Run the tests
console.log('🧪 Direct API Route Test');
console.log('=' .repeat(50));

checkComfyUIQueue()
  .then(() => testAPIRoute())
  .catch(console.error);