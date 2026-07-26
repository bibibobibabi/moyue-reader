import { useState, useRef, useEffect } from 'react';
import { List, Bookmark, StickyNote, Settings, X, ChevronRight, Type, Palette, Layout, Cloud, Save, Plus } from 'lucide-react';
import { useReaderStore } from '@/stores/readerStore';
import { themePresets } from '@/utils/themes';
import { builtinFonts } from '@/utils/fonts';
import toast from 'react-hot-toast';

interface SidebarProps {
  chapters: { title: string; position: number }[];
  contentRef: React.RefObject<HTMLDivElement>;
}

export function Sidebar({ chapters, contentRef }: SidebarProps) {
  const { showSidebar, sidebarTab, setShowSidebar, setSidebarTab, settings, updateSettings, notes, bookmarks, removeNote, removeBookmark, addBookmark, currentBookId, books } = useReaderStore();
  const book = books.find(b => b.id === currentBookId);

  if (!showSidebar) return null;

  const tabs = [
    { id: 'toc' as const, label: '目录', icon: List },
    { id: 'notes' as const, label: '笔记', icon: StickyNote },
    { id: 'bookmarks' as const, label: '书签', icon: Bookmark },
    { id: 'settings' as const, label: '设置', icon: Settings },
  ];

  const jumpToPosition = (position: number) => {
    if (contentRef.current && book) {
      const ratio = position / (book.totalWords || 1);
      contentRef.current.scrollTop = ratio * contentRef.current.scrollHeight;
    }
  };

  const handleAddBookmark = () => {
    if (!book) return;
    const currentChapter = chapters.find(c => c.position <= book.currentPosition);
    const bm = {
      id: crypto.randomUUID(),
      bookId: book.id,
      position: book.currentPosition,
      chapterTitle: currentChapter?.title || `位置 ${Math.round(book.currentPosition / book.totalWords * 100)}%`,
      createdAt: new Date().toISOString(),
    };
    addBookmark(bm);
    toast.success('书签已添加');
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10 shadow-sm">
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-all ${sidebarTab === tab.id ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/30 font-medium' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {sidebarTab === 'toc' && (
          <div className="space-y-0.5">
            {chapters.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">暂无目录</p>
            ) : (
              chapters.map((ch, i) => (
                <button
                  key={i}
                  onClick={() => jumpToPosition(ch.position)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors truncate"
                >
                  {ch.title}
                </button>
              ))
            )}
          </div>
        )}

        {sidebarTab === 'notes' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-400 text-center py-2 bg-gray-50 rounded-lg">
              阅读时选中文本即可添加笔记
            </div>
            {notes.filter(n => n.bookId === currentBookId).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">暂无笔记</p>
            ) : (
              notes.filter(n => n.bookId === currentBookId).map(note => (
                <div key={note.id} className="bg-yellow-50 border border-yellow-100 rounded-xl p-3.5">
                  <p className="text-xs text-yellow-900 font-medium mb-2 line-clamp-2 leading-relaxed">「{note.selectedText}」</p>
                  {note.content && <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{note.content}</p>}
                  <div className="flex justify-end mt-2.5 gap-2">
                    <button onClick={() => removeNote(note.id)} className="text-[10px] text-gray-400 hover:text-red-500">删除</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {sidebarTab === 'bookmarks' && (
          <div className="space-y-3">
            <button
              onClick={handleAddBookmark}
              className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> 添加当前位置书签
            </button>
            {bookmarks.filter(b => b.bookId === currentBookId).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">暂无书签</p>
            ) : (
              bookmarks.filter(b => b.bookId === currentBookId).map(bm => (
                <div key={bm.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                  <button onClick={() => jumpToPosition(bm.position)} className="text-sm text-gray-700 truncate flex-1 text-left font-medium">
                    {bm.chapterTitle}
                  </button>
                  <button onClick={() => removeBookmark(bm.id)} className="text-gray-400 hover:text-red-500 ml-2 p-1 rounded hover:bg-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {sidebarTab === 'settings' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium flex items-center gap-1"><Type className="w-3 h-3"/> 字体大小</label>
              <input type="range" min="12" max="32" value={settings.fontSize} onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })} className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full appearance-none"/>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>A</span><span className="text-gray-600 font-medium">{settings.fontSize}px</span><span className="text-base">A</span></div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">字间距</label>
              <input type="range" min="0" max="8" value={settings.letterSpacing} onChange={(e) => updateSettings({ letterSpacing: parseInt(e.target.value) })} className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full appearance-none"/>
              <div className="text-[10px] text-gray-500 mt-1 text-center">{settings.letterSpacing}px</div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">行间距</label>
              <input type="range" min="1.2" max="3" step="0.1" value={settings.lineHeight} onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })} className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full appearance-none"/>
              <div className="text-[10px] text-gray-500 mt-1 text-center">{settings.lineHeight}</div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">段间距</label>
              <input type="range" min="8" max="32" value={settings.paragraphSpacing} onChange={(e) => updateSettings({ paragraphSpacing: parseInt(e.target.value) })} className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full appearance-none"/>
              <div className="text-[10px] text-gray-500 mt-1 text-center">{settings.paragraphSpacing}px</div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">字体</label>
              <select value={settings.fontFamily} onChange={(e) => updateSettings({ fontFamily: e.target.value })} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                {builtinFonts.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium flex items-center gap-1"><Palette className="w-3 h-3"/> 阅读主题（{themePresets.length}套）</label>
              <div className="grid grid-cols-5 gap-2">
                {themePresets.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => updateSettings({ theme: theme.id, backgroundColor: theme.backgroundColor, textColor: theme.textColor })}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${settings.theme === theme.id ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: theme.backgroundColor }}
                    title={`${theme.name}${theme.description ? ' — ' + theme.description : ''}`}
                  />
                ))}
              </div>
              <div className="mt-2 text-[10px] text-gray-400 text-center">
                当前：{themePresets.find(t => t.id === settings.theme)?.name}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">页面宽度</label>
              <input type="range" min="480" max="960" step="40" value={settings.pageWidth} onChange={(e) => updateSettings({ pageWidth: parseInt(e.target.value) })} className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full appearance-none"/>
              <div className="text-[10px] text-gray-500 mt-1 text-center">{settings.pageWidth}px</div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">对齐方式</label>
              <div className="flex gap-2">
                {(['left', 'justify', 'center'] as const).map(align => (
                  <button key={align} onClick={() => updateSettings({ textAlign: align })} className={`flex-1 py-1.5 rounded-lg text-xs transition-colors border ${settings.textAlign === align ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {align === 'left' ? '左对齐' : align === 'justify' ? '两端对齐' : '居中'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
