import type { ThemePreset } from '@/types';

// 参考 iReader + 蜗牛读书风格设计的 12 套精美主题
export const themePresets: ThemePreset[] = [
  // === 经典系列（iReader 风格）===
  {
    id: 'light',
    name: '纯白',
    backgroundColor: '#ffffff',
    textColor: '#2c2c2c',
    accentColor: '#3b82f6',
    isDark: false,
    description: '清爽简洁，适合日间阅读',
  },
  {
    id: 'paper',
    name: '纸张',
    backgroundColor: '#faf8f3',
    textColor: '#3d3d3d',
    accentColor: '#8b6914',
    isDark: false,
    description: '仿纸质书页，温暖舒适',
  },
  {
    id: 'sepia',
    name: '羊皮纸',
    backgroundColor: '#f4ecd8',
    textColor: '#5d4037',
    accentColor: '#8b6914',
    isDark: false,
    description: '复古羊皮纸质感',
  },
  {
    id: 'green',
    name: '护眼绿',
    backgroundColor: '#c7edcc',
    textColor: '#2c3e50',
    accentColor: '#27ae60',
    isDark: false,
    description: '经典护眼模式',
  },
  {
    id: 'warm',
    name: '暖黄',
    backgroundColor: '#fff3e0',
    textColor: '#5d4037',
    accentColor: '#e65100',
    isDark: false,
    description: '午后阳光般温暖',
  },

  // === 蜗牛读书文艺系列 ===
  {
    id: 'mist',
    name: '薄雾蓝',
    backgroundColor: '#e8f4f8',
    textColor: '#2c3e50',
    accentColor: '#3498db',
    isDark: false,
    description: '清晨薄雾，宁静悠远',
  },
  {
    id: 'sakura',
    name: '樱花粉',
    backgroundColor: '#fdf2f4',
    textColor: '#4a3b3b',
    accentColor: '#e91e63',
    isDark: false,
    description: '温柔粉色，浪漫阅读',
  },
  {
    id: 'lavender',
    name: '薰衣草',
    backgroundColor: '#f3e8ff',
    textColor: '#3d2b4f',
    accentColor: '#7c3aed',
    isDark: false,
    description: '淡紫幽香，安神静心',
  },
  {
    id: 'mint',
    name: '薄荷',
    backgroundColor: '#e0f7fa',
    textColor: '#263238',
    accentColor: '#00acc1',
    isDark: false,
    description: '清新薄荷，提神醒脑',
  },
  {
    id: 'sand',
    name: '沙滩',
    backgroundColor: '#faf0e6',
    textColor: '#4a3728',
    accentColor: '#d4a373',
    isDark: false,
    description: '海边沙滩，悠然自得',
  },
  {
    id: 'ink',
    name: '水墨',
    backgroundColor: '#f5f5f0',
    textColor: '#1a1a1a',
    accentColor: '#8b0000',
    isDark: false,
    description: '东方水墨，书卷气息',
  },

  // === 夜间系列 ===
  {
    id: 'dark',
    name: '夜间',
    backgroundColor: '#1a1a2e',
    textColor: '#c0c0c0',
    accentColor: '#60a5fa',
    isDark: true,
    description: '深色模式，保护双眼',
  },
  {
    id: 'midnight',
    name: '深夜',
    backgroundColor: '#0f0f1a',
    textColor: '#a0aec0',
    accentColor: '#818cf8',
    isDark: true,
    description: '极致暗色，深夜伴侣',
  },
  {
    id: 'coffee',
    name: '咖啡',
    backgroundColor: '#2d2420',
    textColor: '#d4c5b5',
    accentColor: '#a67c52',
    isDark: true,
    description: '咖啡色调，沉稳深邃',
  },
  {
    id: 'forest',
    name: '森林',
    backgroundColor: '#1b2e1b',
    textColor: '#b8d4b8',
    accentColor: '#4caf50',
    isDark: true,
    description: '森林夜色，静谧深邃',
  },
];

export function getThemeById(id: string): ThemePreset | undefined {
  return themePresets.find(t => t.id === id);
}
