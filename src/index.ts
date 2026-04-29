#!/usr/bin/env node

import { Command, Option } from 'commander';
import { render } from 'ink';
import React from 'react';
import type { SearchResult } from './utils/saver.js';
import { SearchApp } from './components/SearchApp.js';
import { duckduckgoSearch } from './search.js';

type OutputMode = 'interactive' | 'json' | 'plain';

function printPlainResults(keyword: string, results: SearchResult[]): void {
  console.log(`Query: ${keyword}\n`);
  for (let i = 0; i < results.length; i++) {
    const r = results[i]!;
    console.log(`[${i + 1}] ${r.title}`);
    console.log(r.link);
    console.log(r.snippet);
    console.log('');
  }
}

function printJsonResults(keyword: string, results: SearchResult[]): void {
  console.log(JSON.stringify({ keyword, results }, null, 2));
}

const program = new Command();

program
  .name('bot-cli')
  .description('基于 DuckDuckGo 的终端搜索工具（默认交互界面，可选 JSON / 纯文本输出）')
  .version('1.0.0')
  .configureHelp({ sortSubcommands: true })
  .addHelpText(
    'after',
    `
常用子命令:
  search <关键词> [选项]    网页搜索（默认进入 Ink 交互界面）

快速示例:
  bot-cli search "TypeScript"
  bot-cli search "关键词" --output json
  bot-cli search "关键词" -o plain

查看搜索子命令的全部参数与说明:
  bot-cli search --help
`
  );

const searchCmd = program
  .command('search <keyword>')
  .description('使用 DuckDuckGo 搜索网页')
  .addOption(
    new Option('-o, --output <mode>', '输出方式：interactive 交互 TUI（默认）；json 仅 stdout JSON；plain 仅 stdout 纯文本')
      .choices(['interactive', 'json', 'plain'] as const)
      .default('interactive' satisfies OutputMode)
  )
  .addHelpText(
    'after',
    `
参数:
  <keyword>    搜索关键词，支持单词、短语或整句（将原样作为 DuckDuckGo 查询）

选项说明:
  -o, --output    interactive | json | plain
                  interactive — 终端交互，可选序号打开链接、/save、/summary 等
                  json        — 向标准输出打印 JSON 后退出（适合脚本、管道、Agent）
                  plain       — 向标准输出打印编号列表后退出

示例:
  bot-cli search "nodejs LTS"
  bot-cli search "Rust 异步" --output json
  bot-cli search "wiki typescript" -o plain
`
  );

searchCmd.action(async (keyword: string, options: { output: OutputMode }) => {
    try {
      const results: SearchResult[] = await duckduckgoSearch(keyword, 10);
      const mode = options.output;

      if (mode === 'json') {
        printJsonResults(keyword, results);
        return;
      }
      if (mode === 'plain') {
        printPlainResults(keyword, results);
        return;
      }

      render(React.createElement(SearchApp, { results, keyword }));
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
