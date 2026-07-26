import { useEffect, useRef, useState, useCallback } from 'react';
import { useReaderStore } from '@/stores/readerStore';
import { invoke } from '@tauri-apps/api/core';
import { TextReader } from './TextReader';
import { PDFReader } from './PDFReader';
import { TTSControls } from './TTSControls';
import { Sidebar } from './Sidebar';
import { Menu, ChevronLeft, Headphones, Bookmark, Highlighter, Type, Moon, Sun, BookOpen } from 'lucide-react';
import { getThemeById } from '@/utils/themes';
import toast from 'react-hot-toast';

export function Reader() {
  const { currentBookId, books, settings, updateBook, updateSettings, showSidebar, setShowSidebar, setSidebarTab } = useReaderStore();
  const [content, setContent] = useState('');
  const [chapters, setChapters] = useState<{ title: string; position: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const book = books.find((b) => b.id === currentBookId);

  // 加载书籍内容
  useEffect(() => {
    if (!book) return;

    const loadContent = async () => {
      setIsLoading(true);
      try {
        if (book.fileType === 'txt') {
          const text = await invoke<string>('read_text_file', { filePath: book.filePath });
          setContent(text);
          const chs = extractChapters(text);
          setChapters(chs);
        } else if (book.fileType === 'pdf') {
          setContent('');
        }
      } catch (err) {
        console.error('加载失败:', err);
        toast.error('书籍加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [book]);

  // 自动保存阅读进度
  useEffect(() => {
    if (!book || !settings.enableAutoSave) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      return;
    }

    autoSaveTimerRef.current = setInterval(() => {
      if (contentRef.current && book.fileType === 'txt') {
        const scrollTop = contentRef.current.scrollTop;
        const scrollHeight = contentRef.current.scrollHeight;
        const position = Math.round((scrollTop / scrollHeight) * book.totalWords);
        updateBook(book.id, { 
          currentPosition: Math.min(position, book.totalWords),
          lastReadAt: new Date().toISOString()
        });
      }
    }, settings.autoSaveInterval * 1000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [book, settings.enableAutoSave, settings.autoSaveInterval, updateBook]);

  // 恢复阅读位置
  useEffect(() => {
    if (!book || !contentRef.current || !content || book.fileType !== 'txt') return;
    if (book.currentPosition > 0 && book.totalWords > 0) {
      requestAnimationFrame(() => {
        if (contentRef.current) {
          const ratio = Math.min(book.currentPosition / book.totalWords, 1);
          contentRef.current.scrollTop = ratio * contentRef.current.scrollHeight;
        }
      });
    }
  }, [book, content]);

  const handleScroll = useCallback(() => {
    if (!contentRef.current || !book || book.fileType !== 'txt') return;
    const ratio = contentRef.current.scrollTop / contentRef.current.scrollHeight;
    const position = Math.round(ratio * book.totalWords);
    updateBook(book.id, { currentPosition: position });
  }, [book, updateBook]);

  const theme = getThemeById(settings.theme);
  const isDark = theme?.isDark || false;

  if (!book) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: settings.backgroundColor }}>
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg">请先选择一本书</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex relative" style={{ backgroundColor: settings.backgroundColor }}>
      {/* 侧边栏 */}
      <Sidebar chapters={chapters} contentRef={contentRef} />

      {/* 主阅读区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 阅读器工具栏 */}
        <div 
          className="h-12 flex items-center justify-between px-4 border-b shrink-0 transition-colors"
          style={{ 
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            backgroundColor: settings.backgroundColor 
          }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-500'}`}
            >
              <Menu className="w-4 h-4" />
            </button>
            <span 
              className={`text-sm font-medium truncate max-w-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              {book.title}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setSidebarTab('notes')}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-500'}`}
              title="笔记"
            >
              <Highlighter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSidebarTab('bookmarks')}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-500'}`}
              title="书签"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSidebarTab('settings')}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-500'}`}
              title="阅读设置"
            >
              <Type className="w-4 h-4" />
            </button>
            <div className={`w-px h-4 mx-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <TTSControls content={content} />
          </div>
        </div>

        {/* 内容区 */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scroll-smooth"
          style={{ backgroundColor: settings.backgroundColor }}
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : book.fileType === 'txt' ? (
            <TextReader content={content} />
          ) : (
            <PDFReader filePath={book.filePath} />
          )}
        </div>

        {/* 底部进度条 */}
        <div 
          className="h-1 w-full shrink-0 transition-colors"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
        >
          <div
            className="h-full bg-blue-500/70 transition-all duration-500 ease-out rounded-r-full"
            style={{ width: `${book.totalWords > 0 ? Math.min((book.currentPosition / book.totalWords) * 100, 100) : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// 提取章节
function extractChapters(text: string): { title: string; position: number }[] {
  const chapters: { title: string; position: number }[] = [];
  const lines = text.split('\n');
  const chapterRegex = /^(第[一二三四五六七八九十百千万\d]+[章节卷回]|Chapter\s*\d+|\d+\.\s*[^\s]|序章|前言|引言|楔子|尾声|后记|附录)/i;

  let position = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (chapterRegex.test(trimmed) && trimmed.length < 50) {
      chapters.push({ title: trimmed, position });
    }
    position += line.length + 1;
  }

  // 如果没有检测到章节，按固定字数分段
  if (chapters.length === 0) {
    const segmentSize = 8000;
    for (let i = 0; i < text.length; i += segmentSize) {
      chapters.push({
        title: `第${Math.floor(i / segmentSize) + 1}章`,
        position: i,
      });
    }
  }

  return chapters;
}
