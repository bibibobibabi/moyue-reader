import { useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { basename } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import type { Book } from '@/types';

export function useFileParser() {
  const selectAndParseFile = useCallback(async (): Promise<Book | null> => {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [
        { name: '文本文件', extensions: ['txt', 'pdf', 'epub', 'md'] },
        { name: 'TXT', extensions: ['txt'] },
        { name: 'PDF', extensions: ['pdf'] },
      ],
    });

    if (!selected || Array.isArray(selected)) return null;

    const filePath = selected;
    const fileName = await basename(filePath);
    const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';

    let content = '';
    let totalWords = 0;
    let fileSize = 0;

    if (ext === 'txt') {
      const bytes = await readFile(filePath);
      fileSize = bytes.length;
      content = await invoke<string>('decode_text_file', { bytes: Array.from(bytes) });
      totalWords = content.length;
    } else if (ext === 'pdf') {
      const bytes = await readFile(filePath);
      fileSize = bytes.length;
      content = await invoke<string>('extract_pdf_text', { filePath });
      totalWords = content.length;
    }

    const book: Book = {
      id: crypto.randomUUID(),
      title: fileName.replace(/\.[^.]+$/, ''),
      author: '未知作者',
      filePath,
      fileType: ext as 'txt' | 'pdf',
      fileSize,
      totalWords,
      currentPosition: 0,
      currentChapter: 0,
      lastReadAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      tags: [],
      rating: 0,
    };

    return book;
  }, []);

  return { selectAndParseFile };
}
