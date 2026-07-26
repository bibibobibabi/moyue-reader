import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, ReaderSettings, TTSConfig, CloudSyncConfig, Note, Bookmark } from '@/types';

interface ReaderState {
  // 书架
  books: Book[];
  currentBookId: string | null;
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  setCurrentBook: (id: string | null) => void;

  // 阅读设置
  settings: ReaderSettings;
  updateSettings: (settings: Partial<ReaderSettings>) => void;

  // TTS
  ttsConfig: TTSConfig;
  updateTTSConfig: (config: Partial<TTSConfig>) => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;

  // 笔记
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, content: string) => void;
  removeNote: (id: string) => void;

  // 书签
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;

  // 云同步
  syncConfig: CloudSyncConfig;
  updateSyncConfig: (config: Partial<CloudSyncConfig>) => void;

  // UI
  showSidebar: boolean;
  sidebarTab: 'toc' | 'notes' | 'bookmarks' | 'settings';
  setShowSidebar: (show: boolean) => void;
  setSidebarTab: (tab: 'toc' | 'notes' | 'bookmarks' | 'settings') => void;
}

const defaultSettings: ReaderSettings = {
  fontSize: 18,
  letterSpacing: 1,
  lineHeight: 1.8,
  paragraphSpacing: 16,
  fontFamily: 'noto-serif',
  theme: 'paper',
  textColor: '#3d3d3d',
  backgroundColor: '#faf8f3',
  pageWidth: 720,
  textAlign: 'justify',
  enableAnimation: true,
  enableAutoSave: true,
  autoSaveInterval: 30,
};

const defaultTTS: TTSConfig = {
  engine: 'local',
  voice: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

const defaultSync: CloudSyncConfig = {
  enabled: false,
  provider: 'webdav',
  url: '',
  username: '',
  password: '',
  syncInterval: 300,
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      books: [],
      currentBookId: null,
      setBooks: (books) => set({ books }),
      addBook: (book) => set((state) => ({ books: [book, ...state.books] })),
      removeBook: (id) => set((state) => ({ books: state.books.filter(b => b.id !== id) })),
      updateBook: (id, updates) => set((state) => ({
        books: state.books.map(b => b.id === id ? { ...b, ...updates } : b)
      })),
      setCurrentBook: (id) => set({ currentBookId: id }),

      settings: defaultSettings,
      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

      ttsConfig: defaultTTS,
      updateTTSConfig: (c) => set((state) => ({ ttsConfig: { ...state.ttsConfig, ...c } })),
      isSpeaking: false,
      setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),

      notes: [],
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
      updateNote: (id, content) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n)
      })),
      removeNote: (id) => set((state) => ({ notes: state.notes.filter(n => n.id !== id) })),

      bookmarks: [],
      addBookmark: (bm) => set((state) => ({ bookmarks: [bm, ...state.bookmarks] })),
      removeBookmark: (id) => set((state) => ({ bookmarks: state.bookmarks.filter(b => b.id !== id) })),

      syncConfig: defaultSync,
      updateSyncConfig: (c) => set((state) => ({ syncConfig: { ...state.syncConfig, ...c } })),

      showSidebar: false,
      sidebarTab: 'toc',
      setShowSidebar: (show) => set({ showSidebar: show }),
      setSidebarTab: (tab) => set({ sidebarTab: tab }),
    }),
    {
      name: 'moyue-reader-storage',
      partialize: (state) => ({
        books: state.books,
        settings: state.settings,
        ttsConfig: state.ttsConfig,
        notes: state.notes,
        bookmarks: state.bookmarks,
        syncConfig: state.syncConfig,
      }),
    }
  )
);
