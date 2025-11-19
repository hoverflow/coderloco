/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ColorsTheme, Theme } from './theme.js';
import { darkSemanticColors } from './semantic-tokens.js';

const locoDarkColors: ColorsTheme = {
  type: 'dark',
  Background: '#0b0e14',
  Foreground: '#bfbdb6',
  LightBlue: '#59C2FF',
  AccentBlue: '#39BAE6',
  AccentPurple: '#D2A6FF',
  AccentCyan: '#95E6CB',
  AccentGreen: '#AAD94C',
  AccentYellow: '#FFD700',
  AccentRed: '#F26D78',
  DiffAdded: '#AAD94C',
  DiffRemoved: '#F26D78',
  Comment: '#646A71',
  Gray: '#3D4149',
  GradientColors: ['#FFD700', '#da7959'],
};

export const locoDark: Theme = new Theme(
  'LOCO Dark',
  'dark',
  {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      background: locoDarkColors.Background,
      color: locoDarkColors.Foreground,
    },
    'hljs-keyword': {
      color: locoDarkColors.AccentYellow,
    },
    'hljs-literal': {
      color: locoDarkColors.AccentPurple,
    },
    'hljs-symbol': {
      color: locoDarkColors.AccentCyan,
    },
    'hljs-name': {
      color: locoDarkColors.LightBlue,
    },
    'hljs-link': {
      color: locoDarkColors.AccentBlue,
    },
    'hljs-function .hljs-keyword': {
      color: locoDarkColors.AccentYellow,
    },
    'hljs-subst': {
      color: locoDarkColors.Foreground,
    },
    'hljs-string': {
      color: locoDarkColors.AccentGreen,
    },
    'hljs-title': {
      color: locoDarkColors.AccentYellow,
    },
    'hljs-type': {
      color: locoDarkColors.AccentBlue,
    },
    'hljs-attribute': {
      color: locoDarkColors.AccentYellow,
    },
    'hljs-bullet': {
      color: locoDarkColors.AccentYellow,
    },
    'hljs-addition': {
      color: locoDarkColors.AccentGreen,
    },
    'hljs-variable': {
      color: locoDarkColors.Foreground,
    },
    'hljs-template-tag': {
      color: locoDarkColors.AccentYellow,
    },
    'hljs-template-variable': {
      color: locoDarkColors.AccentYellow,
    },
    'hljs-comment': {
      color: locoDarkColors.Comment,
      fontStyle: 'italic',
    },
    'hljs-quote': {
      color: locoDarkColors.AccentCyan,
      fontStyle: 'italic',
    },
    'hljs-deletion': {
      color: locoDarkColors.AccentRed,
    },
    'hljs-meta': {
      color: locoDarkColors.AccentYellow,
    },
    'hljs-doctag': {
      fontWeight: 'bold',
    },
    'hljs-strong': {
      fontWeight: 'bold',
    },
    'hljs-emphasis': {
      fontStyle: 'italic',
    },
  },
  locoDarkColors,
  darkSemanticColors,
);
