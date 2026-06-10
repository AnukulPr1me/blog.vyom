'use client';
import { useEffect, useRef, useCallback } from 'react';
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Image as ImageIcon, Code, Undo, Redo, RemoveFormatting,
} from 'lucide-react';

interface Props { value: string; onChange: (v: string) => void; }

export default function RichEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Set initial content once
  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = value || '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync value from outside (e.g. loading an existing article)
  useEffect(() => {
    if (ref.current && !isInternalChange.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || '';
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    isInternalChange.current = true;
    onChange(ref.current.innerHTML);
  }, [onChange]);

  const exec = useCallback((cmd: string, val?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  }, [handleInput]);

  const insertBlock = useCallback((tag: string) => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const el = document.createElement(tag);
    el.innerHTML = sel.toString() || '&nbsp;';
    range.deleteContents();
    range.insertNode(el);
    // Move cursor after inserted element
    range.setStartAfter(el);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    handleInput();
  }, [handleInput]);

  const insertLink = useCallback(() => {
    const url = window.prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  }, [exec]);

  const insertImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      ref.current?.focus();
      const img = `<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0;" />`;
      document.execCommand('insertHTML', false, img);
      handleInput();
    }
  }, [handleInput]);

  const sep = <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 flex-shrink-0" />;

  const btn = (action: () => void, Icon: React.ElementType, label: string) => (
    <button
      type="button"
      title={label}
      onMouseDown={e => { e.preventDefault(); action(); }}
      className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
    >
      <Icon size={14} />
    </button>
  );

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {btn(() => exec('bold'),          Bold,             'Bold')}
        {btn(() => exec('italic'),        Italic,           'Italic')}
        {btn(() => exec('strikeThrough'), Strikethrough,    'Strikethrough')}
        {btn(() => exec('insertHTML', '<code style="background:#eef2ff;color:#4f46e5;padding:2px 6px;border-radius:4px;font-size:0.875em">code</code>'), Code, 'Inline Code')}
        {sep}
        {btn(() => insertBlock('h1'), Heading1, 'Heading 1')}
        {btn(() => insertBlock('h2'), Heading2, 'Heading 2')}
        {btn(() => insertBlock('h3'), Heading3, 'Heading 3')}
        {sep}
        {btn(() => exec('insertUnorderedList'),      List,         'Bullet List')}
        {btn(() => exec('insertOrderedList'),        ListOrdered,  'Numbered List')}
        {btn(() => insertBlock('blockquote'),        Quote,        'Blockquote')}
        {btn(() => exec('insertHorizontalRule'),     Minus,        'Divider')}
        {sep}
        {btn(insertLink,  LinkIcon,  'Insert Link')}
        {btn(insertImage, ImageIcon, 'Insert Image')}
        {sep}
        {btn(() => exec('removeFormat'), RemoveFormatting, 'Clear Formatting')}
        {sep}
        {btn(() => exec('undo'), Undo, 'Undo')}
        {btn(() => exec('redo'), Redo, 'Redo')}
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder="Start writing your article here…"
        className="article-body focus:outline-none px-5 py-4 min-h-96 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
      />

      {/* Word count */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 text-right">
        {value ? value.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0} words
      </div>
    </div>
  );
}
