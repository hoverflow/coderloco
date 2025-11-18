# CoderLoco

<div align="center">

![CoderLoco Screenshot](./docs/assets/qwen-screenshot.png)

[![npm version](https://img.shields.io/npm/v/@coderloco/coderloco.svg)](https://www.npmjs.com/package/@coderloco/coderloco)
[![License](https://img.shields.io/github/license/coderloco/coderloco.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/@coderloco/coderloco.svg)](https://www.npmjs.com/package/@coderloco/coderloco)

**A wild, no-frills text-only coding CLI agent that squeezes every bit from your local GPU for truly broke developers**

[Installation](#installation) • [Quick Start](#quick-start) • [Features](#key-features) • [Documentation](./docs/) • [Contributing](./CONTRIBUTING.md)

</div>

CoderLoco is a wild, no-frills text-only coding CLI agent adapted from [**Gemini CLI**](https://github.com/google-gemini/gemini-cli) ([details](./README.gemini.md)), specifically designed to squeeze every bit from your local GPU for truly broke developers. It enhances your development workflow with advanced text-based code understanding, automated tasks, and intelligent assistance without breaking the bank.

## 💡 Get Started on the Cheap

CoderLoco is designed for broke developers who want maximum power without the price tag. Run it locally on your GPU or use these free options:

### 🔥 Local GPU Mode (Recommended)

- **Zero API costs** - run models locally on your GPU
- **Unlimited requests** - no rate limits when running locally
- **Complete privacy** - your code never leaves your machine
- Simply run `loco` with your local model configuration

### 🌏 Free Cloud Options (When GPU isn't available)

- **Mainland China**: ModelScope offers **2,000 free API calls per day**
- **International**: OpenRouter provides **up to 1,000 free API calls per day** worldwide

For detailed setup instructions, see [Authorization](#authorization).

> [!WARNING]
> **Resource Usage Notice**: CoderLoco may issue multiple API calls per cycle, resulting in higher token usage when using cloud APIs. When running locally on GPU, you're only limited by your hardware!

## Key Features

- **Code Understanding & Editing** - Query and edit large codebases beyond traditional context window limits
- **Workflow Automation** - Automate operational tasks like handling pull requests and complex rebases
- **Local GPU Optimization** - Squeezes every bit of performance from your local GPU hardware
- **Budget-Friendly** - Designed specifically for developers who need power without the price tag
- **Text-First Approach** - Focused on powerful text-based code analysis and generation (vision support may come in future)

## Installation

### Prerequisites

Ensure you have [Node.js version 20](https://nodejs.org/en/download) or higher installed.

```bash
curl -qL https://www.npmjs.com/install.sh | sh
```

### Install from npm

```bash
npm install -g @coderloco/coderloco@latest
loco --version
```

### Install from source

```bash
git clone https://github.com/hoverflow/coderloco.git
cd coderloco
npm install
npm install -g .
```

### Install globally with Homebrew (macOS/Linux)

```bash
brew install coderloco
```

## Quick Start

```bash
# Start CoderLoco
loco

# Example commands
> Explain this codebase structure
> Help me refactor this function
> Generate unit tests for this module
```

### Session Management

Control your token usage with configurable session limits to optimize costs and performance.

#### Configure Session Token Limit

Create or edit `.loco/settings.json` in your home directory:

```json
{
  "sessionTokenLimit": 32000
}
```

#### Session Commands

- **`/compress`** - Compress conversation history to continue within token limits
- **`/clear`** - Clear all conversation history and start fresh
- **`/stats`** - Check current token usage and limits

> 📝 **Note**: Session token limit applies to a single conversation, not cumulative API calls.

### Authorization

Choose your preferred authentication method based on your needs:

#### 1. Local GPU Mode (🚀 Recommended - Maximum Power, Zero Cost)

The best way to experience CoderLoco - run models locally on your GPU:

```bash
# Configure your local model and start coding
loco --local-model path/to/your/model
```

**What happens:**

1. **Local Setup**: Configure your preferred local model (Llama, Qwen, etc.)
2. **GPU Acceleration**: Leverage your GPU for maximum performance
3. **Complete Privacy**: Your code never leaves your machine
4. **Unlimited Usage**: No rate limits or token counting when running locally!

**Benefits:**

- ✅ **Zero API costs** - run entirely on your hardware
- ✅ **Unlimited requests** - no daily limits
- ✅ **Complete privacy** - code stays local
- ✅ **Maximum performance** - optimized for GPU execution

#### 2. OpenAI-Compatible API

Use API keys for OpenAI or other compatible providers:

**Configuration Methods:**

1. **Environment Variables**

   ```bash
   export OPENAI_API_KEY="your_api_key_here"
   export OPENAI_BASE_URL="your_api_endpoint"
   export OPENAI_MODEL="your_model_choice"
   ```

2. **Project `.env` File**
   Create a `.env` file in your project root:
   ```env
   OPENAI_API_KEY=your_api_key_here
   OPENAI_BASE_URL=your_api_endpoint
   OPENAI_MODEL=your_model_choice
   ```

**API Provider Options**

> ⚠️ **Regional Notice:**
>
> - **Mainland China**: Use Alibaba Cloud Bailian or ModelScope
> - **International**: Use Alibaba Cloud ModelStudio or OpenRouter

<details>
<summary><b>🇨🇳 For Users in Mainland China</b></summary>

**Option 1: Alibaba Cloud Bailian** ([Apply for API Key](https://bailian.console.aliyun.com/))

```bash
export OPENAI_API_KEY="your_api_key_here"
export OPENAI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
export OPENAI_MODEL="qwen3-coder-plus"
```

**Option 2: ModelScope (Free Tier)** ([Apply for API Key](https://modelscope.cn/docs/model-service/API-Inference/intro))

- ✅ **2,000 free API calls per day**
- ⚠️ Connect your Aliyun account to avoid authentication errors

```bash
export OPENAI_API_KEY="your_api_key_here"
export OPENAI_BASE_URL="https://api-inference.modelscope.cn/v1"
export OPENAI_MODEL="Qwen/Qwen3-Coder-480B-A35B-Instruct"
```

</details>

<details>
<summary><b>🌍 For International Users</b></summary>

**Option 1: Alibaba Cloud ModelStudio** ([Apply for API Key](https://modelstudio.console.alibabacloud.com/))

```bash
export OPENAI_API_KEY="your_api_key_here"
export OPENAI_BASE_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
export OPENAI_MODEL="qwen3-coder-plus"
```

**Option 2: OpenRouter (Free Tier Available)** ([Apply for API Key](https://openrouter.ai/))

```bash
export OPENAI_API_KEY="your_api_key_here"
export OPENAI_BASE_URL="https://openrouter.ai/api/v1"
export OPENAI_MODEL="qwen/qwen3-coder:free"
```

</details>

## Usage Examples

### 🔍 Explore Codebases

```bash
cd your-project/
loco

# Architecture analysis
> Describe the main pieces of this system's architecture
> What are the key dependencies and how do they interact?
> Find all API endpoints and their authentication methods
```

### 💻 Code Development

```bash
# Refactoring
> Refactor this function to improve readability and performance
> Convert this class to use dependency injection
> Split this large module into smaller, focused components

# Code generation
> Create a REST API endpoint for user management
> Generate unit tests for the authentication module
> Add error handling to all database operations
```

### 🔄 Automate Workflows

```bash
# Git automation
> Analyze git commits from the last 7 days, grouped by feature
> Create a changelog from recent commits
> Find all TODO comments and create GitHub issues

# File operations
> Convert all images in this directory to PNG format
> Rename all test files to follow the *.test.ts pattern
> Find and remove all console.log statements
```

### 🐛 Debugging & Analysis

```bash
# Performance analysis
> Identify performance bottlenecks in this React component
> Find all N+1 query problems in the codebase

# Security audit
> Check for potential SQL injection vulnerabilities
> Find all hardcoded credentials or API keys
```

## Popular Tasks

### 📚 Understand New Codebases

```text
> What are the core business logic components?
> What security mechanisms are in place?
> How does the data flow through the system?
> What are the main design patterns used?
> Generate a dependency graph for this module
```

### 🔨 Code Refactoring & Optimization

```text
> What parts of this module can be optimized?
> Help me refactor this class to follow SOLID principles
> Add proper error handling and logging
> Convert callbacks to async/await pattern
> Implement caching for expensive operations
```

### 📝 Documentation & Testing

```text
> Generate comprehensive JSDoc comments for all public APIs
> Write unit tests with edge cases for this component
> Create API documentation in OpenAPI format
> Add inline comments explaining complex algorithms
> Generate a README for this module
```

### 🚀 Development Acceleration

```text
> Set up a new Express server with authentication
> Create a React component with TypeScript and tests
> Implement a rate limiter middleware
> Add database migrations for new schema
> Configure CI/CD pipeline for this project
```

## Commands & Shortcuts

### Session Commands

- `/help` - Display available commands
- `/clear` - Clear conversation history
- `/compress` - Compress history to save tokens
- `/stats` - Show current session information
- `/exit` or `/quit` - Exit CoderLoco

### Keyboard Shortcuts

- `Ctrl+C` - Cancel current operation
- `Ctrl+D` - Exit (on empty line)
- `Up/Down` - Navigate command history

## Benchmark Results

### Terminal-Bench Performance

| Agent     | Model              | Accuracy |
| --------- | ------------------ | -------- |
| CoderLoco | Qwen3-Coder-480A35 | 37.5%    |
| CoderLoco | Qwen3-Coder-30BA3B | 31.3%    |

## Development & Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) to learn how to contribute to the project.

For detailed authentication setup, see the [authentication guide](./docs/cli/authentication.md).

## Troubleshooting

If you encounter issues, check the [troubleshooting guide](docs/troubleshooting.md).

## Acknowledgments

This project is based on [Google Gemini CLI](https://github.com/google-gemini/gemini-cli) and originally forked from [Qwen Code](https://github.com/QwenLM/qwen-code). We acknowledge and appreciate the excellent work of both teams. Our main contribution focuses on making AI-powered development accessible to broke developers with local GPU optimization.

## License

[LICENSE](./LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=hoverflow/coderloco&type=Date)](https://www.star-history.com/#hoverflow/coderloco&Date)
