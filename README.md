# 墨阅 Moyue Reader

一款轻量、美观、功能完善的桌面电子书阅读器，参考 iReader 和蜗牛读书设计风格。

## 功能特性

- **本地文件导入**：支持 .txt / .pdf 格式
- **TXT 精细排版**：字体大小、字间距、行间距、段间距、背景色、页面宽度、对齐方式全部可调
- **15 套精美主题**：纯白、纸张、羊皮纸、护眼绿、暖黄、薄雾蓝、樱花粉、薰衣草、薄荷、沙滩、水墨、夜间、深夜、咖啡、森林
- **双引擎语音朗读**：本地 Web Speech API（免费离线）+ 讯飞云端 TTS（高质量）
- **书架管理**：导入、搜索、筛选、排序、阅读进度可视化
- **笔记与书签**：阅读时选中文本添加高亮笔记，一键添加书签
- **阅读进度云同步**：支持 WebDAV 协议（可搭配坚果云等）
- **数据自主可控**：JSON 格式导入/导出

## 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS + Zustand
- **桌面端**：Tauri 2.0（Rust 内核）
- **数据库**：SQLite（本地持久化）
- **PDF 渲染**：pdf.js
- **语音合成**：Web Speech API + 讯飞 WebSocket TTS

## 环境要求

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install) 1.75+
- [Tauri CLI](https://tauri.app/start/prerequisites/)（可选，也可用 npx）

## 快速开始

```bash
# 1. 进入项目目录
cd moyue-reader

# 2. 安装前端依赖
npm install

# 3. 启动开发模式
npm run tauri:dev

# 4. 构建发布版本
npm run tauri:build
```

## 讯飞 TTS 接入

1. 访问 [讯飞开放平台](https://www.xfyun.cn/) 注册账号
2. 创建应用，开通「在线语音合成」服务
3. 获取 `APPID`、`APIKey`、`APISecret`
4. 在软件「设置 → 语音朗读」中填入密钥
5. 选择发音人，点击「开始朗读」

## 项目结构

```
moyue-reader/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── hooks/              # 自定义 Hooks
│   ├── stores/             # Zustand 状态管理
│   ├── utils/              # 工具函数
│   └── types/              # TypeScript 类型
├── src-tauri/              # Rust 后端
│   └── src/
│       ├── main.rs           # 入口
│       ├── commands.rs       # Tauri 命令
│       └── db.rs             # 数据库初始化
└── package.json
```

## 许可证

MIT


## 自动打包（GitHub Actions）

本项目已配置 GitHub Actions，推送代码后自动编译各平台安装包。

### 使用方法

1. Fork 本仓库或推送到你的 GitHub 仓库
2. 进入仓库的 **Actions** 标签页
3. 选择 **Build & Release** 工作流
4. 点击 **Run workflow** 手动触发，或推送一个 tag（如 `git tag v1.0.0 && git push origin v1.0.0`）自动触发
5. 等待约 10-15 分钟后，在 **Releases** 页面下载对应平台的安装包：
   - Windows: `.msi` 安装程序
   - macOS: `.dmg` 磁盘映像（支持 Intel 和 Apple Silicon）
   - Linux: `.deb` / `.AppImage`

### 使用 Pake 轻量打包（备选）

如果你只想把网页版快速打包成 App，可使用 Pake 工作流：

1. 进入 Actions → **Build with Pake**
2. 输入你的网站地址和应用名称
3. 运行后下载对应平台的安装包
