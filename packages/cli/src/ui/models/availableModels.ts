/**
 * @license
 * Copyright 2025 loco
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType, DEFAULT_loco_MODEL } from '@coderloco/coderloco-core';

export type AvailableModel = {
  id: string;
  label: string;
  description?: string;
};

export const MAINLINE_CODER = DEFAULT_loco_MODEL;

export const AVAILABLE_MODELS_loco: AvailableModel[] = [
  {
    id: MAINLINE_CODER,
    label: MAINLINE_CODER,
    description:
      'The latest LOCO Coder model from Alibaba Cloud ModelStudio (version: loco3-coder-plus-2025-09-23)',
  },
];

/**
 * Get available LOCO models (text-only)
 */
export function getFilteredlocoModels(): AvailableModel[] {
  return AVAILABLE_MODELS_loco;
}

/**
 * Currently we use the single model of `OPENAI_MODEL` in the env.
 * In the future, after settings.json is updated, we will allow users to configure this themselves.
 */
export function getOpenAIAvailableModelFromEnv(): AvailableModel | null {
  const id = process.env['OPENAI_MODEL']?.trim();
  return id ? { id, label: id } : null;
}

export function getAvailableModelsForAuthType(
  authType: AuthType,
): AvailableModel[] {
  switch (authType) {
    case AuthType.loco_OAUTH:
      return AVAILABLE_MODELS_loco;
    case AuthType.USE_OPENAI: {
      const openAIModel = getOpenAIAvailableModelFromEnv();
      return openAIModel ? [openAIModel] : [];
    }
    default:
      // For other auth types, return empty array for now
      // This can be expanded later according to the design doc
      return [];
  }
}
