'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, Youtube as YoutubeIcon, Undo, Redo, Code2, RemoveFormatting,
} from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface Props { value: string; onChange: (v: string) => void; }

export default function RichEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TiptapImage.configure({ inline: false }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-brand-600 dark:text-brand-400 underline' },
      }),
      Placeholder.configure({ placeholder: 'Start writing your article here…' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({ width: 840, height: 472 }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: { class: 'article-body focus:outline-none px-4 py-4 min-h-96' },
    },
  });

  // Sync external value changes (e.g. loading existing article)
  const syncContent = useCallback(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  useEffect(() => {
    syncContent();
  }, [syncContent]);

  if (!editor) return <div className="border rounded-lg h-96 animate-pulse bg-gray-50 dark:bg-gray-800" />;

  const iconBtn = (action: () => void, Icon: React.ElementType, label: string, active = false) => (
    <button type="button" title={label} onClick={action}
      className={`p-1.5 rounded transition-colors ${active
        ? 'bg-brand-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
      <Icon size={14} />
    </button>
  );

  const addImage = () => {
    const url = window.prompt('Image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };
  const addLink = () => {
    const url = window.prompt('URL:', 'https://');
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };
  const addYoutube = () => {
    const url = window.prompt('YouTube URL:');
    if (url) editor.commands.setYoutubeVideo({ src: url });
  };
  const addTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

  const sep = <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />;

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {iconBtn(() => editor.chain().focus().toggleBold().run(), Bold, 'Bold', editor.isActive('bold'))}
        {iconBtn(() => editor.chain().focus().toggleItalic().run(), Italic, 'Italic', editor.isActive('italic'))}
        {iconBtn(() => editor.chain().focus().toggleStrike().run(), Strikethrough, 'Strike', editor.isActive('strike'))}
        {iconBtn(() => editor.chain().focus().toggleCode().run(), Code, 'Inline Code', editor.isActive('code'))}
        {sep}
        {iconBtn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), Heading1, 'H1', editor.isActive('heading', { level: 1 }))}
        {iconBtn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), Heading2, 'H2', editor.isActive('heading', { level: 2 }))}
        {iconBtn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3, 'H3', editor.isActive('heading', { level: 3 }))}
        {sep}
        {iconBtn(() => editor.chain().focus().toggleBulletList().run(), List, 'Bullet List', editor.isActive('bulletList'))}
        {iconBtn(() => editor.chain().focus().toggleOrderedList().run(), ListOrdered, 'Ordered List', editor.isActive('orderedList'))}
        {iconBtn(() => editor.chain().focus().toggleBlockquote().run(), Quote, 'Blockquote', editor.isActive('blockquote'))}
        {iconBtn(() => editor.chain().focus().toggleCodeBlock().run(), Code2, 'Code Block', editor.isActive('codeBlock'))}
        {iconBtn(() => editor.chain().focus().setHorizontalRule().run(), Minus, 'Divider')}
        {sep}
        {iconBtn(addLink, LinkIcon, 'Add Link', editor.isActive('link'))}
        {iconBtn(addImage, ImageIcon, 'Add Image')}
        {iconBtn(addYoutube, YoutubeIcon, 'Embed YouTube')}
        {iconBtn(addTable, TableIcon, 'Insert Table')}
        {sep}
        {iconBtn(() => editor.chain().focus().unsetAllMarks().clearNodes().run(), RemoveFormatting, 'Clear Formatting')}
        {sep}
        {iconBtn(() => editor.chain().focus().undo().run(), Undo, 'Undo')}
        {iconBtn(() => editor.chain().focus().redo().run(), Redo, 'Redo')}
      </div>

      <EditorContent editor={editor} />

      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 text-right">
        {editor.getText().split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
}
