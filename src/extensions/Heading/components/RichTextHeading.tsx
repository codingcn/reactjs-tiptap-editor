import React, { Fragment, useMemo, useState } from 'react';

import {
  ActionMenuButton,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components';
import { Heading } from '@/extensions/Heading/Heading';
import { useActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';
import { cn } from '@/lib/utils';
import { useLocale } from '@/locales';
import type { ButtonViewReturnComponentProps } from '@/types';
import { getShortcutKey } from '@/utils/plateform';

export interface Item {
  title: string
  icon?: any
  level?: number
  isActive: NonNullable<ButtonViewReturnComponentProps['isActive']>
  action?: ButtonViewReturnComponentProps['action']
  style?: React.CSSProperties
  shortcutKeys?: string[]
  disabled?: boolean
  divider?: boolean
  default?: boolean
}

export function RichTextHeading() {
  const { t } = useLocale();
  const buttonProps = useButtonProps(Heading.name);

  const {
    icon = undefined,
    tooltip = undefined,
    isActive = undefined,
    items = [],
  } = buttonProps?.componentProps ?? {};

  const { disabled, dataState } = useActive(isActive);

  // Use controlled state to prevent menu from closing on re-render
  const [isOpen, setIsOpen] = useState(false);

  const title = useMemo(() => {
    return (dataState as any)?.title || t('editor.paragraph.tooltip');
  }, [dataState]);

  if (!buttonProps) {
    return <></>;
  }

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild
        disabled={disabled}
      >
        <ActionMenuButton
          disabled={disabled}
          icon={icon}
          title={title}
          tooltip={tooltip}
        // tooltipOptions={tooltipOptions}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="richtext-w-full"
        onMouseDown={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {items?.map((item: any, index: any) => {

          return (
            <Fragment key={`heading-k-${index}`}>
              <DropdownMenuCheckboxItem
                checked={title === item.title}
                onClick={item.action}
              >
                <div className={cn('richtext-ml-1 richtext-h-full', {
                  '': item.level === 'Paragraph',
                  'heading-1': item.level === 1,
                  'heading-2': item.level === 2,
                  'heading-3': item.level === 3,
                  'heading-4': item.level === 4,
                  'heading-5': item.level === 5,
                  'heading-6': item.level === 6,
                })}
                >
                  {item.title}
                </div>

                {!!item?.shortcutKeys?.length && (
                  <DropdownMenuShortcut className="richtext-pl-4">
                    {item?.shortcutKeys?.map((item: any) => getShortcutKey(item)).join(' ')}
                  </DropdownMenuShortcut>
                )}
              </DropdownMenuCheckboxItem>

              {item.level === 'Paragraph' && <DropdownMenuSeparator />}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
