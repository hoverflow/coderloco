/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const SERVICE_NAME = 'loco-code';

export const EVENT_USER_PROMPT = 'loco-code.user_prompt';
export const EVENT_TOOL_CALL = 'loco-code.tool_call';
export const EVENT_API_REQUEST = 'loco-code.api_request';
export const EVENT_API_ERROR = 'loco-code.api_error';
export const EVENT_API_CANCEL = 'loco-code.api_cancel';
export const EVENT_API_RESPONSE = 'loco-code.api_response';
export const EVENT_CLI_CONFIG = 'loco-code.config';
export const EVENT_EXTENSION_DISABLE = 'loco-code.extension_disable';
export const EVENT_EXTENSION_ENABLE = 'loco-code.extension_enable';
export const EVENT_EXTENSION_INSTALL = 'loco-code.extension_install';
export const EVENT_EXTENSION_UNINSTALL = 'loco-code.extension_uninstall';
export const EVENT_FLASH_FALLBACK = 'loco-code.flash_fallback';
export const EVENT_RIPGREP_FALLBACK = 'loco-code.ripgrep_fallback';
export const EVENT_NEXT_SPEAKER_CHECK = 'loco-code.next_speaker_check';
export const EVENT_SLASH_COMMAND = 'loco-code.slash_command';
export const EVENT_IDE_CONNECTION = 'loco-code.ide_connection';
export const EVENT_CHAT_COMPRESSION = 'loco-code.chat_compression';
export const EVENT_INVALID_CHUNK = 'loco-code.chat.invalid_chunk';
export const EVENT_CONTENT_RETRY = 'loco-code.chat.content_retry';
export const EVENT_CONTENT_RETRY_FAILURE =
  'loco-code.chat.content_retry_failure';
export const EVENT_CONVERSATION_FINISHED = 'loco-code.conversation_finished';
export const EVENT_MALFORMED_JSON_RESPONSE =
  'loco-code.malformed_json_response';
export const EVENT_FILE_OPERATION = 'loco-code.file_operation';
export const EVENT_MODEL_SLASH_COMMAND = 'loco-code.slash_command.model';
export const EVENT_SUBAGENT_EXECUTION = 'loco-code.subagent_execution';

// Performance Events
export const EVENT_STARTUP_PERFORMANCE = 'loco-code.startup.performance';
export const EVENT_MEMORY_USAGE = 'loco-code.memory.usage';
export const EVENT_PERFORMANCE_BASELINE = 'loco-code.performance.baseline';
export const EVENT_PERFORMANCE_REGRESSION = 'loco-code.performance.regression';
