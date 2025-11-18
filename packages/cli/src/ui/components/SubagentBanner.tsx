/**
 * SubagentBanner - Visual display of active subagent
 *
 * Shows which specialized agent is handling the user's request
 * with fun, colorful, interactive animations
 */

import type React from 'react';
import { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

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

interface SubagentInfo {
  name: string;
  emoji: string;
  color: string;
  description: string;
  tagline: string;
}

const SUBAGENT_INFO: Record<SubagentType, SubagentInfo> = {
  analyzer: {
    name: 'ANALYZER',
    emoji: '🔍',
    color: 'cyan',
    description: 'Reading and analyzing code',
    tagline: 'Time to investigate!',
  },
  modifier: {
    name: 'MODIFIER',
    emoji: '✏️',
    color: 'yellow',
    description: 'Modifying existing code',
    tagline: 'Making some tweaks!',
  },
  generator: {
    name: 'GENERATOR',
    emoji: '⚡',
    color: 'green',
    description: 'Creating new code',
    tagline: "Let's build something!",
  },
  debugger: {
    name: 'DEBUGGER',
    emoji: '🐛',
    color: 'red',
    description: 'Hunting down bugs',
    tagline: 'Squashing bugs!',
  },
  explainer: {
    name: 'EXPLAINER',
    emoji: '📚',
    color: 'magenta',
    description: 'Breaking down concepts',
    tagline: 'Storytime!',
  },
  searcher: {
    name: 'SEARCHER',
    emoji: '🔎',
    color: 'blue',
    description: 'Searching codebase',
    tagline: 'Detective mode!',
  },
  executor: {
    name: 'EXECUTOR',
    emoji: '⚙️',
    color: 'gray',
    description: 'Running commands',
    tagline: "Let's execute!",
  },
  refactor: {
    name: 'REFACTOR',
    emoji: '🔨',
    color: 'yellowBright',
    description: 'Improving code quality',
    tagline: 'Polishing code!',
  },
  tester: {
    name: 'TESTER',
    emoji: '🧪',
    color: 'cyanBright',
    description: 'Writing and running tests',
    tagline: 'Testing time!',
  },
};

interface SubagentBannerProps {
  agentType: SubagentType;
  confidence: number;
  userRequest: string;
  status?: 'classifying' | 'activating' | 'working' | 'completed';
  elapsedTime?: number;
}

export const SubagentBanner: React.FC<SubagentBannerProps> = ({
  agentType,
  confidence,
  status = 'working',
  elapsedTime = 0,
  userRequest: _userRequest,
}) => {
  const agent = SUBAGENT_INFO[agentType];
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (status === 'working') {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [status]);

  if (status === 'classifying') {
    return (
      <Box flexDirection="column" marginY={1}>
        <Box>
          <Text color="white">
            <Spinner type="dots" /> Classifying intent...
          </Text>
          {elapsedTime > 0 && (
            <Text color="gray"> (esc to cancel, {elapsedTime}s)</Text>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginY={1}>
      {/* Compact header with emoji, name, and status */}
      <Box>
        <Text color={agent.color} bold>
          {agent.emoji} {agent.name} ACTIVATED
        </Text>
        <Text color="white" dimColor>
          {' '}
          •
        </Text>
        <Text color={agent.color}> {agent.tagline}</Text>
        <Text color="white" dimColor>
          {' '}
          •
        </Text>
        <Text color="gray"> {(confidence * 100).toFixed(0)}% confidence</Text>
      </Box>

      {/* Status indicator with spinner and timer */}
      {status === 'working' && (
        <Box>
          <Text color={agent.color}>{agent.emoji}</Text>
          <Text color="white">
            {' '}
            <Spinner type="dots" />
          </Text>
          <Text color="white">
            {' '}
            {agent.description}
            {dots}
          </Text>
          {elapsedTime > 0 && (
            <Text color="gray"> (esc to cancel, {elapsedTime}s)</Text>
          )}
        </Box>
      )}

      {status === 'completed' && (
        <Box>
          <Text color="green">✓</Text>
          <Text color="white"> {agent.name} completed</Text>
        </Box>
      )}
    </Box>
  );
};

interface SubagentActivityProps {
  agentType: SubagentType;
  activity: string;
}

export const SubagentActivity: React.FC<SubagentActivityProps> = ({
  agentType,
  activity,
}) => {
  const agent = SUBAGENT_INFO[agentType];

  return (
    <Box>
      <Text color={agent.color}>{agent.emoji}</Text>
      <Text color="gray" dimColor>
        {' '}
        {activity}
      </Text>
    </Box>
  );
};

interface SubagentCompletionProps {
  agentType: SubagentType;
  duration: number;
  tokensUsed?: {
    classification: number;
    execution: number;
  };
}

export const SubagentCompletion: React.FC<SubagentCompletionProps> = ({
  agentType,
  duration,
  tokensUsed,
}) => {
  const agent = SUBAGENT_INFO[agentType];

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color="green">✓</Text>
        <Text color="gray" dimColor>
          {' '}
          {agent.name} completed in {duration}ms
        </Text>
      </Box>

      {tokensUsed && (
        <Box flexDirection="column" marginLeft={2}>
          <Text color="gray" dimColor>
            💡 Token Efficiency:
          </Text>
          <Box marginLeft={2}>
            <Text color="gray" dimColor>
              Classification: ~{tokensUsed.classification} tokens
            </Text>
          </Box>
          <Box marginLeft={2}>
            <Text color="gray" dimColor>
              Execution: ~{tokensUsed.execution} tokens (estimated)
            </Text>
          </Box>
          <Box marginLeft={2}>
            <Text color="green">Total savings: ~75% vs full prompt</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};
