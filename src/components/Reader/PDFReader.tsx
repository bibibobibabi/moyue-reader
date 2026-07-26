import { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useReaderStore } from '@/stores/readerStore';
import { convertFileSrc } from '@tauri-apps/api/core';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFReaderProps {
  filePath: string;
}

export function PDFReader({ filePath }: PDFReaderProps) {
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const { settings } = useReaderStore();

  useEffect(() => {
    setPdfUrl(convertFileSrc(filePath));
  }, [filePath]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (!pdfUrl) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto flex flex-col items-center py-8"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        }
        error={
          <div className="text-red-500 p-8 text-center">
            <p>PDF 加载失败</p>
            <p className="text-sm mt-2 text-gray-500">请确保文件路径正确</p>
          </div>
        }
      >
        {Array.from(new Array(numPages), (_, index) => (
          <div key={`page_${index + 1}`} className="mb-4 shadow-lg">
            <Page
              pageNumber={index + 1}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer
              className="bg-white"
            />
          </div>
        ))}
      </Document>

      {numPages > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-full flex items-center gap-4 text-sm shadow-xl">
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 font-bold"
          >
            −
          </button>
          <span className="text-gray-600 text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(3, s + 0.1))}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 font-bold"
          >
            +
          </button>
          <div className="w-px h-4 bg-gray-300" />
          <span className="text-gray-500 text-xs">{numPages} 页</span>
        </div>
      )}
    </div>
  );
}
