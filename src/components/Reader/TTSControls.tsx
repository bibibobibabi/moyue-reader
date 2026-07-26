import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Mic, Globe, ChevronDown, Headphones, X, Sparkles } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';
import { useReaderStore } from '@/stores/readerStore';

interface TTSControlsProps {
  content: string;
}

export function TTSControls({ content }: TTSControlsProps) {
  const { speak, stop, pause, resume, isSpeaking, localVoices } = useTTS();
  const { ttsConfig, updateTTSConfig } = useReaderStore();
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭面板
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    }
    if (showPanel) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPanel]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      if (!content.trim()) {
        return;
      }
      speak(content);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`p-2 rounded-lg transition-all ${
          isSpeaking 
            ? 'text-blue-600 bg-blue-50 animate-pulse' 
            : 'text-gray-500 hover:bg-black/5'
        }`}
        title="语音朗读"
      >
        <Headphones className="w-4 h-4" />
      </button>

      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-5 z-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-sm text-gray-800">语音朗读</h3>
            </div>
            <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 引擎选择 */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-2 block font-medium">朗读引擎</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateTTSConfig({ engine: 'local' })}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all border ${
                  ttsConfig.engine === 'local' 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mic className="w-3 h-3 inline mr-1 mb-0.5" />
                本地免费
              </button>
              <button
                onClick={() => updateTTSConfig({ engine: 'xunfei' })}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all border ${
                  ttsConfig.engine === 'xunfei' 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Globe className="w-3 h-3 inline mr-1 mb-0.5" />
                讯飞云端
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              {ttsConfig.engine === 'local' 
                ? '使用系统内置语音，无需网络，完全免费' 
                : '讯飞高质量语音合成，需配置API密钥'}
            </p>
          </div>

          {/* 本地语音选择 */}
          {ttsConfig.engine === 'local' && (
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1.5 block">选择语音</label>
              <select
                value={ttsConfig.voice}
                onChange={(e) => updateTTSConfig({ voice: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50"
              >
                <optgroup label="中文语音">
                  {localVoices.filter(v => v.lang.includes('zh')).map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </optgroup>
                <optgroup label="其他语音">
                  {localVoices.filter(v => !v.lang.includes('zh')).slice(0, 8).map(v => (
                    <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* 讯飞配置 */}
          {ttsConfig.engine === 'xunfei' && (
            <div className="mb-4 space-y-2.5">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 mb-3">
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  前往 <a href="https://www.xfyun.cn/" target="_blank" className="underline font-medium">讯飞开放平台</a> 注册获取 API 密钥
                </p>
              </div>
              <input
                type="text"
                placeholder="讯飞 APPID"
                value={ttsConfig.xunfeiAppId || ''}
                onChange={(e) => updateTTSConfig({ xunfeiAppId: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50"
              />
              <input
                type="password"
                placeholder="API Key"
                value={ttsConfig.xunfeiApiKey || ''}
                onChange={(e) => updateTTSConfig({ xunfeiApiKey: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50"
              />
              <input
                type="password"
                placeholder="API Secret"
                value={ttsConfig.xunfeiApiSecret || ''}
                onChange={(e) => updateTTSConfig({ xunfeiApiSecret: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50"
              />
              <select
                value={ttsConfig.voice}
                onChange={(e) => updateTTSConfig({ voice: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50"
              >
                <option value="xiaoyan">小燕 — 标准女声</option>
                <option value="xiaoyu">小宇 — 标准男声</option>
                <option value="xiaomei">小美 — 甜美女声</option>
                <option value="xiaoqi">小琪 — 知性女声</option>
                <option value="xiaowang">小王 — 磁性男声</option>
                <option value="xiaoxin">小新 — 活泼童声</option>
              </select>
            </div>
          )}

          {/* 语速 */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>语速</span>
              <span className="font-medium text-gray-700">{ttsConfig.rate}x</span>
            </div>
            <input
              type="range" min="0.5" max="2" step="0.1"
              value={ttsConfig.rate}
              onChange={(e) => updateTTSConfig({ rate: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full appearance-none"
            />
          </div>

          {/* 音调 */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>音调</span>
              <span className="font-medium text-gray-700">{ttsConfig.pitch}x</span>
            </div>
            <input
              type="range" min="0.5" max="2" step="0.1"
              value={ttsConfig.pitch}
              onChange={(e) => updateTTSConfig({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-full appearance-none"
            />
          </div>

          {/* 控制按钮 */}
          <button
            onClick={handleSpeak}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              isSpeaking 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isSpeaking ? (
              <><Square className="w-4 h-4" /> 停止朗读</>
            ) : (
              <><Play className="w-4 h-4" /> 开始朗读</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
