export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  filePath: string;
  fileType: 'txt' | 'pdf';
  fileSize: number;
  totalWords: number;
  currentPosition: number;
  currentChapter: number;
  lastReadAt: string;
  createdAt: string;
  tags: string[];
  rating: number;
  description?: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  startPosition: number;
  endPosition: number;
  level: number;
}

export interface Note {
  id: string;
  bookId: string;
  chapterId?: string;
  position: number;
  selectedText: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  position: number;
  chapterTitle: string;
  createdAt: string;
}

export interface ReaderSettings {
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  paragraphSpacing: number;
  fontFamily: string;
  theme: string;
  textColor: string;
  backgroundColor: string;
  pageWidth: number;
  textAlign: 'left' | 'justify' | 'center';
  enableAnimation: boolean;
  enableAutoSave: boolean;
  autoSaveInterval: number;
}

export interface TTSConfig {
  engine: 'local' | 'xunfei' | 'aliyun';
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  xunfeiAppId?: string;
  xunfeiApiKey?: string;
  xunfeiApiSecret?: string;
  aliyunApiKey?: string;
}

export interface CloudSyncConfig {
  enabled: boolean;
  provider: 'webdav' | 'custom';
  url: string;
  username: string;
  password: string;
  syncInterval: number;
  lastSyncAt?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  isDark: boolean;
  description?: string;
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'serif' | 'sans' | 'mono' | 'custom';
  builtin: boolean;
  path?: string;
}
