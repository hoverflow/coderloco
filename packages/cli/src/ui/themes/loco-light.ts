/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ColorsTheme, Theme } from './theme.js';
import { lightSemanticColors } from './semantic-tokens.js';

const locoLightColors: ColorsTheme = {
  type: 'light',
  Background: '#f8f9fa',
  Foreground: '#5c6166',
  LightBlue: '#55b4d4',
  AccentBlue: '#399ee6',
  AccentPurple: '#a37acc',
  AccentCyan: '#4cbf99',
  AccentGreen: '#86b300',
  AccentYellow: '#f2ae49',
  AccentRed: '#f07171',
  DiffAdded: '#86b300',
  DiffRemoved: '#f07171',
  Comment: '#ABADB1',
  Gray: '#CCCFD3',
  GradientColors: ['#399ee6', '#86b300'],
};

export const locoLight: Theme = new Theme(
  'LOCO Light',
  'light',
  {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      background: locoLightColors.Background,
      color: locoLightColors.Foreground,
    },
    'hljs-comment': {
      color: locoLightColors.Comment,
      fontStyle: 'italic',
    },
    'hljs-quote': {
      color: locoLightColors.AccentCyan,
      fontStyle: 'italic',
    },
    'hljs-string': {
      color: locoLightColors.AccentGreen,
    },
    'hljs-constant': {
      color: locoLightColors.AccentCyan,
    },
    'hljs-number': {
      color: locoLightColors.AccentPurple,
    },
    'hljs-keyword': {
      color: locoLightColors.AccentYellow,
    },
    'hljs-selector-tag': {
      color: locoLightColors.AccentYellow,
    },
    'hljs-attribute': {
      color: locoLightColors.AccentYellow,
    },
    'hljs-variable': {
      color: locoLightColors.Foreground,
    },
    'hljs-variable.language': {
      color: locoLightColors.LightBlue,
      fontStyle: 'italic',
    },
    'hljs-title': {
      color: locoLightColors.AccentBlue,
    },
    'hljs-section': {
      color: locoLightColors.AccentGreen,
      fontWeight: 'bold',
    },
    'hljs-type': {
      color: locoLightColors.LightBlue,
    },
    'hljs-class .hljs-title': {
      color: locoLightColors.AccentBlue,
    },
    'hljs-tag': {
      color: locoLightColors.LightBlue,
    },
    'hljs-name': {
      color: locoLightColors.AccentBlue,
    },
    'hljs-builtin-name': {
      color: locoLightColors.AccentYellow,
    },
    'hljs-meta': {
      color: locoLightColors.AccentYellow,
    },
    'hljs-symbol': {
      color: locoLightColors.AccentRed,
    },
    'hljs-bullet': {
      color: locoLightColors.AccentYellow,
    },
    'hljs-regexp': {
      color: locoLightColors.AccentCyan,
    },
    'hljs-link': {
      color: locoLightColors.LightBlue,
    },
    'hljs-deletion': {
      color: locoLightColors.AccentRed,
    },
    'hljs-addition': {
      color: locoLightColors.AccentGreen,
    },
    'hljs-emphasis': {
      fontStyle: 'italic',
    },
    'hljs-strong': {
      fontWeight: 'bold',
    },
    'hljs-literal': {
      color: locoLightColors.AccentCyan,
    },
    'hljs-built_in': {
      color: locoLightColors.AccentRed,
    },
    'hljs-doctag': {
      color: locoLightColors.AccentRed,
    },
    'hljs-template-variable': {
      color: locoLightColors.AccentCyan,
    },
    'hljs-selector-id': {
      color: locoLightColors.AccentRed,
    },
  },
  locoLightColors,
  lightSemanticColors,
);
