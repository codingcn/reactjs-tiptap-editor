import React from 'react';

import { TextSelection } from '@tiptap/pm/state';
import { BubbleMenu } from '@tiptap/react/menus';

import { IconComponent } from '@/components/icons';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';

export function AILoadingBubble() {
  const editor = useEditorInstance();
  const { t } = useLocale();

  // Check if AI is loading
  const aiStorage = (editor?.storage as any)?.ai;
  const isLoading = aiStorage?.isLoading;

  const shouldShow = ({ editor }: any) => {
    const { selection } = editor.view.state;
    return selection instanceof TextSelection;
  };

  // Don't render the BubbleMenu at all if not loading
  if (!editor || !isLoading) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'bottom', offset: 8 }}
      pluginKey="AILoadingBubble"
      shouldShow={shouldShow}
    >
      <div className="richtext-flex richtext-items-center richtext-gap-2 richtext-rounded-md !richtext-border !richtext-border-solid !richtext-border-border richtext-bg-popover richtext-px-3 richtext-py-2 richtext-shadow-md">
        <IconComponent name="Sparkles" className="richtext-size-4 richtext-text-primary" />
        <span className="richtext-text-[13px] richtext-text-primary">
          {t('editor.ai.loading' as any)}
        </span>
        <div className="richtext-flex richtext-items-center richtext-gap-1 richtext-ml-1">
          <span 
            className="richtext-w-1.5 richtext-h-1.5 richtext-rounded-full richtext-bg-primary"
            style={{ animation: 'aiDotPulse 1.4s ease-in-out infinite', animationDelay: '0s' }}
          />
          <span 
            className="richtext-w-1.5 richtext-h-1.5 richtext-rounded-full richtext-bg-primary"
            style={{ animation: 'aiDotPulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }}
          />
          <span 
            className="richtext-w-1.5 richtext-h-1.5 richtext-rounded-full richtext-bg-primary"
            style={{ animation: 'aiDotPulse 1.4s ease-in-out infinite', animationDelay: '0.4s' }}
          />
        </div>
        <style>
{`
          @keyframes aiDotPulse {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1.2); opacity: 1; }
          }
        `}
</style>
      </div>
    </BubbleMenu>
  );
}

export default AILoadingBubble;
