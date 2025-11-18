#!/usr/bin/env node

/**
 * Intent Classification Test Script
 *
 * Goal: Test if we can accurately classify user intent with minimal prompts
 * to optimize for hardware-constrained environments
 */

// Agent types (subagents)
const AGENT_TYPES = {
  ANALYZER: 'analyzer',      // analyze code/files
  MODIFIER: 'modifier',      // modify existing code
  GENERATOR: 'generator',    // generate new code
  DEBUGGER: 'debugger',      // debug/fix errors
  EXPLAINER: 'explainer',    // explain code
  SEARCHER: 'searcher',      // search codebase
  EXECUTOR: 'executor',      // execute commands/scripts
  REFACTOR: 'refactor',      // refactor code
  TESTER: 'tester',          // create/run tests
};

// System prompt for JSON structured output
const SYSTEM_PROMPT = `You should always follow instructions and output a valid JSON object. Please use the specified JSON object structure according to the instructions.
If unsure, default to {"answer": "$your_answer"}. Ensure that the code block always ends with "\`\`\`" to indicate the end of the JSON object.`;

// Minimal classification prompt
const CLASSIFICATION_PROMPT = `Classify this request into ONE of the following categories:
- analyzer: analyze/read code or files
- modifier: modify existing code
- generator: create new code
- debugger: fix errors or debug
- explainer: explain how something works
- searcher: search in codebase
- executor: execute commands or scripts
- refactor: restructure/improve code
- tester: create or run tests

User request: {USER_INPUT}

Output the result as a JSON object with this structure:
{
  "category": "category_name",
  "confidence": 0.0-1.0
}`;

// Test cases
const TEST_CASES = [
  {
    input: "analyze this utils.js file and tell me what it does",
    expected: AGENT_TYPES.ANALYZER
  },
  {
    input: "modify this function to handle null values",
    expected: AGENT_TYPES.MODIFIER
  },
  {
    input: "create a new function to validate emails",
    expected: AGENT_TYPES.GENERATOR
  },
  {
    input: "I have an undefined error on line 42, help me fix it",
    expected: AGENT_TYPES.DEBUGGER
  },
  {
    input: "explain how this sorting algorithm works",
    expected: AGENT_TYPES.EXPLAINER
  },
  {
    input: "find all files that use the axios library",
    expected: AGENT_TYPES.SEARCHER
  },
  {
    input: "run npm test and show me the results",
    expected: AGENT_TYPES.EXECUTOR
  },
  {
    input: "refactor this class to use dependency injection",
    expected: AGENT_TYPES.REFACTOR
  },
  {
    input: "write unit tests for this function",
    expected: AGENT_TYPES.TESTER
  },
  {
    input: "read the README.md file",
    expected: AGENT_TYPES.ANALYZER
  },
  {
    input: "change the variable name from count to totalCount everywhere",
    expected: AGENT_TYPES.MODIFIER
  },
  {
    input: "generate a React component for login form",
    expected: AGENT_TYPES.GENERATOR
  },
];

// GLM-4 model configuration
const MODEL_CONFIG = {
  baseURL: 'http://10.0.0.205:8080/v1',
  model: 'glm-4',
  temperature: 0.1,  // Low temperature for consistent classification
  maxTokens: 10,     // We only need one word
};

/**
 * Parse JSON response from model, with fallback for non-JSON responses
 */
function parseModelResponse(rawResponse) {
  try {
    // Try to extract JSON from code block if present
    const codeBlockMatch = rawResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      const parsed = JSON.parse(codeBlockMatch[1]);
      return {
        category: parsed.category?.toLowerCase(),
        confidence: parsed.confidence,
        rawResponse: rawResponse,
        wasJson: true
      };
    }

    // Try to parse as direct JSON
    const parsed = JSON.parse(rawResponse);
    return {
      category: parsed.category?.toLowerCase(),
      confidence: parsed.confidence,
      rawResponse: rawResponse,
      wasJson: true
    };
  } catch (e) {
    // Fallback: treat as plain text response
    const cleaned = rawResponse.trim().toLowerCase();

    // Try to find a category name in the response
    for (const agentType of Object.values(AGENT_TYPES)) {
      if (cleaned.includes(agentType)) {
        return {
          category: agentType,
          confidence: null,
          rawResponse: rawResponse,
          wasJson: false
        };
      }
    }

    // If no match found, return the cleaned response as-is
    return {
      category: cleaned,
      confidence: null,
      rawResponse: rawResponse,
      wasJson: false
    };
  }
}

/**
 * Call GLM-4 model to classify intent with structured JSON output
 */
async function classifyIntent(userInput, verbose = true) {
  const prompt = CLASSIFICATION_PROMPT.replace('{USER_INPUT}', userInput);

  if (verbose) {
    console.log('\n' + '='.repeat(80));
    console.log('USER INPUT:', userInput);
    console.log('-'.repeat(80));
    console.log('SYSTEM PROMPT:');
    console.log(SYSTEM_PROMPT);
    console.log('-'.repeat(80));
    console.log('USER PROMPT:');
    console.log(prompt);
    console.log('-'.repeat(80));
  }

  try {
    const startTime = Date.now();

    const response = await fetch(`${MODEL_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: MODEL_CONFIG.temperature,
        max_tokens: 50, // Increased for JSON structure
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;
    const rawResponse = data.choices[0].message.content.trim();

    // Parse response with fallback
    const parsed = parseModelResponse(rawResponse);

    if (verbose) {
      console.log('RAW RESPONSE:', rawResponse);
      console.log('PARSED CATEGORY:', parsed.category);
      console.log('CONFIDENCE:', parsed.confidence || 'N/A');
      console.log('WAS_JSON:', parsed.wasJson ? '✅' : '❌ (fallback used)');
      console.log('RESPONSE TIME:', responseTime, 'ms');
      console.log('TOKENS USED:', data.usage || 'N/A');
    }

    return {
      category: parsed.category,
      confidence: parsed.confidence,
      wasJson: parsed.wasJson,
      responseTime: responseTime,
      tokensUsed: data.usage
    };
  } catch (error) {
    console.error('❌ Error calling model:', error.message);
    return {
      category: 'error',
      confidence: null,
      wasJson: false,
      responseTime: 0,
      tokensUsed: null
    };
  }
}

/**
 * Run all test cases
 */
async function runTests() {
  console.log('🧪 Intent Classification Test - Subagent Router (JSON Structured Output)');
  console.log('📊 Total test cases:', TEST_CASES.length);
  console.log('🤖 Model:', MODEL_CONFIG.model);
  console.log('🌐 Endpoint:', MODEL_CONFIG.baseURL);

  let correctCount = 0;
  let jsonSuccessCount = 0;
  const results = [];
  const responseTimes = [];
  const confidences = [];

  for (const testCase of TEST_CASES) {
    const result = await classifyIntent(testCase.input);

    const isCorrect = result.category === testCase.expected;

    results.push({
      input: testCase.input,
      expected: testCase.expected,
      classified: result.category,
      confidence: result.confidence,
      wasJson: result.wasJson,
      correct: isCorrect,
      responseTime: result.responseTime,
      tokensUsed: result.tokensUsed
    });

    if (isCorrect) {
      correctCount++;
    }

    if (result.wasJson) {
      jsonSuccessCount++;
    }

    if (result.confidence !== null) {
      confidences.push(result.confidence);
    }

    responseTimes.push(result.responseTime);

    console.log(`Expected: ${testCase.expected}`);
    console.log(`Got: ${result.category} (confidence: ${result.confidence || 'N/A'})`);
    console.log(`✓ Correct: ${isCorrect ? '✅' : '❌'}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📈 FINAL RESULTS');
  console.log('='.repeat(80));
  console.log(`Correct: ${correctCount}/${TEST_CASES.length}`);
  console.log(`Accuracy: ${((correctCount / TEST_CASES.length) * 100).toFixed(2)}%`);
  console.log(`JSON Success Rate: ${jsonSuccessCount}/${TEST_CASES.length} (${((jsonSuccessCount / TEST_CASES.length) * 100).toFixed(2)}%)`);

  if (confidences.length > 0) {
    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    console.log(`Average Confidence: ${avgConfidence.toFixed(2)}`);
    console.log(`Min Confidence: ${Math.min(...confidences).toFixed(2)}`);
    console.log(`Max Confidence: ${Math.max(...confidences).toFixed(2)}`);
  }

  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Min response time: ${Math.min(...responseTimes)}ms`);
  console.log(`Max response time: ${Math.max(...responseTimes)}ms`);
  console.log('\n');

  // Show classification errors
  const errors = results.filter(r => !r.correct);
  if (errors.length > 0) {
    console.log('❌ CLASSIFICATION ERRORS:');
    errors.forEach(err => {
      console.log(`  Input: "${err.input}"`);
      console.log(`  Expected: ${err.expected}, Got: ${err.classified}\n`);
    });
  }

  // Show JSON parsing failures
  const jsonFails = results.filter(r => !r.wasJson);
  if (jsonFails.length > 0) {
    console.log('⚠️  NON-JSON RESPONSES (fallback used):');
    jsonFails.forEach(fail => {
      console.log(`  Input: "${fail.input}"`);
      console.log(`  Classified: ${fail.classified}\n`);
    });
  }

  return results;
}

/**
 * Performance test: measure tokens/time
 */
function analyzePromptSize() {
  console.log('\n📏 PROMPT SIZE ANALYSIS');
  console.log('='.repeat(80));

  const promptTemplate = CLASSIFICATION_PROMPT.replace('{USER_INPUT}', '');
  const promptLength = promptTemplate.length;

  // Approximate token estimation (1 token ≈ 4 characters)
  const estimatedTokens = Math.ceil(promptLength / 4);

  console.log(`Characters in template: ${promptLength}`);
  console.log(`Estimated tokens (template): ${estimatedTokens}`);
  console.log(`Estimated tokens (with avg 50 char input): ${estimatedTokens + 13}`);
  console.log('\n💡 Benefit compared to full prompt:');
  console.log(`   Full tool-calling prompt: ~800-2000 tokens`);
  console.log(`   Our minimal prompt: ~${estimatedTokens + 13} tokens`);
  console.log(`   Savings: ~${Math.round((1 - (estimatedTokens + 13) / 1000) * 100)}%`);
  console.log('='.repeat(80));
}

// Main execution
if (require.main === module) {
  console.clear();
  analyzePromptSize();
  runTests().catch(console.error);
}

module.exports = {
  AGENT_TYPES,
  classifyIntent,
  parseModelResponse,
  SYSTEM_PROMPT,
  CLASSIFICATION_PROMPT
};
