import { useState, useCallback } from 'react';
import { Plus, Search, Trash2, Clock, FileText, BookOpen, MoreVertical, Star, Tag, Filter } from 'lucide-react';
import { useReaderStore } from '@/stores/readerStore';
import { useFileParser } from '@/hooks/useFileParser';
import toast from 'react-hot-toast';
import type { Book } from '@/types';

interface BookshelfProps {
  onOpenReader: () => void;
}

export function Bookshelf({ onOpenReader }: BookshelfProps) {
  const { books, addBook, removeBook, setCurrentBook, updateBook } = useReaderStore();
  const { selectAndParseFile } = useFileParser();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'txt' | 'pdf'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'progress'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleImport = useCallback(async () => {
    const book = await selectAndParseFile();
    if (book) {
      addBook(book);
      toast.success(`已导入《${book.title}》`);
    }
  }, [addBook, selectAndParseFile]);

  const handleOpenBook = useCallback((book: Book) => {
    setCurrentBook(book.id);
    updateBook(book.id, { lastReadAt: new Date().toISOString() });
    onOpenReader();
  }, [setCurrentBook, updateBook, onOpenReader]);

  const handleDelete = useCallback((book: Book) => {
    if (confirm(`确定要删除《${book.title}》吗？`)) {
      removeBook(book.id);
      toast.success('已删除');
    }
  }, [removeBook]);

  const filteredBooks = books
    .filter((b) => {
      if (filter !== 'all' && b.fileType !== filter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime();
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'progress') {
        const pa = a.totalWords > 0 ? a.currentPosition / a.totalWords : 0;
        const pb = b.totalWords > 0 ? b.currentPosition / b.totalWords : 0;
        return pb - pa;
      }
      return 0;
    });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* 工具栏 */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleImport} className="btn-primary flex items-center gap-2 shadow-sm hover:shadow transition-shadow">
            <Plus className="w-4 h-4" />
            导入书籍
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索书名或作者..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">全部格式</option>
            <option value="txt">TXT</option>
            <option value="pdf">PDF</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="recent">最近阅读</option>
            <option value="name">书名排序</option>
            <option value="progress">阅读进度</option>
          </select>
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-2 text-sm ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-2 text-sm ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* 书籍列表 */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg text-gray-500 font-medium">书架空空如也</p>
            <p className="text-sm mt-1.5 text-gray-400">点击「导入书籍」添加你的第一本书</p>
            <p className="text-xs mt-3 text-gray-300">支持 .txt / .pdf 格式</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onOpen={() => handleOpenBook(book)}
                onDelete={() => handleDelete(book)}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBooks.map((book) => (
              <BookListItem
                key={book.id}
                book={book}
                onOpen={() => handleOpenBook(book)}
                onDelete={() => handleDelete(book)}
                formatFileSize={formatFileSize}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookCard({
  book,
  onOpen,
  onDelete,
  formatFileSize,
  formatDate,
}: {
  book: Book;
  onOpen: () => void;
  onDelete: () => void;
  formatFileSize: (b: number) => string;
  formatDate: (s: string) => string;
}) {
  const progress = book.totalWords > 0 ? Math.round((book.currentPosition / book.totalWords) * 100) : 0;

  // 根据书名生成伪随机封面色调
  const hue = book.title.charCodeAt(0) % 360;
  const gradient = `linear-gradient(135deg, hsl(${hue}, 45%, 92%) 0%, hsl(${hue}, 35%, 85%) 100%)`;

  return (
    <div 
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
      onClick={onOpen}
    >
      {/* 封面区域 */}
      <div 
        className="aspect-[3/4] flex items-center justify-center relative overflow-hidden"
        style={{ background: gradient }}
      >
        <div className="text-center px-5">
          <h3 className="text-gray-700 font-bold text-base leading-snug line-clamp-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-2">{book.author}</p>
        </div>
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-white/70 backdrop-blur-sm rounded text-gray-500 uppercase tracking-wider">
            {book.fileType}
          </span>
        </div>
        {/* 进度条 */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
            <div className="h-full bg-blue-500/80 transition-all rounded-r-full" style={{ width: `${progress}%` }} />
          </div>
        )}
        {/* 删除按钮 */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-2 left-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>

      {/* 信息区 */}
      <div className="p-3.5">
        <h3 className="font-medium text-gray-800 text-sm truncate" title={book.title}>{book.title}</h3>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(book.lastReadAt)}
          </span>
          <span>{formatFileSize(book.fileSize)}</span>
        </div>
        {progress > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-blue-600 font-medium">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BookListItem({
  book,
  onOpen,
  onDelete,
  formatFileSize,
  formatDate,
}: {
  book: Book;
  onOpen: () => void;
  onDelete: () => void;
  formatFileSize: (b: number) => string;
  formatDate: (s: string) => string;
}) {
  const progress = book.totalWords > 0 ? Math.round((book.currentPosition / book.totalWords) * 100) : 0;
  const hue = book.title.charCodeAt(0) % 360;

  return (
    <div 
      className="group flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-all cursor-pointer"
      onClick={onOpen}
    >
      <div 
        className="w-12 h-16 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, hsl(${hue}, 45%, 92%), hsl(${hue}, 35%, 85%))` }}
      >
        <FileText className="w-5 h-5 text-gray-500/60" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-800 text-sm truncate">{book.title}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span>{book.author}</span>
          <span>·</span>
          <span>{formatFileSize(book.fileSize)}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(book.lastReadAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {progress > 0 && (
          <div className="flex items-center gap-2 w-24">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-blue-600 font-medium">{progress}%</span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
