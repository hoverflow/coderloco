/**
 * File Suggester - Intelligent file suggestion based on user query
 *
 * Extracts potential file names and code entities from user queries
 * and searches the codebase to suggest relevant files before executing
 * the subagent, reducing unnecessary tool calls.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export interface SuggestedFile {
  path: string;
  reason: 'filename' | 'content';
  matchedTerm: string;
  confidence: number;
}

export interface FileSuggestionResult {
  suggestedFiles: SuggestedFile[];
  extractedTerms: {
    fileNames: string[];
    codeEntities: string[];
  };
}

/**
 * Extract potential file names from user query
 * Looks for common file extensions and file name patterns
 */
function extractFileNames(query: string): string[] {
  const fileNames: string[] = [];

  // Common file extensions to look for
  const extensions = [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'md',
    'txt',
    'css',
    'scss',
    'html',
    'yml',
    'yaml',
    'env',
    'sh',
    'py',
    'go',
    'rs',
    'java',
    'c',
    'cpp',
  ];

  // Pattern 1: Direct file mentions with extensions (e.g., "readme.md", "package.json")
  const extPattern = new RegExp(
    `\\b([a-zA-Z0-9_-]+\\.(${extensions.join('|')}))\\b`,
    'gi',
  );
  const matches = query.match(extPattern);
  if (matches) {
    fileNames.push(...matches.map((m) => m.toLowerCase()));
  }

  // Pattern 2: Common files without extension mentioned
  const commonFiles = [
    'readme',
    'package',
    'tsconfig',
    'eslint',
    'prettier',
    'dockerfile',
    'makefile',
    'gitignore',
    'env',
    'config',
  ];

  const queryLower = query.toLowerCase();
  for (const file of commonFiles) {
    if (queryLower.includes(file)) {
      // Try to infer extension based on context
      if (file === 'readme') fileNames.push('readme.md', 'README.md');
      else if (file === 'package') fileNames.push('package.json');
      else if (file === 'tsconfig') fileNames.push('tsconfig.json');
      else if (file === 'eslint')
        fileNames.push('.eslintrc.json', '.eslintrc.js');
      else if (file === 'prettier')
        fileNames.push('.prettierrc', '.prettierrc.json');
      else if (file === 'dockerfile') fileNames.push('Dockerfile');
      else if (file === 'makefile') fileNames.push('Makefile');
      else if (file === 'gitignore') fileNames.push('.gitignore');
      else if (file === 'env')
        fileNames.push('.env', '.env.local', '.env.example');
      else if (file === 'config')
        fileNames.push('config.json', 'config.ts', 'config.js');
    }
  }

  return [...new Set(fileNames)]; // Remove duplicates
}

/**
 * Extract potential code entities (functions, classes, variables)
 * Looks for camelCase, PascalCase, and function-like patterns
 */
function extractCodeEntities(query: string): string[] {
  const entities: string[] = [];

  // Pattern 1: High-quality camelCase or PascalCase identifiers (must be code-like)
  const identifierPattern = /\b([a-z][a-zA-Z0-9]{3,}|[A-Z][a-zA-Z0-9]{3,})\b/g;
  const matches = query.match(identifierPattern);
  if (matches) {
    // Filter out common English words that might not be code
    const commonWords = new Set([
      'the',
      'and',
      'for',
      'with',
      'this',
      'that',
      'from',
      'have',
      'will',
      'would',
      'could',
      'should',
      'can',
      'add',
      'remove',
      'update',
      'delete',
      'create',
      'modify',
      'change',
      'fix',
      'find',
      'what',
      'does',
      'make',
      'when',
      'where',
      'doing',
      'your',
      'comment',
    ]);

    // Additional filters for code quality
    const filtered = matches.filter((m) => {
      const lower = m.toLowerCase();

      // Skip common words
      if (commonWords.has(lower)) return false;

      // Must have at least one uppercase letter (PascalCase or camelCase)
      if (!/[A-Z]/.test(m)) return false;

      // Skip if all caps (likely acronyms or constants)
      if (m === m.toUpperCase()) return false;

      // Skip very short words (after uppercase check)
      if (m.length < 4) return false;

      // Check for reasonable structure:
      // - PascalCase: starts with uppercase
      // - camelCase: starts with lowercase, has mixed case
      // - Skip all-lowercase (should have been caught by uppercase check, but safety)
      if (m === m.toLowerCase()) return false;

      // Skip if it's just abbreviations like "HtmlError" (should be fine)
      // But skip obvious typos or unusual patterns
      const uppercaseCount = (m.match(/[A-Z]/g) || []).length;
      const ratio = uppercaseCount / m.length;

      // Skip if too many uppercase letters (suggests acronym-heavy, not real code)
      if (ratio > 0.5) return false;

      return true;
    });

    entities.push(...filtered);
  }

  // Pattern 2: Words immediately followed by programming keywords (English)
  const entityTypePattern =
    /\b(\w+)\s+(function|class|method|component|hook|interface)\b/gi;
  const typeMatches = query.matchAll(entityTypePattern);
  for (const match of typeMatches) {
    if (match[1].length >= 3) {
      entities.push(match[1]);
    }
  }

  return [...new Set(entities)]; // Remove duplicates
}

/**
 * Search for files by name using find command
 * Returns matching file paths
 */
async function searchFilesByName(
  fileNames: string[],
  workingDir: string,
): Promise<SuggestedFile[]> {
  if (fileNames.length === 0) return [];

  const results: SuggestedFile[] = [];

  for (const fileName of fileNames) {
    try {
      // Use find command to search for files (case-insensitive)
      // Exclude common directories to avoid noise
      const { stdout } = await execAsync(
        `find "${workingDir}" -type f -iname "${fileName}" ` +
          `-not -path "*/node_modules/*" ` +
          `-not -path "*/.git/*" ` +
          `-not -path "*/dist/*" ` +
          `-not -path "*/build/*" ` +
          `-not -path "*/.next/*" ` +
          `2>/dev/null | head -10`,
        { maxBuffer: 1024 * 1024 },
      );

      const paths = stdout
        .trim()
        .split('\n')
        .filter((p) => p);

      for (const filePath of paths) {
        // Calculate confidence based on exact match vs partial match
        const baseName = path.basename(filePath).toLowerCase();
        const confidence = baseName === fileName.toLowerCase() ? 1.0 : 0.7;

        results.push({
          path: filePath,
          reason: 'filename',
          matchedTerm: fileName,
          confidence,
        });
      }
    } catch {
      // Ignore errors (file not found, permission issues, etc.)
      continue;
    }
  }

  return results;
}

/**
 * Search for code entities in file contents using ripgrep or grep
 * Returns matching files
 */
async function searchFilesByContent(
  codeEntities: string[],
  workingDir: string,
): Promise<SuggestedFile[]> {
  if (codeEntities.length === 0) return [];

  const results: SuggestedFile[] = [];

  for (const entity of codeEntities) {
    try {
      // First try ripgrep (rg) if available, fallback to grep
      let cmd: string;

      // Try to detect if ripgrep is available
      try {
        await execAsync('which rg', { timeout: 1000 });
        // Ripgrep command - faster and better
        cmd =
          `rg --files-with-matches --type-add 'source:*.{ts,tsx,js,jsx,json}' ` +
          `--type source --max-count 1 ` +
          `"(function|class|const|let|var|interface|type)\\s+${entity}\\b" ` +
          `"${workingDir}" 2>/dev/null | head -5`;
      } catch {
        // Fallback to grep
        cmd =
          `grep -r -l --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" ` +
          `--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build ` +
          `-E "(function|class|const|let|var|interface|type)\\s+${entity}\\b" ` +
          `"${workingDir}" 2>/dev/null | head -5`;
      }

      const { stdout } = await execAsync(cmd, {
        maxBuffer: 1024 * 1024,
        timeout: 3000, // 3 second timeout to avoid hanging
      });

      const paths = stdout
        .trim()
        .split('\n')
        .filter((p) => p);

      for (const filePath of paths) {
        // Calculate confidence - content matches are slightly less confident than filename matches
        // because they might have multiple results
        results.push({
          path: filePath,
          reason: 'content',
          matchedTerm: entity,
          confidence: 0.8,
        });
      }
    } catch {
      // Ignore errors (command not found, timeout, etc.)
      continue;
    }
  }

  return results;
}

/**
 * Main function: suggest files based on user query
 * Returns top N suggestions (default: 5)
 */
export async function suggestFiles(
  userQuery: string,
  workingDir: string,
  maxSuggestions: number = 5,
): Promise<FileSuggestionResult> {
  // Extract potential terms from query
  const fileNames = extractFileNames(userQuery);
  const codeEntities = extractCodeEntities(userQuery);

  // Search in parallel
  const [fileNameResults, contentResults] = await Promise.all([
    searchFilesByName(fileNames, workingDir),
    searchFilesByContent(codeEntities, workingDir),
  ]);

  // Combine results
  const allResults = [...fileNameResults, ...contentResults];

  // Remove duplicates (same file path) and keep highest confidence
  const uniqueResults = new Map<string, SuggestedFile>();
  for (const result of allResults) {
    const existing = uniqueResults.get(result.path);
    if (!existing || result.confidence > existing.confidence) {
      uniqueResults.set(result.path, result);
    }
  }

  // Sort by confidence and take top N
  const sortedResults = Array.from(uniqueResults.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxSuggestions);

  return {
    suggestedFiles: sortedResults,
    extractedTerms: {
      fileNames,
      codeEntities,
    },
  };
}

/**
 * Format suggested files for display in the banner
 */
export function formatSuggestedFiles(
  suggestions: SuggestedFile[],
  workingDir: string,
): string[] {
  return suggestions.map((s) => {
    const relativePath = path.relative(workingDir, s.path);
    const reasonIcon = s.reason === 'filename' ? '📄' : '🔍';
    return `${reasonIcon} ${relativePath}`;
  });
}
