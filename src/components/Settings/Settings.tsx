import { useState } from 'react';
import { Cloud, Database, Palette, Volume2, Globe, Save, Check, AlertCircle, Trash2, Download, Upload, BookOpen } from 'lucide-react';
import { useReaderStore } from '@/stores/readerStore';
import toast from 'react-hot-toast';

export function Settings() {
  const { ttsConfig, updateTTSConfig, syncConfig, updateSyncConfig, settings, updateSettings, books, notes, bookmarks } = useReaderStore();
  const [activeSection, setActiveSection] = useState<'general' | 'tts' | 'sync' | 'data'>('general');
  const [saved, setSaved] = useState(false);

  const sections = [
    { id: 'general' as const, label: '通用设置', icon: Palette },
    { id: 'tts' as const, label: '语音朗读', icon: Volume2 },
    { id: 'sync' as const, label: '云同步', icon: Cloud },
    { id: 'data' as const, label: '数据管理', icon: Database },
  ];

  const exportData = () => {
    const data = { books, notes, bookmarks, settings, ttsConfig, syncConfig, exportAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moyue-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('数据已导出');
  };

  return (
    <div className="h-full flex bg-gray-50">
      <div className="w-56 bg-white border-r border-gray-200 py-4">
        {sections.map((section) => (
          <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${activeSection === section.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          {activeSection === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">通用设置</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">自动保存阅读进度</h3>
                    <p className="text-sm text-gray-500">定期自动保存当前阅读位置</p>
                  </div>
                  <button onClick={() => updateSettings({ enableAutoSave: !settings.enableAutoSave })} className={`w-12 h-6 rounded-full transition-colors ${settings.enableAutoSave ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.enableAutoSave ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                {settings.enableAutoSave && (
                  <div>
                    <label className="text-sm text-gray-600">自动保存间隔（秒）</label>
                    <input type="range" min="10" max="300" step="10" value={settings.autoSaveInterval} onChange={(e) => updateSettings({ autoSaveInterval: parseInt(e.target.value) })} className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full appearance-none mt-2"/>
                    <div className="text-sm text-gray-500 mt-1">{settings.autoSaveInterval} 秒</div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <h3 className="font-medium text-gray-800">翻页动画</h3>
                    <p className="text-sm text-gray-500">启用平滑滚动效果</p>
                  </div>
                  <button onClick={() => updateSettings({ enableAnimation: !settings.enableAnimation })} className={`w-12 h-6 rounded-full transition-colors ${settings.enableAnimation ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.enableAnimation ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'tts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">语音朗读设置</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">讯飞云端语音（推荐）</h3>
                  <p className="text-sm text-gray-500 mb-4">前往 <a href="https://www.xfyun.cn/" target="_blank" className="text-blue-600 hover:underline">讯飞开放平台</a> 注册并获取API密钥</p>
                  <div className="space-y-3">
                    <div><label className="text-sm text-gray-600">APP ID</label><input type="text" value={ttsConfig.xunfeiAppId || ''} onChange={(e) => updateTTSConfig({ xunfeiAppId: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="输入讯飞 APP ID"/></div>
                    <div><label className="text-sm text-gray-600">API Key</label><input type="password" value={ttsConfig.xunfeiApiKey || ''} onChange={(e) => updateTTSConfig({ xunfeiApiKey: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="输入 API Key"/></div>
                    <div><label className="text-sm text-gray-600">API Secret</label><input type="password" value={ttsConfig.xunfeiApiSecret || ''} onChange={(e) => updateTTSConfig({ xunfeiApiSecret: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="输入 API Secret"/></div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-medium text-gray-800 mb-3">默认朗读引擎</h3>
                  <div className="flex gap-3">
                    <button onClick={() => updateTTSConfig({ engine: 'local' })} className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${ttsConfig.engine === 'local' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>本地语音（免费）</button>
                    <button onClick={() => updateTTSConfig({ engine: 'xunfei' })} className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${ttsConfig.engine === 'xunfei' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}>讯飞云端（高质量）</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'sync' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">云同步</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">启用云同步</h3>
                    <p className="text-sm text-gray-500">将阅读进度、笔记、书签同步到云端</p>
                  </div>
                  <button onClick={() => updateSyncConfig({ enabled: !syncConfig.enabled })} className={`w-12 h-6 rounded-full transition-colors ${syncConfig.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${syncConfig.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                {syncConfig.enabled && (
                  <>
                    <div><label className="text-sm text-gray-600">同步方式</label><select value={syncConfig.provider} onChange={(e) => updateSyncConfig({ provider: e.target.value as any })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"><option value="webdav">WebDAV</option><option value="custom">自定义服务器</option></select></div>
                    <div><label className="text-sm text-gray-600">服务器地址</label><input type="text" value={syncConfig.url} onChange={(e) => updateSyncConfig({ url: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="https://..."/></div>
                    <div className="grid grid-cols-2 gap-3"><div><label className="text-sm text-gray-600">用户名</label><input type="text" value={syncConfig.username} onChange={(e) => updateSyncConfig({ username: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div><div><label className="text-sm text-gray-600">密码</label><input type="password" value={syncConfig.password} onChange={(e) => updateSyncConfig({ password: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div></div>
                    <button className="btn-primary w-full flex items-center justify-center gap-2"><Cloud className="w-4 h-4"/> 立即同步</button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">数据管理</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div><h3 className="font-medium text-gray-800">导出数据</h3><p className="text-sm text-gray-500">将所有书籍、笔记、书签导出为 JSON 文件</p></div>
                  <button onClick={exportData} className="btn-secondary flex items-center gap-2"><Download className="w-4 h-4"/> 导出</button>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div><h3 className="font-medium text-gray-800">导入数据</h3><p className="text-sm text-gray-500">从 JSON 文件恢复数据</p></div>
                  <button className="btn-secondary flex items-center gap-2"><Upload className="w-4 h-4"/> 导入</button>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div><h3 className="font-medium text-red-600">清除所有数据</h3><p className="text-sm text-gray-500">删除所有书籍、笔记和设置（不可恢复）</p></div>
                  <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors">清除</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
