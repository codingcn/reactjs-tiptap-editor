import React from 'react';

import type { Editor } from '@tiptap/core';

import { useLocale } from '@/locales';

import type { AIOptions } from '../types';
import { AIButton } from './AIButton';

interface AIBubbleMenuProps {
  editor: Editor;
  options: AIOptions;
}

export function AIBubbleMenu({ editor, options }: AIBubbleMenuProps) {
  const { t } = useLocale();

  if (!options.bubbleMenu) {
    return null;
  }

  return (
    <AIButton
      editor={editor}
      icon="Sparkles"
      tooltip={t('editor.ai.tooltip' as any)}
      options={options}
    />
  );
}

export default AIBubbleMenu;
