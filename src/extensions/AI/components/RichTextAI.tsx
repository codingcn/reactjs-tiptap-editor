import { AI } from '@/extensions/AI/AI';
import { useButtonProps } from '@/hooks/useButtonProps';
import { useEditorInstance } from '@/store/editor';

import { AIButton } from './AIButton';

export function RichTextAI() {
  const editor = useEditorInstance();
  const buttonProps = useButtonProps(AI.name);

  if (!editor || !buttonProps) {
    return null;
  }

  const { options } = buttonProps.componentProps;

  return (
    <AIButton
      editor={editor}
      options={options}
    />
  );
}

export default RichTextAI;
