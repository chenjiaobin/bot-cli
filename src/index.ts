#!/usr/bin/env node

import { Command } from 'commander';
import { render } from 'ink';
import React from 'react';
import type { SearchResult } from './utils/saver.js';
import { SearchApp } from './components/SearchApp.js';
import { duckduckgoSearch } from './search.js';

const program = new Command();

program
  .name('bot-cli')
  .description('A CLI tool for web search')
  .version('1.0.0');

program
  .command('search <keyword>')
  .description('Search the web using DuckDuckGo')
  .action(async (keyword: string) => {
    try {
      const results: SearchResult[] = await duckduckgoSearch(keyword, 10);
      render(React.createElement(SearchApp, { results, keyword }));
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
