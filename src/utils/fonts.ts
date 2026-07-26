import type { FontOption } from '@/types';

export const builtinFonts: FontOption[] = [
  { id: 'noto-serif', name: '思源宋体', family: "'Noto Serif SC', 'Source Han Serif CN', serif", category: 'serif', builtin: true },
  { id: 'noto-sans', name: '思源黑体', family: "'Noto Sans SC', 'Source Han Sans CN', sans-serif", category: 'sans', builtin: true },
  { id: 'system-song', name: '宋体', family: "'SimSun', 'STSong', 'Songti SC', serif", category: 'serif', builtin: true },
  { id: 'system-hei', name: '黑体', family: "'SimHei', 'Microsoft YaHei', 'Heiti SC', sans-serif", category: 'sans', builtin: true },
  { id: 'system-kai', name: '楷体', family: "'KaiTi', 'STKaiti', 'Kaiti SC', serif", category: 'serif', builtin: true },
  { id: 'system-fang', name: '仿宋', family: "'FangSong', 'STFangsong', 'Fangsong SC', serif", category: 'serif', builtin: true },
  { id: 'georgia', name: 'Georgia', family: "Georgia, 'Times New Roman', serif", category: 'serif', builtin: true },
  { id: 'arial', name: 'Arial', family: "Arial, Helvetica, 'PingFang SC', sans-serif", category: 'sans', builtin: true },
  { id: 'consolas', name: 'Consolas', family: "Consolas, 'Courier New', 'Noto Sans SC', monospace", category: 'mono', builtin: true },
];

export function getFontById(id: string): FontOption | undefined {
  return builtinFonts.find(f => f.id === id);
}

export function getFontFamily(id: string): string {
  return getFontById(id)?.family || builtinFonts[0].family;
}
