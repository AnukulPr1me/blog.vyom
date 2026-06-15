'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Image as ImageIcon, Video, Code, Undo, Redo, RemoveFormatting,
} from 'lucide-react';
import { parseVideoUrl } from '@/lib/utils';

interface Props { value: string; onChange: (v: string) => void; }

const IMAGE_SIZES = [
  { label: 'Small',  className: 'img-sm'  },
  { label: 'Medium', className: 'img-md'  },
  { label: 'Large',  className: 'img-lg'  },
  { label: 'Full width', className: 'img-full' },
] as const;

export default function RichEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaSize, setMediaSize] = useState<string>('img-md');
  const savedRangeRef = useRef<Range | null>(null);

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

  // Save the current cursor position before opening the modal, so we can
  // restore it and insert media at the right spot.
  const openMediaModal = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    setMediaUrl('');
    setMediaSize('img-md');
    setMediaModalOpen(true);
  }, []);

  const insertMedia = useCallback(() => {
    const url = mediaUrl.trim();
    if (!url) { setMediaModalOpen(false); return; }

    ref.current?.focus();

    // Restore cursor position
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }

    const video = parseVideoUrl(url);
    let html: string;

    if (video) {
      if (video.type === 'file') {
        html = `<video controls class="article-video" src="${video.embedUrl}"></video>`;
      } else {
        html = `<div class="article-video-wrapper"><iframe src="${video.embedUrl}" allowfullscreen loading="lazy"></iframe></div>`;
      }
    } else {
      // eslint-disable-next-line @next/next/no-img-element
      html = `<img src="${url}" alt="" class="${mediaSize}" loading="lazy" />`;
    }

    document.execCommand('insertHTML', false, html);
    handleInput();
    setMediaModalOpen(false);
  }, [mediaUrl, mediaSize, handleInput]);

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
    <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900 relative">
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
        {btn(insertLink, LinkIcon, 'Insert Link')}
        {btn(openMediaModal, ImageIcon, 'Insert Image or Video')}
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

      {/* Media insert modal */}
      {mediaModalOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-5 mx-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
              <ImageIcon size={16} className="text-indigo-500" />
              Insert Image or Video
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Paste an image URL, or a YouTube/Vimeo/video link — it&apos;s detected automatically.
            </p>

            <input
              autoFocus
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') insertMedia(); if (e.key === 'Escape') setMediaModalOpen(false); }}
              placeholder="https://example.com/image.jpg or https://youtube.com/watch?v=..."
              className="input text-sm mb-4"
            />

            {/* Only show size options if it doesn't look like a video URL */}
            {!parseVideoUrl(mediaUrl) && (
              <div className="mb-4">
                <p className="label mb-2">Image Size</p>
                <div className="flex gap-2 flex-wrap">
                  {IMAGE_SIZES.map(s => (
                    <button
                      key={s.className}
                      type="button"
                      onClick={() => setMediaSize(s.className)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        mediaSize === s.className
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {parseVideoUrl(mediaUrl) && (
              <div className="mb-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                <Video size={13} />
                Video detected — will embed as a responsive player
              </div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => setMediaModalOpen(false)} className="btn-secondary flex-1 text-sm py-2">
                Cancel
              </button>
              <button type="button" onClick={insertMedia} className="btn-primary flex-1 text-sm py-2">
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
