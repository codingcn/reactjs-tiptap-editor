import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ArrowUp, ChevronRight } from 'lucide-react';

import type { Editor } from '@tiptap/core';

import { IconComponent } from '@/components/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { useLocale } from '@/locales';

import type { AIOptions, ToneType, TranslateLanguage } from '../types';
import { DEFAULT_AI_ICONS } from '../types';

interface AIButtonProps {
  editor: Editor;
  icon?: string;
  tooltip?: string;
  options: AIOptions;
}

export function AIButton({ editor, options }: AIButtonProps) {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [askInput, setAskInput] = useState('');
  const savedSelectionRef = useRef<{ from: number; to: number; text: string } | null>(null);
  const loadingSelectionRef = useRef<{ from: number; to: number } | null>(null);

  // Cancel loading if selection changes during loading
  useEffect(() => {
    if (!isLoading) {
      loadingSelectionRef.current = null;
      return;
    }

    const handleSelectionChange = () => {
      if (!loadingSelectionRef.current) return;
      
      const { from, to } = editor.state.selection;
      const saved = loadingSelectionRef.current;
      
      // If selection changed, cancel loading
      if (from !== saved.from || to !== saved.to) {
        setIsLoading(false);
        (editor.storage as any).ai = {
          ...(editor.storage as any).ai,
          isLoading: false,
        };
        loadingSelectionRef.current = null;
      }
    };

    editor.on('selectionUpdate', handleSelectionChange);
    return () => {
      editor.off('selectionUpdate', handleSelectionChange);
    };
  }, [isLoading, editor]);

  const { completion, streamCompletion, menuItems: customMenuItems, tones = [], languages = [] } = options;

  // Get selection from SelectionHighlight extension (already highlighted)
  const getSelection = useCallback(() => {
    const selectionStorage = (editor.storage as any).selectionHighlight;
    return selectionStorage?.savedSelection || null;
  }, [editor]);

  const hasSelection = useMemo(() => {
    // Check saved selection first (when popover is open)
    if (savedSelectionRef.current) {
      return savedSelectionRef.current.from !== savedSelectionRef.current.to;
    }
    const { from, to } = editor.state.selection;
    return from !== to;
  }, [editor.state.selection]);

  const handleAIAction = useCallback(
    async (action: string, actionOptions?: { tone?: ToneType; language?: TranslateLanguage; prompt?: string }) => {
      // Novel-style: Use saved selection and restore focus
      const selection = savedSelectionRef.current;
      
      if (!selection && action !== 'askAI') {
        return;
      }

      const selectedText = selection?.text || '';
      if (!selectedText && action !== 'askAI') {
        return;
      }

      // Novel-style: Restore selection before action
      if (selection) {
        editor.chain().focus().setTextSelection({ from: selection.from, to: selection.to }).run();
      }

      setIsOpen(false);
      setIsLoading(true);
      
      // Save selection for change detection
      if (selection) {
        loadingSelectionRef.current = { from: selection.from, to: selection.to };
      }
      
      // Store loading state in editor storage and force view update
      (editor.storage as any).ai = {
        ...(editor.storage as any).ai,
        isLoading: true,
      };
      // Force immediate update to trigger BubbleMenu re-evaluation
      editor.view.dispatch(editor.view.state.tr);

      try {
        const request = {
          action: action as any,
          text: selectedText,
          ...actionOptions,
        };

        const { from, to } = selection || { from: editor.state.selection.from, to: editor.state.selection.to };

        if (streamCompletion) {
          let result = '';

          await streamCompletion(
            request,
            (chunk) => {
              result += chunk;
              setIsOpen(false); // Close before text change to avoid flash
              editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, result).run();
            },
            () => {
              setIsLoading(false);
            },
            (error) => {
              console.error('AI Error:', error);
              setIsLoading(false);
            }
          );
        } else if (completion) {
          const response = await completion(request);
          if (response.text) {
            setIsOpen(false); // Close before text change to avoid flash
            editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, response.text).run();
          }
          if (response.error) {
            console.error('AI Error:', response.error);
          }
        }
      } catch (error) {
        console.error('AI Error:', error);
      } finally {
        setIsLoading(false);
        // Clear loading state and position in editor storage
        (editor.storage as any).ai = {
          ...(editor.storage as any).ai,
          isLoading: false,
          loadingPosition: null,
        };
        // Clear saved selection in both ref and extension storage
        savedSelectionRef.current = null;
        (editor.commands as any).clearSavedSelection?.();
        // Force immediate update to trigger BubbleMenu re-evaluation
        editor.view.dispatch(editor.view.state.tr);
      }
    },
    [editor, completion, streamCompletion]
  );

  const menuItems = useMemo(() => {
    const items: Array<{
      key: string;
      icon: string;
      label: string;
      action?: () => void;
      disabled?: boolean;
      separator?: boolean;
      submenu?: Array<{ key: string; label: string; action: () => void }>;
    }> = [];

    // Build menu item for a given action
    const buildMenuItem = (actionType: string, customIcon?: string, customLabel?: string) => {
      const icon = customIcon || DEFAULT_AI_ICONS[actionType as keyof typeof DEFAULT_AI_ICONS] || 'Sparkles';
      const label = customLabel || t(`editor.ai.${actionType}` as any);

      if (actionType === 'adjustTone') {
        return {
          key: actionType,
          icon,
          label,
          disabled: !hasSelection,
          submenu: tones.map((tone) => ({
            key: tone,
            label: t(`editor.ai.tone.${tone}` as any),
            action: () => handleAIAction('adjustTone', { tone }),
          })),
        };
      }

      if (actionType === 'translate') {
        return {
          key: actionType,
          icon,
          label,
          disabled: !hasSelection,
          submenu: languages.map((lang) => ({
            key: lang,
            label: t(`editor.ai.language.${lang}` as any),
            action: () => handleAIAction('translate', { language: lang }),
          })),
        };
      }

      return {
        key: actionType,
        icon,
        label,
        action: () => handleAIAction(actionType),
        disabled: !hasSelection,
      };
    };

    if (customMenuItems && customMenuItems.length > 0) {
      customMenuItems.forEach((item) => {
        items.push(buildMenuItem(item.action, item.icon, item.label));
      });
    }

    return items;
  }, [customMenuItems, tones, languages, t, handleAIAction, hasSelection]);

  if (!completion && !streamCompletion) {
    return null;
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={(open) => {
          // Clear saved selection when closing
          if (!open) {
            savedSelectionRef.current = null;
          }
          setIsOpen(open);
        }}>
        <PopoverTrigger asChild>
          <button
            className="richtext-inline-flex richtext-items-center richtext-justify-center richtext-gap-1.5 richtext-h-[32px] richtext-px-2 richtext-rounded-md richtext-text-sm richtext-font-medium hover:richtext-bg-accent hover:richtext-text-accent-foreground disabled:richtext-pointer-events-none disabled:richtext-opacity-50"
            disabled={isLoading}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              // Save selection before popover opens (already highlighted by SelectionHighlight)
              if (!isOpen) {
                savedSelectionRef.current = getSelection();
              }
            }}
          >
            <IconComponent name="Sparkles" className="richtext-size-4 richtext-text-primary" />
            <span className="richtext-text-sm richtext-font-medium richtext-text-primary">
Ask AI
</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" side="bottom" className="richtext-w-80 !richtext-p-2 data-[state=closed]:!richtext-animate-none">
          {customMenuItems?.some(item => item.action === 'askAI') && (
          <div className="richtext-mb-2">
            <div className="richtext-flex richtext-items-center richtext-gap-2 richtext-px-3 richtext-py-2">
              <IconComponent name="Sparkles" className="richtext-size-4 richtext-text-primary richtext-shrink-0" />
              <input
                className="richtext-flex-1 richtext-bg-transparent richtext-text-sm richtext-outline-none placeholder:richtext-text-muted-foreground"
                placeholder={t('editor.ai.askAI.placeholder' as any)}
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && askInput.trim()) {
                    handleAIAction('askAI', { prompt: askInput });
                    setAskInput('');
                  }
                }}
              />
              <button
                className="richtext-flex richtext-h-6 richtext-w-6 richtext-items-center richtext-justify-center richtext-rounded-full richtext-bg-primary richtext-text-primary-foreground hover:richtext-bg-primary/90 disabled:richtext-opacity-30 richtext-shrink-0 richtext-transition-colors"
                disabled={!askInput.trim()}
                onClick={() => {
                  if (askInput.trim()) {
                    handleAIAction('askAI', { prompt: askInput });
                    setAskInput('');
                  }
                }}
              >
                <ArrowUp className="richtext-size-3" />
              </button>
            </div>
          </div>
        )}
        
        <div className="richtext-px-3 richtext-py-1.5 richtext-border-t">
          <span className="richtext-text-xs richtext-font-medium richtext-text-muted-foreground">
            {t('editor.ai.editSelection' as any)}
          </span>
        </div>
        {menuItems.filter(item => !item.separator).map((item) => {
          if (item.submenu) {
            return (
              <HoverSubMenu key={item.key} label={item.label} icon={item.icon} disabled={item.disabled}>
                {item.submenu.map((subItem) => (
                  <MenuItem key={subItem.key} onClick={subItem.action}>
                    {subItem.label}
                  </MenuItem>
                ))}
              </HoverSubMenu>
            );
          }

          return (
            <MenuItem
              key={item.key}
              onClick={item.action}
              disabled={item.disabled}
              icon={item.icon}
            >
              {item.label}
            </MenuItem>
          );
        })}
        </PopoverContent>
      </Popover>
    </>
  );
}

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: string;
}

function MenuItem({ children, onClick, disabled, icon }: MenuItemProps) {
  return (
    <div
      className={`richtext-flex richtext-cursor-pointer richtext-items-center richtext-gap-3 richtext-rounded richtext-px-3 richtext-py-2 richtext-text-sm hover:richtext-bg-accent/50 richtext-transition-colors ${disabled ? 'richtext-opacity-50 richtext-pointer-events-none' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      {icon && <IconComponent name={icon} className="richtext-size-4 richtext-text-primary" />}
      <span className="richtext-font-medium">
{children}
</span>
    </div>
  );
}

interface HoverSubMenuProps {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: string;
}

function HoverSubMenu({ label, children, disabled, icon }: HoverSubMenuProps) {
  const [openAbove, setOpenAbove] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  const checkPosition = useCallback(() => {
    if (!triggerRef.current || !submenuRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const submenuHeight = submenuRef.current.scrollHeight;
    const viewportHeight = window.innerHeight;
    
    // Check if submenu would overflow bottom of viewport
    const spaceBelow = viewportHeight - triggerRect.top;
    const spaceAbove = triggerRect.bottom;
    
    if (spaceBelow < submenuHeight && spaceAbove > spaceBelow) {
      setOpenAbove(true);
    } else {
      setOpenAbove(false);
    }
  }, []);

  return (
    <div 
      ref={triggerRef}
      className={`richtext-group richtext-relative ${disabled ? 'richtext-opacity-50 richtext-pointer-events-none' : ''}`}
      onMouseEnter={checkPosition}
    >
      <div className="richtext-flex richtext-cursor-pointer richtext-items-center richtext-justify-between richtext-gap-3 richtext-rounded richtext-px-3 richtext-py-2 richtext-text-sm hover:richtext-bg-accent/50 richtext-transition-colors">
        <div className="richtext-flex richtext-items-center richtext-gap-3">
          {icon && <IconComponent name={icon} className="richtext-size-4 richtext-text-primary" />}
          <span className="richtext-font-medium">
{label}
</span>
        </div>
        <ChevronRight className="richtext-size-4 richtext-text-muted-foreground" />
      </div>
      <div 
        ref={submenuRef}
        className={`richtext-invisible richtext-absolute richtext-left-full richtext-z-50 richtext-ml-1 richtext-min-w-[10rem] richtext-rounded-md richtext-border richtext-bg-popover richtext-p-2 richtext-shadow-lg group-hover:richtext-visible ${openAbove ? 'richtext-bottom-0' : 'richtext-top-0'}`}
      >
        {children}
      </div>
    </div>
  );
}

export default AIButton;
