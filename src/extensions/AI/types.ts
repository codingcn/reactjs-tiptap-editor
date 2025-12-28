import type { Editor } from '@tiptap/core';

/**
 * AI action types
 */
export type AIActionType =
  | 'improve'
  | 'fixSpelling'
  | 'makeShorter'
  | 'makeLonger'
  | 'simplify'
  | 'emojify'
  | 'tldr'
  | 'translate'
  | 'completeSentence'
  | 'askAI'
  | 'adjustTone';

/**
 * Tone types for adjustTone action
 */
export type ToneType =
  | 'professional'
  | 'casual'
  | 'straightforward'
  | 'confident'
  | 'friendly';

/**
 * Language types for translate action
 */
export type TranslateLanguage =
  | 'english'
  | 'chinese'
  | 'spanish'
  | 'french'
  | 'german'
  | 'japanese'
  | 'korean'
  | 'portuguese'
  | 'russian'
  | 'arabic';

/**
 * AI completion request payload
 */
export interface AICompletionRequest {
  action: AIActionType;
  text: string;
  tone?: ToneType;
  language?: TranslateLanguage;
  prompt?: string;
}

/**
 * AI completion response
 */
export interface AICompletionResponse {
  text: string;
  error?: string;
}

/**
 * AI completion function type
 */
export type AICompletionFunction = (
  request: AICompletionRequest
) => Promise<AICompletionResponse>;

/**
 * AI streaming completion function type
 */
export type AIStreamCompletionFunction = (
  request: AICompletionRequest,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
) => Promise<void> | void;

/**
 * AI menu item configuration
 */
export interface AIMenuItemConfig {
  /**
   * Action type
   */
  action: AIActionType;
  /**
   * Custom icon name (from lucide-react or custom icons)
   */
  icon?: string;
  /**
   * Custom label (overrides i18n)
   */
  label?: string;
}

/**
 * AI extension options
 */
export interface AIOptions {
  /**
   * AI completion function (non-streaming)
   */
  completion?: AICompletionFunction;

  /**
   * AI streaming completion function
   */
  streamCompletion?: AIStreamCompletionFunction;

  /**
   * Menu items configuration
   * Controls which actions to show, their order, and optionally custom icons/labels
   */
  menuItems?: AIMenuItemConfig[];

  /**
   * Available tones for adjustTone action
   * @default all tones
   */
  tones?: ToneType[];

  /**
   * Available languages for translate action
   * @default all languages
   */
  languages?: TranslateLanguage[];

  /**
   * Custom placeholder for Ask AI input
   */
  askAIPlaceholder?: string;

  /**
   * Show in bubble menu
   * @default true
   */
  bubbleMenu?: boolean;

  /**
   * Show in toolbar
   * @default true
   */
  toolbar?: boolean;
}

/**
 * Default icons for AI actions
 */
export const DEFAULT_AI_ICONS: Record<AIActionType, string> = {
  improve: 'Sparkles',
  adjustTone: 'Settings',
  fixSpelling: 'Pencil',
  makeLonger: 'WrapText',
  makeShorter: 'Minus',
  simplify: 'Type',
  emojify: 'Emoji',
  completeSentence: 'Plus',
  tldr: 'List',
  translate: 'Replace',
  askAI: 'Sparkles',
};

/**
 * AI menu item
 */
export interface AIMenuItem {
  key: AIActionType;
  icon: string;
  label: string;
  action: (editor: Editor, options?: any) => void;
  children?: AISubMenuItem[];
}

/**
 * AI sub menu item (for tones and languages)
 */
export interface AISubMenuItem {
  key: string;
  label: string;
  value: string;
}
