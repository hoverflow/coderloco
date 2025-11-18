#!/usr/bin/env node

/**
 * Interactive Demo: Subagent System in Action
 *
 * This demonstrates the visual experience users will see when
 * a subagent is selected and working on their request.
 */

const {
  buildSubagentPrompt,
  displaySubagentSelection,
  displayAgentActivity,
  displayAgentCompletion
} = require('./subagent-prompts.js');

const { classifyIntent } = require('./intent-classifier-test.js');

/**
 * Simulate a complete user request flow
 */
async function simulateUserRequest(userInput) {
  console.log('\n' + '━'.repeat(80));
  console.log(`\x1b[1m💬 USER:\x1b[0m ${userInput}`);
  console.log('━'.repeat(80));

  // Step 1: Classify intent (fast, minimal tokens)
  console.log('\x1b[2m⚡ Classifying intent...\x1b[0m');
  const startClassify = Date.now();

  const classification = await classifyIntent(userInput, false);
  const classifyDuration = Date.now() - startClassify;

  console.log(`\x1b[2m✓ Intent classified in ${classifyDuration}ms (confidence: ${classification.confidence || 'N/A'})\x1b[0m`);

  // Step 2: Display selected subagent
  displaySubagentSelection(classification.category, userInput);

  // Step 3: Build specialized prompt
  const promptConfig = buildSubagentPrompt(classification.category, userInput, {
    projectInfo: 'CoderLoco - A CLI coding assistant',
    availableTools: [
      { name: 'ReadFile', description: 'Read file content' },
      { name: 'WriteFile', description: 'Write content to a file' },
      { name: 'Shell', description: 'Execute shell commands' }
    ]
  });

  // Step 4: Simulate agent working (visual feedback)
  displayAgentActivity(classification.category, 'Preparing specialized context...');
  await sleep(200);

  displayAgentActivity(classification.category, 'Sending request to GLM-4...');
  await sleep(300);

  displayAgentActivity(classification.category, 'Processing response...');
  await sleep(250);

  // Step 5: Show completion
  displayAgentCompletion(classification.category, classifyDuration + 750);

  // Display token savings
  console.log('\x1b[2m💡 Token Efficiency:\x1b[0m');
  console.log(`   Classification: ~120 tokens (${classifyDuration}ms)`);
  console.log(`   Specialized prompt: ~300 tokens (estimated)`);
  console.log(`   \x1b[32mTotal savings vs full prompt: ~75%\x1b[0m`);
  console.log('\n' + '━'.repeat(80) + '\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Interactive demo with multiple examples
 */
async function runInteractiveDemo() {
  console.clear();

  console.log('\x1b[1m\x1b[36m');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                            ║');
  console.log('║                    🚀 SUBAGENT SYSTEM DEMO                                 ║');
  console.log('║                                                                            ║');
  console.log('║              Visual Experience of Hardware-Optimized AI                   ║');
  console.log('║                                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('\x1b[0m\n');

  const examples = [
    'analyze this utils.js file and explain what it does',
    'create a new function to validate email addresses',
    'I have a TypeError on line 42, help me debug it',
    'refactor this class to use dependency injection',
    'find all files that import the axios library'
  ];

  console.log('\x1b[1mRunning interactive examples...\x1b[0m');
  console.log('\x1b[2mWatch how each request is routed to a specialized subagent\x1b[0m\n');

  for (const example of examples) {
    await simulateUserRequest(example);
    await sleep(1000);
  }

  console.log('\n\x1b[1m\x1b[32m✨ Demo Complete!\x1b[0m\n');
  console.log('\x1b[2mKey Benefits:\x1b[0m');
  console.log('  • \x1b[32m⚡ Fast\x1b[0m - Intent classification takes ~400ms with minimal tokens');
  console.log('  • \x1b[32m🎯 Accurate\x1b[0m - Specialized prompts for each task type');
  console.log('  • \x1b[32m👁️ Visible\x1b[0m - Users see exactly what\'s happening');
  console.log('  • \x1b[32m🖥️ Efficient\x1b[0m - Optimized for hardware-constrained environments');
  console.log('  • \x1b[32m🎨 Delightful\x1b[0m - Fun, colorful, interactive experience\n');
}

// Run demo
if (require.main === module) {
  runInteractiveDemo().catch(console.error);
}

module.exports = {
  simulateUserRequest
};
