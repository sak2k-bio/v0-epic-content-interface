const { createWAN22VideoWorkflow } = require('../lib/comfyui/workflows/wan2-video.ts')

// Test the main workflow
console.log('Testing WAN 2.2 Video Workflow...')
const testWorkflow = createWAN22VideoWorkflow({
  prompt: "A cat playing with a ball",
  negativePrompt: "blurry, low quality",
  width: 512,
  height: 512,
  frames: 16,
  steps: 4,
  cfgScale: 3.5
})

console.log('Generated workflow:')
console.log(JSON.stringify(testWorkflow, null, 2))

// Test simplified workflow
console.log('\n\nTesting WAN 2.2 Simple Video Workflow...')
const { createWAN22VideoSimpleWorkflow } = require('../lib/comfyui/workflows/wan2-video.ts')
const testSimpleWorkflow = createWAN22VideoSimpleWorkflow({
  prompt: "A dog running in a field",
  width: 512,
  height: 512,
  frames: 8,
  steps: 2
})

console.log('Generated simple workflow:')
console.log(JSON.stringify(testSimpleWorkflow, null, 2))