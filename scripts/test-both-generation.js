#!/usr/bin/env node

// Simple test script to check if both image and video generation APIs are working
const BASE_URL = 'http://localhost:3001';

async function testImageGeneration() {
  console.log('🖼️  Testing Image Generation...');
  try {
    const response = await fetch(`${BASE_URL}/api/generate/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'A cute cat playing with a ball',
        workflow_type: 'flux',
        width: 512,
        height: 512
      })
    });

    const result = await response.json();
    if (response.ok) {
      console.log('✅ Image generation successful!');
      console.log('   Prompt ID:', result.prompt_id);
      return true;
    } else {
      console.log('❌ Image generation failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Image generation error:', error.message);
    return false;
  }
}

async function testVideoGeneration() {
  console.log('🎥 Testing Video Generation...');
  try {
    const response = await fetch(`${BASE_URL}/api/generate/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'A dog running in a field',
        workflow_type: 'wan22',
        width: 512,
        height: 512,
        frames: 8,
        steps: 2
      })
    });

    const result = await response.json();
    if (response.ok) {
      console.log('✅ Video generation successful!');
      console.log('   Prompt ID:', result.prompt_id);
      return true;
    } else {
      console.log('❌ Video generation failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Video generation error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing ComfyUI Integration...');
  console.log('=====================================\n');
  
  const imageSuccess = await testImageGeneration();
  console.log('');
  const videoSuccess = await testVideoGeneration();
  
  console.log('\n=====================================');
  console.log('📊 Test Results Summary:');
  console.log(`   Image Generation: ${imageSuccess ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`   Video Generation: ${videoSuccess ? '✅ WORKING' : '❌ FAILED'}`);
  
  if (imageSuccess && videoSuccess) {
    console.log('\n🎉 All systems working! Your ComfyUI integration is ready!');
  } else {
    console.log('\n⚠️  Some issues detected. Check the logs above for details.');
  }
}

main().catch(console.error);