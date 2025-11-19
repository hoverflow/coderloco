/**
 * @license
 * Copyright 2025 loco
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { DeviceAuthorizationInfo } from './useLocoAuth.js';
import { useLocoAuth } from './useLocoAuth.js';
import {
  AuthType,
  locoOAuth2Events,
  locoOAuth2Event,
} from '@coderloco/coderloco-core';
import type { LoadedSettings } from '../../config/settings.js';

// Mock the locoOAuth2Events
vi.mock('@coderloco/coderloco-core', async () => {
  const actual = await vi.importActual('@coderloco/coderloco-core');
  const mockEmitter = {
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    emit: vi.fn().mockReturnThis(),
  };
  return {
    ...actual,
    locoOAuth2Events: mockEmitter,
    locoOAuth2Event: {
      AuthUri: 'authUri',
      AuthProgress: 'authProgress',
    },
  };
});

const mocklocoOAuth2Events = vi.mocked(locoOAuth2Events);

describe('useLocoAuth', () => {
  const mockDeviceAuth: DeviceAuthorizationInfo = {
    verification_uri: 'https://oauth.loco.com/device',
    verification_uri_complete: 'https://oauth.loco.com/device?user_code=ABC123',
    user_code: 'ABC123',
    expires_in: 1800,
  };

  const createMockSettings = (authType: AuthType): LoadedSettings =>
    ({
      merged: {
        security: {
          auth: {
            selectedType: authType,
          },
        },
      },
    }) as LoadedSettings;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state when not LOCO auth', () => {
    const settings = createMockSettings(AuthType.USE_GEMINI);
    const { result } = renderHook(() => useLocoAuth(settings, false));

    expect(result.current).toEqual({
      islocoAuthenticating: false,
      deviceAuth: null,
      authStatus: 'idle',
      authMessage: null,
      islocoAuth: false,
      cancellocoAuth: expect.any(Function),
    });
  });

  it('should initialize with default state when LOCO auth but not authenticating', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    const { result } = renderHook(() => useLocoAuth(settings, false));

    expect(result.current).toEqual({
      islocoAuthenticating: false,
      deviceAuth: null,
      authStatus: 'idle',
      authMessage: null,
      islocoAuth: true,
      cancellocoAuth: expect.any(Function),
    });
  });

  it('should set up event listeners when LOCO auth and authenticating', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    renderHook(() => useLocoAuth(settings, true));

    expect(mocklocoOAuth2Events.on).toHaveBeenCalledWith(
      locoOAuth2Event.AuthUri,
      expect.any(Function),
    );
    expect(mocklocoOAuth2Events.on).toHaveBeenCalledWith(
      locoOAuth2Event.AuthProgress,
      expect.any(Function),
    );
  });

  it('should handle device auth event', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    let handleDeviceAuth: (deviceAuth: DeviceAuthorizationInfo) => void;

    mocklocoOAuth2Events.on.mockImplementation((event, handler) => {
      if (event === locoOAuth2Event.AuthUri) {
        handleDeviceAuth = handler;
      }
      return mocklocoOAuth2Events;
    });

    const { result } = renderHook(() => useLocoAuth(settings, true));

    act(() => {
      handleDeviceAuth!(mockDeviceAuth);
    });

    expect(result.current.deviceAuth).toEqual(mockDeviceAuth);
    expect(result.current.authStatus).toBe('polling');
    expect(result.current.islocoAuthenticating).toBe(true);
  });

  it('should handle auth progress event - success', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    let handleAuthProgress: (
      status: 'success' | 'error' | 'polling' | 'timeout' | 'rate_limit',
      message?: string,
    ) => void;

    mocklocoOAuth2Events.on.mockImplementation((event, handler) => {
      if (event === locoOAuth2Event.AuthProgress) {
        handleAuthProgress = handler;
      }
      return mocklocoOAuth2Events;
    });

    const { result } = renderHook(() => useLocoAuth(settings, true));

    act(() => {
      handleAuthProgress!('success', 'Authentication successful!');
    });

    expect(result.current.authStatus).toBe('success');
    expect(result.current.authMessage).toBe('Authentication successful!');
  });

  it('should handle auth progress event - error', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    let handleAuthProgress: (
      status: 'success' | 'error' | 'polling' | 'timeout' | 'rate_limit',
      message?: string,
    ) => void;

    mocklocoOAuth2Events.on.mockImplementation((event, handler) => {
      if (event === locoOAuth2Event.AuthProgress) {
        handleAuthProgress = handler;
      }
      return mocklocoOAuth2Events;
    });

    const { result } = renderHook(() => useLocoAuth(settings, true));

    act(() => {
      handleAuthProgress!('error', 'Authentication failed');
    });

    expect(result.current.authStatus).toBe('error');
    expect(result.current.authMessage).toBe('Authentication failed');
  });

  it('should handle auth progress event - polling', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    let handleAuthProgress: (
      status: 'success' | 'error' | 'polling' | 'timeout' | 'rate_limit',
      message?: string,
    ) => void;

    mocklocoOAuth2Events.on.mockImplementation((event, handler) => {
      if (event === locoOAuth2Event.AuthProgress) {
        handleAuthProgress = handler;
      }
      return mocklocoOAuth2Events;
    });

    const { result } = renderHook(() => useLocoAuth(settings, true));

    act(() => {
      handleAuthProgress!('polling', 'Waiting for user authorization...');
    });

    expect(result.current.authStatus).toBe('polling');
    expect(result.current.authMessage).toBe(
      'Waiting for user authorization...',
    );
  });

  it('should handle auth progress event - rate_limit', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    let handleAuthProgress: (
      status: 'success' | 'error' | 'polling' | 'timeout' | 'rate_limit',
      message?: string,
    ) => void;

    mocklocoOAuth2Events.on.mockImplementation((event, handler) => {
      if (event === locoOAuth2Event.AuthProgress) {
        handleAuthProgress = handler;
      }
      return mocklocoOAuth2Events;
    });

    const { result } = renderHook(() => useLocoAuth(settings, true));

    act(() => {
      handleAuthProgress!(
        'rate_limit',
        'Too many requests. The server is rate limiting our requests. Please select a different authentication method or try again later.',
      );
    });

    expect(result.current.authStatus).toBe('rate_limit');
    expect(result.current.authMessage).toBe(
      'Too many requests. The server is rate limiting our requests. Please select a different authentication method or try again later.',
    );
  });

  it('should handle auth progress event without message', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    let handleAuthProgress: (
      status: 'success' | 'error' | 'polling' | 'timeout' | 'rate_limit',
      message?: string,
    ) => void;

    mocklocoOAuth2Events.on.mockImplementation((event, handler) => {
      if (event === locoOAuth2Event.AuthProgress) {
        handleAuthProgress = handler;
      }
      return mocklocoOAuth2Events;
    });

    const { result } = renderHook(() => useLocoAuth(settings, true));

    act(() => {
      handleAuthProgress!('success');
    });

    expect(result.current.authStatus).toBe('success');
    expect(result.current.authMessage).toBe(null);
  });

  it('should clean up event listeners when auth type changes', () => {
    const locoSettings = createMockSettings(AuthType.loco_OAUTH);
    const { rerender } = renderHook(
      ({ settings, isAuthenticating }) =>
        useLocoAuth(settings, isAuthenticating),
      { initialProps: { settings: locoSettings, isAuthenticating: true } },
    );

    // Change to non-LOCO auth
    const geminiSettings = createMockSettings(AuthType.USE_GEMINI);
    rerender({ settings: geminiSettings, isAuthenticating: true });

    expect(mocklocoOAuth2Events.off).toHaveBeenCalledWith(
      locoOAuth2Event.AuthUri,
      expect.any(Function),
    );
    expect(mocklocoOAuth2Events.off).toHaveBeenCalledWith(
      locoOAuth2Event.AuthProgress,
      expect.any(Function),
    );
  });

  it('should clean up event listeners when authentication stops', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    const { rerender } = renderHook(
      ({ isAuthenticating }) => useLocoAuth(settings, isAuthenticating),
      { initialProps: { isAuthenticating: true } },
    );

    // Stop authentication
    rerender({ isAuthenticating: false });

    expect(mocklocoOAuth2Events.off).toHaveBeenCalledWith(
      locoOAuth2Event.AuthUri,
      expect.any(Function),
    );
    expect(mocklocoOAuth2Events.off).toHaveBeenCalledWith(
      locoOAuth2Event.AuthProgress,
      expect.any(Function),
    );
  });

  it('should clean up event listeners on unmount', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    const { unmount } = renderHook(() => useLocoAuth(settings, true));

    unmount();

    expect(mocklocoOAuth2Events.off).toHaveBeenCalledWith(
      locoOAuth2Event.AuthUri,
      expect.any(Function),
    );
    expect(mocklocoOAuth2Events.off).toHaveBeenCalledWith(
      locoOAuth2Event.AuthProgress,
      expect.any(Function),
    );
  });

  it('should reset state when switching from LOCO auth to another auth type', () => {
    const locoSettings = createMockSettings(AuthType.loco_OAUTH);
    let handleDeviceAuth: (deviceAuth: DeviceAuthorizationInfo) => void;

    mocklocoOAuth2Events.on.mockImplementation((event, handler) => {
      if (event === locoOAuth2Event.AuthUri) {
        handleDeviceAuth = handler;
      }
      return mocklocoOAuth2Events;
    });

    const { result, rerender } = renderHook(
      ({ settings, isAuthenticating }) =>
        useLocoAuth(settings, isAuthenticating),
      { initialProps: { settings: locoSettings, isAuthenticating: true } },
    );

    // Simulate device auth
    act(() => {
      handleDeviceAuth!(mockDeviceAuth);
    });

    expect(result.current.deviceAuth).toEqual(mockDeviceAuth);
    expect(result.current.authStatus).toBe('polling');

    // Switch to different auth type
    const geminiSettings = createMockSettings(AuthType.USE_GEMINI);
    rerender({ settings: geminiSettings, isAuthenticating: true });

    expect(result.current.islocoAuthenticating).toBe(false);
    expect(result.current.deviceAuth).toBe(null);
    expect(result.current.authStatus).toBe('idle');
    expect(result.current.authMessage).toBe(null);
  });

  it('should reset state when authentication stops', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    let handleDeviceAuth: (deviceAuth: DeviceAuthorizationInfo) => void;

    mocklocoOAuth2Events.on.mockImplementation((event, handler) => {
      if (event === locoOAuth2Event.AuthUri) {
        handleDeviceAuth = handler;
      }
      return mocklocoOAuth2Events;
    });

    const { result, rerender } = renderHook(
      ({ isAuthenticating }) => useLocoAuth(settings, isAuthenticating),
      { initialProps: { isAuthenticating: true } },
    );

    // Simulate device auth
    act(() => {
      handleDeviceAuth!(mockDeviceAuth);
    });

    expect(result.current.deviceAuth).toEqual(mockDeviceAuth);
    expect(result.current.authStatus).toBe('polling');

    // Stop authentication
    rerender({ isAuthenticating: false });

    expect(result.current.islocoAuthenticating).toBe(false);
    expect(result.current.deviceAuth).toBe(null);
    expect(result.current.authStatus).toBe('idle');
    expect(result.current.authMessage).toBe(null);
  });

  it('should handle cancellocoAuth function', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    let handleDeviceAuth: (deviceAuth: DeviceAuthorizationInfo) => void;

    mocklocoOAuth2Events.on.mockImplementation((event, handler) => {
      if (event === locoOAuth2Event.AuthUri) {
        handleDeviceAuth = handler;
      }
      return mocklocoOAuth2Events;
    });

    const { result } = renderHook(() => useLocoAuth(settings, true));

    // Set up some state
    act(() => {
      handleDeviceAuth!(mockDeviceAuth);
    });

    expect(result.current.deviceAuth).toEqual(mockDeviceAuth);

    // Cancel auth
    act(() => {
      result.current.cancellocoAuth();
    });

    expect(result.current.islocoAuthenticating).toBe(false);
    expect(result.current.deviceAuth).toBe(null);
    expect(result.current.authStatus).toBe('idle');
    expect(result.current.authMessage).toBe(null);
  });

  it('should maintain islocoAuth flag correctly', () => {
    // Test with LOCO OAuth
    const locoSettings = createMockSettings(AuthType.loco_OAUTH);
    const { result: locoResult } = renderHook(() =>
      useLocoAuth(locoSettings, false),
    );
    expect(locoResult.current.islocoAuth).toBe(true);

    // Test with other auth types
    const geminiSettings = createMockSettings(AuthType.USE_GEMINI);
    const { result: geminiResult } = renderHook(() =>
      useLocoAuth(geminiSettings, false),
    );
    expect(geminiResult.current.islocoAuth).toBe(false);

    const oauthSettings = createMockSettings(AuthType.LOGIN_WITH_GOOGLE);
    const { result: oauthResult } = renderHook(() =>
      useLocoAuth(oauthSettings, false),
    );
    expect(oauthResult.current.islocoAuth).toBe(false);
  });

  it('should set islocoAuthenticating to true when starting authentication with LOCO auth', () => {
    const settings = createMockSettings(AuthType.loco_OAUTH);
    const { result } = renderHook(() => useLocoAuth(settings, true));

    expect(result.current.islocoAuthenticating).toBe(true);
    expect(result.current.authStatus).toBe('idle');
  });
});
