/**
 * @license
 * Copyright 2025 loco
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import type { LoadedSettings } from '../../config/settings.js';
import {
  AuthType,
  locoOAuth2Events,
  locoOAuth2Event,
} from '@coderloco/coderloco-core';

export interface DeviceAuthorizationInfo {
  verification_uri: string;
  verification_uri_complete: string;
  user_code: string;
  expires_in: number;
}

interface locoAuthState {
  islocoAuthenticating: boolean;
  deviceAuth: DeviceAuthorizationInfo | null;
  authStatus:
    | 'idle'
    | 'polling'
    | 'success'
    | 'error'
    | 'timeout'
    | 'rate_limit';
  authMessage: string | null;
}

export const useLocoAuth = (
  settings: LoadedSettings,
  isAuthenticating: boolean,
) => {
  const [locoAuthState, setlocoAuthState] = useState<locoAuthState>({
    islocoAuthenticating: false,
    deviceAuth: null,
    authStatus: 'idle',
    authMessage: null,
  });

  const islocoAuth =
    settings.merged.security?.auth?.selectedType === AuthType.loco_OAUTH;

  // Set up event listeners when authentication starts
  useEffect(() => {
    if (!islocoAuth || !isAuthenticating) {
      // Reset state when not authenticating or not LOCO auth
      setlocoAuthState({
        islocoAuthenticating: false,
        deviceAuth: null,
        authStatus: 'idle',
        authMessage: null,
      });
      return;
    }

    setlocoAuthState((prev) => ({
      ...prev,
      islocoAuthenticating: true,
      authStatus: 'idle',
    }));

    // Set up event listeners
    const handleDeviceAuth = (deviceAuth: DeviceAuthorizationInfo) => {
      setlocoAuthState((prev) => ({
        ...prev,
        deviceAuth: {
          verification_uri: deviceAuth.verification_uri,
          verification_uri_complete: deviceAuth.verification_uri_complete,
          user_code: deviceAuth.user_code,
          expires_in: deviceAuth.expires_in,
        },
        authStatus: 'polling',
      }));
    };

    const handleAuthProgress = (
      status: 'success' | 'error' | 'polling' | 'timeout' | 'rate_limit',
      message?: string,
    ) => {
      setlocoAuthState((prev) => ({
        ...prev,
        authStatus: status,
        authMessage: message || null,
      }));
    };

    // Add event listeners
    locoOAuth2Events.on(locoOAuth2Event.AuthUri, handleDeviceAuth);
    locoOAuth2Events.on(locoOAuth2Event.AuthProgress, handleAuthProgress);

    // Cleanup event listeners when component unmounts or auth finishes
    return () => {
      locoOAuth2Events.off(locoOAuth2Event.AuthUri, handleDeviceAuth);
      locoOAuth2Events.off(locoOAuth2Event.AuthProgress, handleAuthProgress);
    };
  }, [islocoAuth, isAuthenticating]);

  const cancellocoAuth = useCallback(() => {
    // Emit cancel event to stop polling
    locoOAuth2Events.emit(locoOAuth2Event.AuthCancel);

    setlocoAuthState({
      islocoAuthenticating: false,
      deviceAuth: null,
      authStatus: 'idle',
      authMessage: null,
    });
  }, []);

  return {
    ...locoAuthState,
    islocoAuth,
    cancellocoAuth,
  };
};
