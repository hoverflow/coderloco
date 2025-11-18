/**
 * Intent Classification System
 *
 * Classifies user intent with minimal tokens to route to specialized subagents
 */

export type SubagentType =
  | 'analyzer'
  | 'modifier'
  | 'generator'
  | 'debugger'
  | 'explainer'
  | 'searcher'
  | 'executor'
  | 'refactor'
  | 'tester';

export interface ClassificationResult {
  category: SubagentType;
  confidence: number;
  wasJson: boolean;
  responseTime: number;
  tokensUsed?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

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

/**
 * Parse JSON response from model, with fallback for non-JSON responses
 */
function parseModelResponse(rawResponse: string): {
  category: string;
  confidence: number | null;
  wasJson: boolean;
} {
  try {
    // Try to extract JSON from code block if present
    const codeBlockMatch = rawResponse.match(
      /```(?:json)?\s*(\{[\s\S]*?\})\s*```/,
    );
    if (codeBlockMatch) {
      const parsed = JSON.parse(codeBlockMatch[1]);
      return {
        category: parsed.category?.toLowerCase(),
        confidence: parsed.confidence,
        wasJson: true,
      };
    }

    // Try to parse as direct JSON
    const parsed = JSON.parse(rawResponse);
    return {
      category: parsed.category?.toLowerCase(),
      confidence: parsed.confidence,
      wasJson: true,
    };
  } catch {
    // Fallback: treat as plain text response
    const cleaned = rawResponse.trim().toLowerCase();

    // Try to find a category name in the response
    const categories = [
      'analyzer',
      'modifier',
      'generator',
      'debugger',
      'explainer',
      'searcher',
      'executor',
      'refactor',
      'tester',
    ];

    for (const category of categories) {
      if (cleaned.includes(category)) {
        return {
          category,
          confidence: null,
          wasJson: false,
        };
      }
    }

    // Default fallback
    return {
      category: cleaned,
      confidence: null,
      wasJson: false,
    };
  }
}

/**
 * Classify user intent using OpenAI-compatible API
 *
 * @param userInput - The user's request
 * @param apiConfig - API configuration (baseURL, model, apiKey)
 * @returns Classification result with category and confidence
 */
export async function classifyIntent(
  userInput: string,
  apiConfig: {
    baseURL: string;
    model: string;
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
  },
): Promise<ClassificationResult> {
  const prompt = CLASSIFICATION_PROMPT.replace('{USER_INPUT}', userInput);
  const startTime = Date.now();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiConfig.apiKey) {
      headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
    }

    const response = await fetch(`${apiConfig.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: apiConfig.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: apiConfig.temperature ?? 0.1,
        max_tokens: apiConfig.maxTokens ?? 50,
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

    return {
      category: parsed.category as SubagentType,
      confidence: parsed.confidence ?? 0.5,
      wasJson: parsed.wasJson,
      responseTime,
      tokensUsed: data.usage,
    };
  } catch (error) {
    console.error('Error classifying intent:', error);

    // Return default fallback
    return {
      category: 'analyzer',
      confidence: 0.0,
      wasJson: false,
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Get estimated token savings from using subagent system
 */
export function getTokenSavings(
  classificationTokens: number,
  executionTokens: number,
): {
  totalTokens: number;
  traditionalTokens: number;
  savings: number;
  savingsPercent: number;
} {
  const totalTokens = classificationTokens + executionTokens;
  const traditionalTokens = 1500; // Estimated traditional prompt size

  return {
    totalTokens,
    traditionalTokens,
    savings: traditionalTokens - totalTokens,
    savingsPercent: Math.round(
      ((traditionalTokens - totalTokens) / traditionalTokens) * 100,
    ),
  };
}
