import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectionHighlight: {
      clearSavedSelection: () => ReturnType;
    };
  }
}

export interface SelectionHighlightOptions {
  /** Highlight color for selected text */
  color: string;
}

const pluginKey = new PluginKey('selection-highlight');

export const SelectionHighlight = Extension.create<SelectionHighlightOptions>({
  name: 'selectionHighlight',

  addOptions() {
    return {
      color: '#bfdbfe',
    };
  },

  addStorage() {
    return {
      savedSelection: null as { from: number; to: number; text: string } | null,
    };
  },

  addCommands() {
    return {
      clearSavedSelection: () => () => {
        this.storage.savedSelection = null;
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const extensionThis = this;
    const highlightColor = this.options.color;

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldState, oldEditorState, newEditorState) {
            const { from, to } = newEditorState.selection;
            
            // Only clear decoration when no selection, but keep savedSelection
            if (from === to) {
              return DecorationSet.empty;
            }
            
            // Save selection and create decoration when there's a selection
            const text = newEditorState.doc.textBetween(from, to, ' ');
            extensionThis.storage.savedSelection = { from, to, text };
            
            // Create decoration
            const decoration = Decoration.inline(from, to, {
              style: `background-color: ${highlightColor}; border-radius: 2px;padding:5px 0;`,
            });
            
            return DecorationSet.create(newEditorState.doc, [decoration]);
          },
        },
        props: {
          decorations(state) {
            return pluginKey.getState(state);
          },
        },
      }),
    ];
  },
});
