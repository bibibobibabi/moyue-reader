import { useRef, useCallback } from 'react';
import { useReaderStore } from '@/stores/readerStore';
import { getFontFamily } from '@/utils/fonts';

interface TextReaderProps {
  content: string;
}

export function TextReader({ content }: TextReaderProps) {
  const { settings, addNote, currentBookId, books } = useReaderStore();
  const book = books.find(b => b.id === currentBookId);
  const fontFamily = getFontFamily(settings.fontFamily);

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !book) return;

    const selectedText = selection.toString().trim();
    if (selectedText.length < 2) return;

    const note = {
      id: crypto.randomUUID(),
      bookId: book.id,
      position: 0,
      selectedText,
      content: '',
      color: '#fef3c7',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addNote(note);
  }, [book, addNote]);

  // 智能分段：按空行分段，保留段落结构
  const paragraphs = content.split(/\n{2,}/).filter(p => p.trim());

  return (
    <div
      className="reader-content min-h-full select-text"
      style={{
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
        letterSpacing: `${settings.letterSpacing}px`,
        fontFamily,
        color: settings.textColor,
        maxWidth: `${settings.pageWidth}px`,
        textAlign: settings.textAlign,
        paddingBottom: '30vh',
      }}
      onMouseUp={handleTextSelect}
    >
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split('\n').filter(l => l.trim());
        // 检测是否是章节标题
        const isChapter = lines.length === 1 && 
          /^(第[一二三四五六七八九十百千万\d]+[章节卷回]|Chapter\s*\d+|序章|前言|楔子|尾声|后记)/i.test(lines[0].trim());

        if (isChapter) {
          return (
            <h2 
              key={index}
              className="text-center font-bold my-8"
              style={{
                fontSize: `${settings.fontSize * 1.4}px`,
                lineHeight: settings.lineHeight,
                color: settings.textColor,
                textIndent: '0',
              }}
            >
              {lines[0].trim()}
            </h2>
          );
        }

        return (
          <div key={index} style={{ marginBottom: `${settings.paragraphSpacing}px` }}>
            {lines.map((line, li) => (
              <p
                key={li}
                style={{
                  textIndent: settings.textAlign === 'justify' ? '2em' : undefined,
                  marginBottom: li < lines.length - 1 ? `${Math.round(settings.paragraphSpacing * 0.5)}px` : '0',
                }}
              >
                {line}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
