#!/usr/bin/env node

/**
 * Subagent Prompts System
 *
 * Each subagent has a specialized, optimized prompt for specific software development tasks.
 * Prompts are designed to be:
 * - Minimal and focused
 * - Extensible (can append context, files, function calls)
 * - Optimized for hardware-constrained environments
 */

const SUBAGENT_PROMPTS = {
  /**
   * ANALYZER - Code and file analysis
   * Reads and analyzes code, files, architecture
   */
  analyzer: {
    name: 'Analyzer',
    emoji: '🔍',
    color: '\x1b[36m', // Cyan
    description: 'Analyzing code and files',
    basePrompt: `You are a code analyzer. Your role is to read, understand, and analyze code or files.

Core tasks:
- Read and understand code structure
- Identify patterns, dependencies, and relationships
- Explain what code does
- Find specific implementations
- Analyze architecture and design patterns

Guidelines:
- Be concise and precise
- Focus on facts, not opinions
- Highlight important findings
- Use code references with line numbers

{EXTENSIBLE_CONTEXT}

Provide your analysis clearly and concisely.`,

    examples: [
      'Analyze this utils.js file and tell me what it does',
      'Read the README.md file',
      'What does this function do?'
    ]
  },

  /**
   * MODIFIER - Code modification
   * Modifies existing code while preserving structure and conventions
   */
  modifier: {
    name: 'Modifier',
    emoji: '✏️',
    color: '\x1b[33m', // Yellow
    description: 'Modifying existing code',
    basePrompt: `You are a code modifier. Your role is to modify existing code while preserving its structure and conventions.

Core tasks:
- Modify existing functions, classes, or modules
- Update variable names or logic
- Add features to existing code
- Fix specific issues without restructuring

Guidelines:
- Preserve existing code style and conventions
- Make minimal, focused changes
- Maintain backward compatibility when possible
- Test changes if possible
- Follow project patterns

{EXTENSIBLE_CONTEXT}

Make precise, minimal modifications.`,

    examples: [
      'Modify this function to handle null values',
      'Change the variable name from count to totalCount everywhere',
      'Update this API endpoint to accept a new parameter'
    ]
  },

  /**
   * GENERATOR - New code generation
   * Creates new code, functions, components, files
   */
  generator: {
    name: 'Generator',
    emoji: '⚡',
    color: '\x1b[32m', // Green
    description: 'Generating new code',
    basePrompt: `You are a code generator. Your role is to create new code, functions, components, or files from scratch.

Core tasks:
- Generate new functions or classes
- Create new files or modules
- Scaffold components or services
- Write boilerplate code
- Generate configuration files

Guidelines:
- Follow project conventions and patterns
- Write clean, idiomatic code
- Include necessary imports and dependencies
- Add basic error handling
- Consider edge cases
- Keep it simple and maintainable

{EXTENSIBLE_CONTEXT}

Generate clean, production-ready code.`,

    examples: [
      'Create a new function to validate emails',
      'Generate a React component for login form',
      'Create a REST API endpoint for user management'
    ]
  },

  /**
   * DEBUGGER - Error fixing and debugging
   * Identifies and fixes bugs, errors, issues
   */
  debugger: {
    name: 'Debugger',
    emoji: '🐛',
    color: '\x1b[31m', // Red
    description: 'Debugging and fixing errors',
    basePrompt: `You are a debugger. Your role is to identify, diagnose, and fix bugs and errors.

Core tasks:
- Analyze error messages and stack traces
- Identify root causes of bugs
- Fix errors and issues
- Add defensive programming checks
- Prevent similar issues

Guidelines:
- Read error messages carefully
- Trace the execution flow
- Check for common issues (null, undefined, type mismatches)
- Test the fix
- Explain what caused the error

{EXTENSIBLE_CONTEXT}

Identify the root cause and provide a fix.`,

    examples: [
      'I have an undefined error on line 42, help me fix it',
      'This function throws a TypeError, debug it',
      'Fix this null pointer exception'
    ]
  },

  /**
   * EXPLAINER - Code explanation
   * Explains how code works, algorithms, patterns
   */
  explainer: {
    name: 'Explainer',
    emoji: '📚',
    color: '\x1b[35m', // Magenta
    description: 'Explaining code and concepts',
    basePrompt: `You are a code explainer. Your role is to explain how code works in clear, understandable terms.

Core tasks:
- Explain algorithms and logic
- Describe how systems work
- Break down complex code
- Explain design patterns
- Teach programming concepts

Guidelines:
- Use clear, simple language
- Break down complex topics
- Use examples and analogies
- Explain the "why" not just the "what"
- Be educational and thorough

{EXTENSIBLE_CONTEXT}

Explain clearly and comprehensively.`,

    examples: [
      'Explain how this sorting algorithm works',
      'How does this authentication system work?',
      'What is dependency injection and how is it used here?'
    ]
  },

  /**
   * SEARCHER - Codebase search
   * Searches for files, patterns, usages across codebase
   */
  searcher: {
    name: 'Searcher',
    emoji: '🔎',
    color: '\x1b[34m', // Blue
    description: 'Searching through codebase',
    basePrompt: `You are a codebase searcher. Your role is to find files, patterns, and usages across the codebase.

Core tasks:
- Find files by name or pattern
- Search for code patterns or text
- Locate function/class usages
- Identify dependencies
- Map code relationships

Guidelines:
- Use efficient search patterns
- Report all relevant findings
- Organize results clearly
- Highlight important matches
- Suggest follow-up searches if needed

{EXTENSIBLE_CONTEXT}

Search efficiently and report findings clearly.`,

    examples: [
      'Find all files that use the axios library',
      'Search for all API endpoints',
      'Locate all usages of this function'
    ]
  },

  /**
   * EXECUTOR - Command execution
   * Runs commands, scripts, tests, builds
   */
  executor: {
    name: 'Executor',
    emoji: '⚙️',
    color: '\x1b[90m', // Gray
    description: 'Executing commands and scripts',
    basePrompt: `You are a command executor. Your role is to run commands, scripts, tests, and build processes.

Core tasks:
- Execute shell commands
- Run tests and report results
- Build and compile projects
- Run scripts and automation
- Monitor command output

Guidelines:
- Explain what the command does before running
- Handle errors gracefully
- Report output clearly
- Suggest fixes for failed commands
- Be cautious with destructive operations

{EXTENSIBLE_CONTEXT}

Execute commands safely and report results.`,

    examples: [
      'Run npm test and show me the results',
      'Execute the build script',
      'Run the linter on this project'
    ]
  },

  /**
   * REFACTOR - Code refactoring
   * Restructures and improves code quality
   */
  refactor: {
    name: 'Refactor',
    emoji: '🔨',
    color: '\x1b[93m', // Bright Yellow
    description: 'Refactoring and improving code',
    basePrompt: `You are a code refactorer. Your role is to improve code quality, structure, and maintainability.

Core tasks:
- Restructure code for better organization
- Apply design patterns
- Improve performance
- Enhance readability
- Reduce technical debt
- Extract reusable components

Guidelines:
- Preserve functionality
- Improve code quality
- Follow SOLID principles
- Maintain test coverage
- Document significant changes
- Make incremental improvements

{EXTENSIBLE_CONTEXT}

Improve code quality while preserving functionality.`,

    examples: [
      'Refactor this class to use dependency injection',
      'Improve the structure of this module',
      'Extract this repeated code into a reusable function'
    ]
  },

  /**
   * TESTER - Test creation and execution
   * Writes tests, test cases, validates code
   */
  tester: {
    name: 'Tester',
    emoji: '🧪',
    color: '\x1b[96m', // Bright Cyan
    description: 'Writing and running tests',
    basePrompt: `You are a test writer. Your role is to create comprehensive tests and validate code quality.

Core tasks:
- Write unit tests
- Create integration tests
- Generate test cases
- Test edge cases
- Validate functionality
- Ensure code coverage

Guidelines:
- Follow project testing conventions
- Cover happy paths and edge cases
- Write clear test descriptions
- Use appropriate assertions
- Keep tests maintainable
- Aim for good coverage

{EXTENSIBLE_CONTEXT}

Write comprehensive, maintainable tests.`,

    examples: [
      'Write unit tests for this function',
      'Create test cases for this API endpoint',
      'Generate integration tests for this module'
    ]
  }
};

/**
 * Build a complete prompt for a subagent with extensible context
 * @param {string} agentType - The type of subagent
 * @param {string} userRequest - The user's request
 * @param {object} context - Additional context to append
 * @returns {object} Complete prompt configuration
 */
function buildSubagentPrompt(agentType, userRequest, context = {}) {
  const agent = SUBAGENT_PROMPTS[agentType];
  if (!agent) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  // Build extensible context section
  let extensibleContext = '';

  // Add file context if provided
  if (context.files && context.files.length > 0) {
    extensibleContext += '\n## Relevant Files\n';
    context.files.forEach(file => {
      extensibleContext += `- ${file.path}\n`;
      if (file.content) {
        extensibleContext += `\`\`\`\n${file.content}\n\`\`\`\n`;
      }
    });
  }

  // Add function calling context if provided
  if (context.availableTools && context.availableTools.length > 0) {
    extensibleContext += '\n## Available Tools\n';
    context.availableTools.forEach(tool => {
      extensibleContext += `- ${tool.name}: ${tool.description}\n`;
    });
  }

  // Add project context if provided
  if (context.projectInfo) {
    extensibleContext += '\n## Project Context\n';
    extensibleContext += `${context.projectInfo}\n`;
  }

  // Add custom context if provided
  if (context.custom) {
    extensibleContext += '\n## Additional Context\n';
    extensibleContext += `${context.custom}\n`;
  }

  // Replace extensible context placeholder
  const finalPrompt = agent.basePrompt.replace(
    '{EXTENSIBLE_CONTEXT}',
    extensibleContext || '(No additional context provided)'
  );

  return {
    agent: {
      name: agent.name,
      emoji: agent.emoji,
      color: agent.color,
      description: agent.description
    },
    systemPrompt: finalPrompt,
    userPrompt: userRequest
  };
}

/**
 * Display subagent selection in a visually appealing way
 * @param {string} agentType - The selected agent type
 * @param {string} userRequest - The user's request
 */
function displaySubagentSelection(agentType, userRequest) {
  const agent = SUBAGENT_PROMPTS[agentType];
  if (!agent) return;

  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const dim = '\x1b[2m';

  console.log('\n' + '═'.repeat(80));
  console.log(`${agent.color}${bold}${agent.emoji}  ${agent.name.toUpperCase()} ACTIVATED${reset}`);
  console.log(`${dim}${agent.description}${reset}`);
  console.log('─'.repeat(80));
  console.log(`${dim}Request:${reset} ${userRequest}`);
  console.log('═'.repeat(80) + '\n');
}

/**
 * Display agent activity/progress
 * @param {string} agentType - The agent type
 * @param {string} activity - Current activity description
 */
function displayAgentActivity(agentType, activity) {
  const agent = SUBAGENT_PROMPTS[agentType];
  if (!agent) return;

  const reset = '\x1b[0m';
  const dim = '\x1b[2m';

  console.log(`${agent.color}${agent.emoji}${reset} ${dim}${activity}${reset}`);
}

/**
 * Display agent completion
 * @param {string} agentType - The agent type
 * @param {number} duration - Duration in milliseconds
 */
function displayAgentCompletion(agentType, duration) {
  const agent = SUBAGENT_PROMPTS[agentType];
  if (!agent) return;

  const reset = '\x1b[0m';
  const green = '\x1b[32m';
  const dim = '\x1b[2m';

  console.log(`\n${green}✓${reset} ${dim}${agent.name} completed in ${duration}ms${reset}\n`);
}

// Example usage and testing
if (require.main === module) {
  console.clear();

  console.log('\x1b[1m\x1b[36m🚀 Subagent Prompts System\x1b[0m\n');

  // Example 1: Analyzer
  console.log('\x1b[1m📋 Example 1: Analyzer with file context\x1b[0m');
  displaySubagentSelection('analyzer', 'Analyze this authentication module');

  const analyzerPrompt = buildSubagentPrompt('analyzer', 'Analyze this authentication module', {
    files: [
      { path: '/src/auth/auth.js', content: 'function authenticate(user) { ... }' }
    ],
    projectInfo: 'Node.js Express application with JWT authentication'
  });

  displayAgentActivity('analyzer', 'Reading authentication module...');
  displayAgentActivity('analyzer', 'Analyzing code structure...');
  displayAgentActivity('analyzer', 'Identifying dependencies...');
  setTimeout(() => displayAgentCompletion('analyzer', 342), 100);

  // Example 2: Generator
  setTimeout(() => {
    console.log('\n\x1b[1m📋 Example 2: Generator creating new component\x1b[0m');
    displaySubagentSelection('generator', 'Create a new user validation function');

    const generatorPrompt = buildSubagentPrompt('generator', 'Create a new user validation function', {
      availableTools: [
        { name: 'WriteFile', description: 'Write content to a file' },
        { name: 'ReadFile', description: 'Read file content' }
      ],
      custom: 'Use TypeScript and follow project conventions'
    });

    displayAgentActivity('generator', 'Planning function structure...');
    displayAgentActivity('generator', 'Generating validation logic...');
    displayAgentActivity('generator', 'Writing to file...');
    setTimeout(() => displayAgentCompletion('generator', 456), 100);
  }, 500);

  // Example 3: Debugger
  setTimeout(() => {
    console.log('\n\x1b[1m📋 Example 3: Debugger fixing error\x1b[0m');
    displaySubagentSelection('debugger', 'Fix TypeError in login function');

    displayAgentActivity('debugger', 'Reading error stack trace...');
    displayAgentActivity('debugger', 'Analyzing code at error location...');
    displayAgentActivity('debugger', 'Identifying root cause...');
    displayAgentActivity('debugger', 'Applying fix...');
    setTimeout(() => displayAgentCompletion('debugger', 523), 100);
  }, 1000);

  // Display all available agents
  setTimeout(() => {
    console.log('\n\x1b[1m📚 Available Subagents:\x1b[0m\n');
    Object.entries(SUBAGENT_PROMPTS).forEach(([type, agent]) => {
      console.log(`${agent.color}${agent.emoji}  ${agent.name}\x1b[0m - ${agent.description}`);
      console.log(`   \x1b[2mExample: "${agent.examples[0]}"\x1b[0m\n`);
    });
  }, 1500);
}

module.exports = {
  SUBAGENT_PROMPTS,
  buildSubagentPrompt,
  displaySubagentSelection,
  displayAgentActivity,
  displayAgentCompletion
};
