import { Extension } from '@tiptap/core';

import type { GeneralOptions } from '@/types';

import { AIButton } from './components/AIButton';
import type { AIOptions } from './types';
import { SelectionHighlight } from '../SelectionHighlight';

export * from './components/RichTextAI';

export interface AIExtensionOptions extends AIOptions, Partial<GeneralOptions<AIExtensionOptions>> {}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ai: {
      /**
       * Run AI action on selected text
       */
      runAIAction: (action: string, options?: Record<string, any>) => ReturnType;
    };
  }
}

export const AI = /* @__PURE__ */ Extension.create<AIExtensionOptions>({
  name: 'ai',

  addOptions() {
    return {
      ...this.parent?.(),
      completion: undefined,
      streamCompletion: undefined,
      menuItems: [
        { action: 'improve' },
        { action: 'fixSpelling' },
        { action: 'makeShorter' },
        { action: 'makeLonger' },
        { action: 'simplify' },
        { action: 'emojify' },
        { action: 'tldr' },
        { action: 'translate' },
        { action: 'completeSentence' },
        { action: 'adjustTone' },
      ],
      tones: ['professional', 'casual', 'straightforward', 'confident', 'friendly'],
      languages: [
        'english',
        'chinese',
        'spanish',
        'french',
        'german',
        'japanese',
        'korean',
        'portuguese',
        'russian',
        'arabic',
      ],
      bubbleMenu: true,
      toolbar: true,
      button: ({ editor, t, extension }: any) => ({
        component: AIButton,
        componentProps: {
          editor,
          extension,
          icon: 'Sparkles',
          tooltip: t('editor.ai.tooltip'),
          options: extension.options,
        },
      }),
    };
  },

  addExtensions() {
    return [
      SelectionHighlight.configure({
        color: '#bfdbfe',
      }),
    ];
  },

  addCommands() {
    return {
      runAIAction:
        (action: string, options?: Record<string, any>) =>
        ({ editor }) => {
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc.textBetween(from, to, ' ');

          if (!selectedText && action !== 'askAI') {
            return false;
          }

          const extensionOptions = this.options;
          const { completion, streamCompletion } = extensionOptions;

          if (!completion && !streamCompletion) {
            console.warn('AI extension: No completion function provided');
            return false;
          }

          // Store the action context for later use
          (editor.storage as any).ai = {
            action,
            selectedText,
            options,
            from,
            to,
          };

          return true;
        },
    };
  },

  addStorage() {
    return {
      action: null,
      selectedText: '',
      options: null,
      from: 0,
      to: 0,
      isLoading: false,
    };
  },
});
