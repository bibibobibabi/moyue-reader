import { useState } from 'react';
import { Bookshelf } from './components/Bookshelf/Bookshelf';
import { Reader } from './components/Reader/Reader';
import { Settings } from './components/Settings/Settings';
import { useReaderStore } from './stores/readerStore';
import { Toaster } from 'react-hot-toast';

function App() {
  const [activeTab, setActiveTab] = useState<'bookshelf' | 'reader' | 'settings'>('bookshelf');
  const currentBookId = useReaderStore((s) => s.currentBookId);

  return (
    <div className="h-full w-full bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-800 tracking-wide">墨阅 Moyue</h1>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">v1.0</span>
        </div>

        <nav className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'bookshelf' as const, label: '书架' },
            { id: 'reader' as const, label: '阅读' },
            { id: 'settings' as const, label: '设置' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'reader' && !currentBookId) return;
                setActiveTab(tab.id);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              } ${tab.id === 'reader' && !currentBookId ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* 主内容区 */}
      <main className="h-[calc(100vh-3.5rem)]">
        {activeTab === 'bookshelf' && <Bookshelf onOpenReader={() => setActiveTab('reader')} />}
        {activeTab === 'reader' && <Reader />}
        {activeTab === 'settings' && <Settings />}
      </main>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
