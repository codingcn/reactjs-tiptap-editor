import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { RichTextProvider } from 'reactjs-tiptap-editor'

import { localeActions } from 'reactjs-tiptap-editor/locale-bundle'

import { themeActions } from 'reactjs-tiptap-editor/theme'


// Base Kit
import { Document } from '@tiptap/extension-document'
import { Text } from '@tiptap/extension-text'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Dropcursor, Gapcursor, Placeholder, TrailingNode } from '@tiptap/extensions'
import { HardBreak } from '@tiptap/extension-hard-break'
import { TextStyle } from '@tiptap/extension-text-style';
import { ListItem } from '@tiptap/extension-list';

// build extensions
import { History, RichTextUndo, RichTextRedo } from 'reactjs-tiptap-editor/history';
import { SearchAndReplace, RichTextSearchAndReplace } from 'reactjs-tiptap-editor/searchandreplace';
import { Clear, RichTextClear } from 'reactjs-tiptap-editor/clear';
import { FontFamily, RichTextFontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { Heading, RichTextHeading } from 'reactjs-tiptap-editor/heading';
import { FontSize, RichTextFontSize } from 'reactjs-tiptap-editor/fontsize';
import { Bold, RichTextBold } from 'reactjs-tiptap-editor/bold';
import { Italic, RichTextItalic } from 'reactjs-tiptap-editor/italic';
import { TextUnderline, RichTextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { Strike, RichTextStrike } from 'reactjs-tiptap-editor/strike';
import { MoreMark, RichTextMoreMark } from 'reactjs-tiptap-editor/moremark';
import { Emoji, RichTextEmoji } from 'reactjs-tiptap-editor/emoji';
import { Color, RichTextColor } from 'reactjs-tiptap-editor/color';
import { Highlight, RichTextHighlight } from 'reactjs-tiptap-editor/highlight';
import { BulletList, RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist';
import { OrderedList, RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { TextAlign, RichTextAlign } from 'reactjs-tiptap-editor/textalign';
import { Indent, RichTextIndent } from 'reactjs-tiptap-editor/indent';
import { LineHeight, RichTextLineHeight } from 'reactjs-tiptap-editor/lineheight';
import { TaskList, RichTextTaskList } from 'reactjs-tiptap-editor/tasklist';
import { Link, RichTextLink } from 'reactjs-tiptap-editor/link';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { Video, RichTextVideo } from 'reactjs-tiptap-editor/video';
import { ImageGif, RichTextImageGif } from 'reactjs-tiptap-editor/imagegif';
import { Blockquote, RichTextBlockquote } from 'reactjs-tiptap-editor/blockquote';
import { HorizontalRule, RichTextHorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Code, RichTextCode } from 'reactjs-tiptap-editor/code';
import { CodeBlock, RichTextCodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { Column, ColumnNode, MultipleColumnNode, RichTextColumn } from 'reactjs-tiptap-editor/column';
import { Table, RichTextTable } from 'reactjs-tiptap-editor/table';
import { Iframe, RichTextIframe } from 'reactjs-tiptap-editor/iframe';
import { ExportPdf, RichTextExportPdf } from 'reactjs-tiptap-editor/exportpdf';
import { ImportWord, RichTextImportWord } from 'reactjs-tiptap-editor/importword';
import { ExportWord, RichTextExportWord} from 'reactjs-tiptap-editor/exportword';
import { TextDirection, RichTextTextDirection } from 'reactjs-tiptap-editor/textdirection';
import { Attachment, RichTextAttachment } from 'reactjs-tiptap-editor/attachment';
import { Katex, RichTextKatex } from 'reactjs-tiptap-editor/katex';
import { Excalidraw, RichTextExcalidraw } from 'reactjs-tiptap-editor/excalidraw';
import { Mermaid, RichTextMermaid } from 'reactjs-tiptap-editor/mermaid';
import { Drawer, RichTextDrawer } from 'reactjs-tiptap-editor/drawer';
import { Twitter, RichTextTwitter } from 'reactjs-tiptap-editor/twitter';
import { Mention } from 'reactjs-tiptap-editor/mention';
import { CodeView, RichTextCodeView } from 'reactjs-tiptap-editor/codeview';
import { AI } from 'reactjs-tiptap-editor/ai';

// Slash Command
import { SlashCommand, SlashCommandList } from 'reactjs-tiptap-editor/slashcommand';


// Bubble
import {
  RichTextBubbleColumns,
  RichTextBubbleDrawer,
  RichTextBubbleExcalidraw,
  RichTextBubbleIframe,
  RichTextBubbleKatex,
  RichTextBubbleLink,
  RichTextBubbleImage,
  RichTextBubbleVideo,
  RichTextBubbleImageGif,
  RichTextBubbleMermaid,
  RichTextBubbleTable,
  RichTextBubbleText,
  RichTextBubbleTwitter,
  RichTextBubbleMenuDragHandle
} from 'reactjs-tiptap-editor/bubble';

import 'reactjs-tiptap-editor/style.css'
import 'prism-code-editor-lightweight/layout.css';
import "prism-code-editor-lightweight/themes/github-dark.css"
import 'katex/dist/katex.min.css'
import 'easydrawer/styles.css'
import "@excalidraw/excalidraw/index.css";

import 'katex/contrib/mhchem'

// import Collaboration from '@tiptap/extension-collaboration'
// import CollaborationCaret from '@tiptap/extension-collaboration-caret'
// import { HocuspocusProvider } from '@hocuspocus/provider'
// import * as Y from 'yjs'
import { EditorContent, useEditor } from '@tiptap/react';

// const ydoc = new Y.Doc()

// const hocuspocusProvider = new HocuspocusProvider({
//   url: 'ws://0.0.0.0:8080',
//   name: 'github.com/hunghg255',
//   document: ydoc,
// })

function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function convertBase64ToBlob(base64: string) {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

// custom document to support columns
const DocumentColumn = /* @__PURE__ */ Document.extend({
  content: '(block|columns)+',
});

const MOCK_USERS = [{
    id: '0',
    label: 'hunghg255',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/42096908?v=4'
    }
  },
 {
  id: '1',
    label: 'benjamincanac',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/739984?v=4'
    }
  },
  {
    id: '2',
    label: 'atinux',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/904724?v=4'
    }
  },
  {
    id: '3',
    label: 'danielroe',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/28706372?v=4'
    }
  },
  {
    id: '4',
    label: 'pi0',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/5158436?v=4'
    }
  }
];

const BaseKit = [
  DocumentColumn,
  Text,
  Dropcursor.configure({
    class: 'reactjs-tiptap-editor-theme',
    color: 'hsl(var(--primary))',
    width: 2,
  }),
  Gapcursor,
  HardBreak,
  Paragraph,
  TrailingNode,
  ListItem,
  TextStyle,
  Placeholder.configure({
    placeholder: 'Press \'/\' for commands',
  })
]

const extensions = [
 ...BaseKit,

  History,
  SearchAndReplace,
  Clear,
  FontFamily,
  Heading,
  FontSize,
  Bold,
  Italic,
  TextUnderline,
  Strike,
  MoreMark,
  Emoji,
  Color,
  Highlight,
  BulletList,
  OrderedList,
  TextAlign,
  Indent,
  LineHeight,
  TaskList,
  Link,
  Image.configure({
    upload: (files: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(files))
        }, 300)
      })
    },
  }),
  Video.configure({
    upload: (files: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(files))
        }, 300)
      })
    },
  }),
    ImageGif.configure({
    provider: 'giphy',
    API_KEY: import.meta.env.VITE_GIPHY_API_KEY as string
  }),
  Blockquote,
  HorizontalRule,
  Code,
  CodeBlock,

  Column,
  ColumnNode,
  MultipleColumnNode,
  Table,
  Iframe,
  ExportPdf,
  ImportWord,
  ExportWord,
  TextDirection,
  Attachment.configure({
    upload: (file: any) => {
      // fake upload return base 64
      const reader = new FileReader()
      reader.readAsDataURL(file)

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string)
          resolve(URL.createObjectURL(blob))
        }, 300)
      })
    },
  }),
  Katex,
  Excalidraw,
  Mermaid.configure({
    upload: (file: any) => {
      // fake upload return base 64
      const reader = new FileReader()
      reader.readAsDataURL(file)

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string)
          resolve(URL.createObjectURL(blob))
        }, 300)
      })
    },
  }),
  Drawer.configure({
    upload: (file: any) => {
      // fake upload return base 64
      const reader = new FileReader()
      reader.readAsDataURL(file)

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string)
          resolve(URL.createObjectURL(blob))
        }, 300)
      })
    },
  }),
  Twitter,
  Mention.configure({
    suggestion: {
      char: '@',
      items: async ({ query }: any) => {
        console.log('query', query);
        // const data = MOCK_USERS.map(item => item.label);
        // return data.filter(item => item.toLowerCase().startsWith(query.toLowerCase()));
        return MOCK_USERS.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()));
      },
    }
    // suggestions: [
    //   {
    //     char: '@',
    //     items: async ({ query }: any) => {
    //       return MOCK_USERS.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()));
    //     },
    //   },
    //   {
    //     char: '#',
    //     items: async ({ query }: any) => {
    //       return MOCK_USERS.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()));
    //     },
    //   }
    // ]
  }),
  SlashCommand,
  CodeView,
  AI.configure({
    // Configure menu items: which actions to show, their order, and optionally custom icons/labels
    menuItems: [
      { action: 'improve' },
      { action: 'adjustTone' },
      { action: 'fixSpelling' },
      { action: 'makeLonger' },
      { action: 'makeShorter' },
      { action: 'simplify' },
      { action: 'emojify' },
      { action: 'completeSentence' },
      { action: 'tldr' },
      { action: 'translate' },
    ],
    // Configure available tones for adjustTone
    tones: ['professional', 'casual', 'straightforward', 'confident', 'friendly'],
    // Configure available languages for translate
    languages: ['english', 'chinese','japanese',  'spanish', 'french', 'german', 'korean'],
    completion: async (request) => {
      console.log('AI Request:', request);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const responses: Record<string, string> = {
        improve: `[Improved] ${request.text}`,
        fixSpelling: request.text.replace(/teh/g, 'the'),
        makeShorter: request.text.split(' ').slice(0, Math.ceil(request.text.split(' ').length / 2)).join(' ') + '...',
        makeLonger: `${request.text} Furthermore, this text has been expanded.`,
        simplify: request.text.split('.')[0] + '.',
        emojify: `${request.text} 🎉✨`,
        tldr: `TL;DR: ${request.text.substring(0, 50)}...`,
        translate: `[Translated to ${request.language}] ${request.text}`,
        completeSentence: `${request.text} and this is the completed sentence.`,
        adjustTone: `[${request.tone} tone] ${request.text}`,
        askAI: `AI Response to "${request.prompt}": This is a mock response.`,
      };

      return { text: responses[request.action] || request.text };
    },
  }),

  //  Collaboration.configure({
  //   document: hocuspocusProvider.document,
  // }),
  // CollaborationCaret.configure({
  //   provider: hocuspocusProvider,
  //   user: {
  //     color: getRandomColor(),
  //   },
  // }),
]

const DEFAULT = `
<h1>探索人工智能的未来</h1>
<p>人工智能（AI）正在以前所未有的速度改变我们的世界。从智能助手到自动驾驶汽车，从医疗诊断到创意写作，AI 的应用已经渗透到生活的方方面面。</p>

<h2>AI 的发展历程</h2>
<p>人工智能的概念最早可以追溯到 1956 年的达特茅斯会议。经过近七十年的发展，AI 已经从简单的规则系统演变为能够进行深度学习的复杂神经网络。</p>

<p>近年来，大语言模型（LLM）的出现更是掀起了一场革命。这些模型能够理解和生成人类语言，为人机交互开辟了新的可能性。</p>

<h2>AI 在日常生活中的应用</h2>
<ul>
<li><strong>智能写作助手</strong>：帮助用户改进文章、修正语法错误、优化表达方式</li>
<li><strong>图像生成</strong>：根据文字描述创造出令人惊叹的艺术作品</li>
<li><strong>代码编程</strong>：协助开发者编写、调试和优化代码</li>
<li><strong>语言翻译</strong>：实现实时、准确的多语言翻译</li>
</ul>

<h2>未来展望</h2>
<p>随着技术的不断进步，AI 将会变得更加智能和普及。我们期待看到更多创新应用的出现，同时也需要关注 AI 伦理和安全问题，确保技术发展造福人类社会。</p>

<blockquote>
<p>"人工智能是我们这个时代最重要的技术变革之一。" —— 某科技领袖</p>
</blockquote>

<p>让我们一起拥抱这个充满可能性的未来！</p>
`

function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout
  return function (...args: any[]) {
    clearTimeout(timeout)
    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}


const Header = ({ editor, theme, setTheme }) => {
  const [editorEditable, setEditorEditable] = useState(false);

  useEffect(() => {
    setEditorEditable(editor?.isEditable ?? true);
  }, []);

  useEffect(() => {
    if (editor) {
      editor.on('update', () => {
        setEditorEditable(editor.isEditable);
      })
    }

    return () => {
      if (editor) {
        editor.off('update', () => {
          setEditorEditable(editor.isEditable);
        })
      }
    }
  }, [editor]);

  return <>
    <div
      style={{
        display: 'flex',
        gap: '12px',
        marginTop: '100px',
        marginBottom: 10,
      }}
    >
      <button type="button" onClick={() => {
        localeActions.setLang('vi')
      }}>Vietnamese</button>
      <button type="button" onClick={() => localeActions.setLang('en')}>English</button>
      <button type="button" onClick={() => localeActions.setLang('zh_CN')}>Chinese</button>
      <button type="button" onClick={() => localeActions.setLang('pt_BR')}>Português</button>
      <button type="button" onClick={() => localeActions.setLang('hu_HU')}>Hungarian</button>
      <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
      <button type="button" onClick={() => {
        editor?.setEditable(!editorEditable);
      }}>{editorEditable ? 'Editable' : 'Disabled'}</button>


    </div>
      <div className='flex items-center gap-1'>
        <button className="border border-solid border-gray-500 p-1" onClick={() => {
          themeActions.setTheme('light');
        }}>Theme light</button>
         <button className="border border-solid border-gray-500 p-1" onClick={() => {
          themeActions.setTheme('dark');
        }} >Theme dark</button>
      </div>

      <div className='flex items-center gap-1'>
        <button className="border border-solid border-gray-500 p-1" onClick={() => {
          themeActions.setColor('default');
        }} >Color default</button>
         <button className="border border-solid border-gray-500 p-1" onClick={() => {
          themeActions.setColor('red');
        }} >Theme red</button>

        <button className="border border-solid border-gray-500 p-1" onClick={() => {
          themeActions.setColor('blue');
        }} >Theme blue</button>

        <button className="border border-solid border-gray-500 p-1" onClick={() => {
          themeActions.setColor('green');
        }} >Theme green</button>

        <button className="border border-solid border-gray-500 p-1" onClick={() => {
          themeActions.setColor('orange');
        }} >Theme orange</button>

          <button className="border border-solid border-gray-500 p-1" onClick={() => {
          themeActions.setColor('rose');
        }} >Theme rose</button>

         <button className="border border-solid border-gray-500 p-1" onClick={() => {
          themeActions.setColor('violet');
        }} >Theme violet</button>

         <button className="border border-solid border-gray-500 p-1" onClick={() => {
          themeActions.setColor('yellow');
        }} >Theme yellow</button>
      </div>

      <div className='flex items-center gap-2'>
        <span>Border radius</span>

        <input type='range' min={0} max={3} step={0.05} defaultValue={0.65} onChange={(e) => {
          const value = e.target.value;
          themeActions.setBorderRadius(`${value}rem`);
        }} />
      </div>
  </>
}

const RichTextToolbar = () => {

  return <div className="flex items-center gap-2 flex-wrap border-b border-solid">
    <RichTextUndo />
    <RichTextRedo />
    <RichTextSearchAndReplace />
    <RichTextClear />
    <RichTextFontFamily />
    <RichTextHeading />
    <RichTextFontSize />
    <RichTextBold />
    <RichTextItalic />
    <RichTextUnderline />
    <RichTextStrike />
    <RichTextMoreMark />
    <RichTextEmoji />
    <RichTextColor />
    <RichTextHighlight />
    <RichTextBulletList />
    <RichTextOrderedList />
    <RichTextAlign />
    <RichTextIndent />
    <RichTextLineHeight />
    <RichTextTaskList />
    <RichTextLink />
    <RichTextImage />
    <RichTextVideo />
    <RichTextImageGif />
    <RichTextBlockquote />
    <RichTextHorizontalRule />
    <RichTextCode />
    <RichTextCodeBlock />
    <RichTextColumn />
    <RichTextTable />
    <RichTextIframe />
    <RichTextExportPdf />
    <RichTextImportWord />
    <RichTextExportWord />
    <RichTextTextDirection />
    <RichTextAttachment />
    <RichTextKatex />
    <RichTextExcalidraw />
    <RichTextMermaid />
    <RichTextDrawer />
    <RichTextTwitter />
    <RichTextCodeView />
  </div>
}

function App() {
  const [content, setContent] = useState(DEFAULT)
  const [theme, setTheme] = useState('light')

  const onValueChange = useCallback(
    debounce((value: any) => {
      setContent(value)
    }, 300),
    [],
  )

  const editor = useEditor({
    // shouldRerenderOnTransaction:  false,
    textDirection: 'auto', // global text direction
    content,
    extensions,
    // content,
    // immediatelyRender: false, // error duplicate plugin key
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onValueChange(html)
    },
  });

  useEffect(() => {
    window['editor'] = editor;
  }, [editor]);

  return (
    <div
      className="p-[24px] flex flex-col w-full max-w-screen-lg gap-[24px] mx-[auto] my-0"
      style={{
        maxWidth: 1024,
        margin: '40px auto',
        }}
      >
        <Header editor={editor} setTheme={setTheme} theme={theme}/>

      <RichTextProvider editor={editor}
      dark={theme === 'dark'}
      >
        <div className="overflow-hidden rounded-[0.5rem] bg-background shadow outline outline-1">
          <div className="flex max-h-full w-full flex-col">
            <RichTextToolbar />

            <EditorContent
              editor={editor}
            />

            {/* Bubble */}
            <RichTextBubbleColumns />
            <RichTextBubbleDrawer />
            <RichTextBubbleExcalidraw />
            <RichTextBubbleIframe />
            <RichTextBubbleKatex />
            <RichTextBubbleLink />

            <RichTextBubbleImage />
            <RichTextBubbleVideo />
            <RichTextBubbleImageGif />

            <RichTextBubbleMermaid />
            <RichTextBubbleTable />
            <RichTextBubbleText />
            <RichTextBubbleTwitter />

            <RichTextBubbleMenuDragHandle />

            {/* Command List */}
            <SlashCommandList />

          </div>
        </div>
      </RichTextProvider>

      {typeof content === 'string' && (
        <textarea
          style={{
            marginTop: 20,
            height: 500,
          }}
          readOnly
          value={content}
        />
      )}
    </div>
  )
}

export default App
