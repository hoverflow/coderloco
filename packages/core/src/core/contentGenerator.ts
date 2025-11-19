/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  GenerateContentParameters,
  GenerateContentResponse,
} from '@google/genai';
import { GoogleGenAI } from '@google/genai';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import { DEFAULT_loco_MODEL } from '../config/models.js';
import type { Config } from '../config/config.js';

import type { UserTierId } from '../code_assist/types.js';
import { InstallationManager } from '../utils/installationManager.js';
import { LoggingContentGenerator } from './loggingContentGenerator.js';

/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
  generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  userTier?: UserTierId;
}

export enum AuthType {
  LOGIN_WITH_GOOGLE = 'oauth-personal',
  USE_GEMINI = 'gemini-api-key',
  USE_VERTEX_AI = 'vertex-ai',
  CLOUD_SHELL = 'cloud-shell',
  USE_OPENAI = 'openai',
  loco_OAUTH = 'loco-oauth',
}

export type ContentGeneratorConfig = {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  vertexai?: boolean;
  authType?: AuthType | undefined;
  enableOpenAILogging?: boolean;
  openAILoggingDir?: string;
  // Timeout configuration in milliseconds
  timeout?: number;
  // Maximum retries for failed requests
  maxRetries?: number;
  // Disable cache control for DashScope providers
  disableCacheControl?: boolean;
  samplingParams?: {
    top_p?: number;
    top_k?: number;
    repetition_penalty?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    temperature?: number;
    max_tokens?: number;
  };
  proxy?: string | undefined;
  userAgent?: string;
};

export function createContentGeneratorConfig(
  config: Config,
  authType: AuthType | undefined,
  generationConfig?: Partial<ContentGeneratorConfig>,
): ContentGeneratorConfig {
  const newContentGeneratorConfig: Partial<ContentGeneratorConfig> = {
    ...(generationConfig || {}),
    authType,
    proxy: config?.getProxy(),
  };

  if (authType === AuthType.loco_OAUTH) {
    // For LOCO OAuth, we'll handle the API key dynamically in createContentGenerator
    // Set a special marker to indicate this is LOCO OAuth
    return {
      ...newContentGeneratorConfig,
      model: DEFAULT_loco_MODEL,
      apiKey: 'loco_OAUTH_DYNAMIC_TOKEN',
    } as ContentGeneratorConfig;
  }

  if (authType === AuthType.USE_OPENAI) {
    if (!newContentGeneratorConfig.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    return {
      ...newContentGeneratorConfig,
      model: newContentGeneratorConfig?.model || 'loco3-coder-plus',
    } as ContentGeneratorConfig;
  }

  return {
    ...newContentGeneratorConfig,
    model: newContentGeneratorConfig?.model || DEFAULT_loco_MODEL,
  } as ContentGeneratorConfig;
}

export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
  sessionId?: string,
): Promise<ContentGenerator> {
  const version = process.env['CLI_VERSION'] || process.version;
  const userAgent = `locoCode/${version} (${process.platform}; ${process.arch})`;
  const baseHeaders: Record<string, string> = {
    'User-Agent': userAgent,
  };

  if (
    config.authType === AuthType.LOGIN_WITH_GOOGLE ||
    config.authType === AuthType.CLOUD_SHELL
  ) {
    const httpOptions = { headers: baseHeaders };
    return new LoggingContentGenerator(
      await createCodeAssistContentGenerator(
        httpOptions,
        config.authType,
        gcConfig,
        sessionId,
      ),
      gcConfig,
    );
  }

  if (
    config.authType === AuthType.USE_GEMINI ||
    config.authType === AuthType.USE_VERTEX_AI
  ) {
    let headers: Record<string, string> = { ...baseHeaders };
    if (gcConfig?.getUsageStatisticsEnabled()) {
      const installationManager = new InstallationManager();
      const installationId = installationManager.getInstallationId();
      headers = {
        ...headers,
        'x-gemini-api-privileged-user-id': `${installationId}`,
      };
    }
    const httpOptions = { headers };

    const googleGenAI = new GoogleGenAI({
      apiKey: config.apiKey === '' ? undefined : config.apiKey,
      vertexai: config.vertexai,
      httpOptions,
    });
    return new LoggingContentGenerator(googleGenAI.models, gcConfig);
  }

  if (config.authType === AuthType.USE_OPENAI) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Import OpenAIContentGenerator dynamically to avoid circular dependencies
    const { createOpenAIContentGenerator } = await import(
      './openaiContentGenerator/index.js'
    );

    // Always use OpenAIContentGenerator, logging is controlled by enableOpenAILogging flag
    return createOpenAIContentGenerator(config, gcConfig);
  }

  if (config.authType === AuthType.loco_OAUTH) {
    // Import required classes dynamically
    const { getlocoOAuthClient: getlocoOauthClient } = await import(
      '../loco/locoOAuth2.js'
    );
    const { locoContentGenerator } = await import(
      '../loco/locoContentGenerator.js'
    );

    try {
      // Get the LOCO OAuth client (now includes integrated token management)
      const locoClient = await getlocoOauthClient(gcConfig);

      // Create the content generator with dynamic token management
      return new locoContentGenerator(locoClient, config, gcConfig);
    } catch (error) {
      throw new Error(
        `Failed to initialize loco: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  throw new Error(
    `Error creating contentGenerator: Unsupported authType: ${config.authType}`,
  );
}
