# Bot Cli

一个交互式终端搜索工具，基于 DuckDuckGo 搜索引擎，支持打开链接、保存结果和 AI 摘要功能。

## 特性

- **免费使用** — 无需注册或配置 API 密钥
- **交互界面** — 输入序号即可打开链接
- **保存结果** — 支持导出 TXT 或 JSON 格式
- **AI 摘要** — 可选 AI 生成搜索结果摘要
- **终端美化** — 使用 React + Ink 构建美观的 CLI 输出

## 安装

### 全局安装（推荐）

```bash
npm install -g search-bot-cli
```

安装完成后，可以在任意目录使用 `bot-cli` 命令。

### 本地开发

```bash
git clone https://github.com/chenjiaobin/bot-cli.git
cd bot-cli
npm install
```

## 使用方式

### 全局安装后

```bash
bot-cli search "关键词"
```

### 本地开发模式

```bash
npm run dev -- search "关键词"
```

### 编译后运行

```bash
npm run build
node dist/index.js search "关键词"
```

## 交互命令

搜索完成后进入交互模式，支持以下命令：

| 输入 | 功能 |
|------|------|
| `1-10` | 打开对应编号的链接（复制到剪贴板 + 浏览器打开） |
| `/save` | 保存结果为 TXT 文件 |
| `/save json` | 保存结果为 JSON 文件 |
| `/summary` | 生成 AI 摘要（需配置 API 密钥） |
| `/clear` | 清除已生成的 AI 摘要 |
| `Esc` | 清空输入框 |
| `Ctrl+C` | 退出程序 |

## AI 摘要配置

使用 `/summary` 命令需要配置 OpenAI 兼容 API：

### 方式一：环境变量

```bash
# Linux/Mac
export OPENAI_API_KEY=你的 API 密钥
export OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，默认 OpenAI 官方

# Windows PowerShell
$env:OPENAI_API_KEY="你的 API 密钥"
$env:OPENAI_BASE_URL="https://api.openai.com/v1"
```

### 方式二：.env 文件

在项目根目录创建 `.env` 文件：

```
OPENAI_API_KEY=你的 API 密钥
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 输出示例

```
 Search results for "TypeScript"
 10 result(s) found

 [1] TypeScript: JavaScript With Syntax For Types.
 https://www.typescriptlang.org/
 TypeScript is a strongly typed programming language that builds on JavaScript...

 [2] TypeScript Tutorial - W3Schools
 https://www.w3schools.com/typescript/
 Free online TypeScript tutorial from W3Schools.com...

 输入序号 (1-10) 打开链接，或使用 /save /save json /summary /clear
 >
```

## 技术栈

- **TypeScript** — 类型安全的代码
- **Node.js** — 运行时环境
- **Commander** — CLI 参数解析
- **Ink + React** — 终端 UI 渲染
- **Cheerio** — HTML 解析
- **clipboardy** — 剪贴板操作
- **open** — 打开系统默认浏览器

## 依赖

```json
{
  "dependencies": {
    "cheerio": "^1.2.0",
    "clipboardy": "^4.0.0",
    "commander": "^14.0.3",
    "ink": "^7.0.1",
    "open": "^10.1.0",
    "react": "^19.2.5"
  },
  "devDependencies": {
    "@types/node": "^25.6.0",
    "@types/react": "^19.2.14",
    "tsx": "^4.19.0",
    "typescript": "^6.0.3"
  }
}
```

## 项目目录结构

```
Bot-Cli/
├── src/                    # 源代码目录
│   ├── components/         # React 组件
│   │   ├── SearchApp.tsx       # 主交互组件
│   │   └── SearchResults.tsx   # 搜索结果展示组件
│   ├── utils/              # 工具模块
│   │   ├── ai-summary.ts       # AI 摘要生成
│   │   ├── clipboard.ts        # 剪贴板操作
│   │   ├── opener.ts           # 浏览器打开
│   │   ├── saver.ts            # 文件保存
│   │   └── version-check.ts    # 环境检测
│   ├── index.ts            # CLI 入口
│   └── search.ts           # DuckDuckGo 搜索接口
├── dist/                   # TypeScript 编译输出（构建后生成）
├── output/                 # 保存的搜索结果文件
├── node_modules/           # npm 依赖包
├── .env                    # 环境变量配置（可选，不提交到 git）
├── .gitignore              # Git 忽略配置
├── package.json            # 项目配置和依赖
├── tsconfig.json           # TypeScript 编译配置
└── README.md               # 项目说明文档
```

### 文件夹说明

| 目录 | 作用 |
|------|------|
| `src/` | 源代码目录，存放所有 TypeScript 源码文件 |
| `components/` | React 组件，负责终端界面的渲染 |
| `utils/` | 工具函数，封装剪贴板、浏览器、AI 摘要等功能 |
| `dist/` | TypeScript 编译后的 JavaScript 文件（构建时自动生成） |
| `output/` | `/save` 命令生成的文件保存位置 |
| `node_modules/` | npm 安装的依赖包（通过 git 忽略） |

## 注意事项

1. **交互模式** 需要在真实终端中运行，不支持管道或重定向
2. **打开链接** 功能需要系统有默认浏览器
3. **剪贴板** 功能在部分 Linux 系统可能需要额外依赖（如 `xclip`）

## 许可证

ISC

---

## 免责声明与使用安全说明

### 1. API 密钥安全

- **不要将 `.env` 文件提交到版本控制系统**，该文件已添加到 `.gitignore`
- 分享代码前请删除 `.env` 文件或确保其中不包含实际 API 密钥
- 建议使用环境变量而非 `.env` 文件来管理敏感信息

### 2. 使用责任

- 本工具仅提供搜索和信息整理功能，使用者应对自己获取的信息和使用行为负责
- 搜索结果来自第三方搜索引擎，内容准确性和合法性由用户自行判断
- 使用 `/summary` 功能产生的 AI 内容由第三方服务生成，不代表开发方立场

### 3. 版权说明

- 搜索结果的所有权归属于原始内容提供方
- 本工具仅对网页标题和摘要进行展示，不存储或分发受版权保护的内容
- 用户在使用保存功能时应遵守相关网站的 Terms of Service

### 4. 免责条款

- 使用本工具过程中出现的任何数据损失、法律纠纷或其他问题，开发者不承担责任
- 使用者需自行承担因使用该工具可能产生的风险
