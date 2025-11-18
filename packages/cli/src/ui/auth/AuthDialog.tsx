/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useState } from 'react';
import { AuthType } from '@coderloco/coderloco-core';
import { Box, Text } from 'ink';
import { validateAuthMethod } from '../../config/auth.js';
import { type LoadedSettings, SettingScope } from '../../config/settings.js';
import { Colors } from '../colors.js';
import { useKeypress } from '../hooks/useKeypress.js';
import { OpenAIKeyPrompt } from '../components/OpenAIKeyPrompt.js';
import { RadioButtonSelect } from '../components/shared/RadioButtonSelect.js';

interface AuthDialogProps {
  onSelect: (
    authMethod: AuthType | undefined,
    scope: SettingScope,
    credentials?: {
      apiKey?: string;
      baseUrl?: string;
      model?: string;
    },
  ) => void;
  settings: LoadedSettings;
  initialErrorMessage?: string | null;
}

export function AuthDialog({
  onSelect,
  settings,
  initialErrorMessage,
}: AuthDialogProps): React.JSX.Element {
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialErrorMessage || null,
  );

  // Check if OpenAI env vars are already set
  const hasOpenAIConfig = Boolean(
    process.env['OPENAI_API_KEY'] ||
      process.env['OPENAI_BASE_URL'] ||
      process.env['OPENAI_MODEL'] ||
      settings.merged.security?.auth?.apiKey ||
      settings.merged.security?.auth?.baseUrl ||
      settings.merged.model?.name,
  );

  const [showOpenAIKeyPrompt, setShowOpenAIKeyPrompt] =
    useState(!hasOpenAIConfig);
  const items = [
    { key: AuthType.USE_OPENAI, label: 'OpenAI', value: AuthType.USE_OPENAI },
  ];

  const initialAuthIndex = 0;

  const handleAuthSelect = (authMethod: AuthType) => {
    if (authMethod === AuthType.USE_OPENAI) {
      setShowOpenAIKeyPrompt(true);
      setErrorMessage(null);
    } else {
      const error = validateAuthMethod(authMethod);
      if (error) {
        setErrorMessage(error);
      } else {
        setErrorMessage(null);
        onSelect(authMethod, SettingScope.User);
      }
    }
  };

  const handleOpenAIKeySubmit = (
    apiKey: string,
    baseUrl: string,
    model: string,
  ) => {
    setShowOpenAIKeyPrompt(false);
    onSelect(AuthType.USE_OPENAI, SettingScope.User, {
      apiKey,
      baseUrl,
      model,
    });
  };

  const handleOpenAIKeyCancel = () => {
    setShowOpenAIKeyPrompt(false);
    setErrorMessage('OpenAI API key is required to use OpenAI authentication.');
  };

  useKeypress(
    (key) => {
      if (showOpenAIKeyPrompt) {
        return;
      }

      if (key.name === 'escape') {
        // Prevent exit if there is an error message.
        // This means they user is not authenticated yet.
        if (errorMessage) {
          return;
        }
        if (settings.merged.security?.auth?.selectedType === undefined) {
          // Prevent exiting if no auth method is set
          setErrorMessage(
            'You must select an auth method to proceed. Press Ctrl+C again to exit.',
          );
          return;
        }
        onSelect(undefined, SettingScope.User);
      }
    },
    { isActive: true },
  );
  const getDefaultOpenAIConfig = () => {
    const fromSettings = settings.merged.security?.auth;
    const modelSettings = settings.merged.model;
    return {
      apiKey: fromSettings?.apiKey || process.env['OPENAI_API_KEY'] || '',
      baseUrl: fromSettings?.baseUrl || process.env['OPENAI_BASE_URL'] || '',
      model: modelSettings?.name || process.env['OPENAI_MODEL'] || '',
    };
  };

  if (showOpenAIKeyPrompt) {
    const defaults = getDefaultOpenAIConfig();
    return (
      <OpenAIKeyPrompt
        defaultApiKey={defaults.apiKey}
        defaultBaseUrl={defaults.baseUrl}
        defaultModel={defaults.model}
        onSubmit={handleOpenAIKeySubmit}
        onCancel={handleOpenAIKeyCancel}
      />
    );
  }

  return (
    <Box
      borderStyle="round"
      borderColor={Colors.Gray}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      <Text bold>Get started</Text>
      <Box marginTop={1}>
        <Text>Configure your OpenAI-compatible API</Text>
      </Box>
      <Box marginTop={1}>
        <RadioButtonSelect
          items={items}
          initialIndex={initialAuthIndex}
          onSelect={handleAuthSelect}
        />
      </Box>
      {errorMessage && (
        <Box marginTop={1}>
          <Text color={Colors.AccentRed}>{errorMessage}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text color={Colors.AccentPurple}>(Use Enter to Configure)</Text>
      </Box>
    </Box>
  );
}
