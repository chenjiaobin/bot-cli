import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import type { SearchResult } from '../utils/saver.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { openLink } from '../utils/opener.js';
import { saveResults } from '../utils/saver.js';
import { generateSummary } from '../utils/ai-summary.js';
import { SearchResults } from './SearchResults.js';

type Phase = 'idle' | 'selecting' | 'saving' | 'summarizing';

export interface SearchAppProps {
  results: SearchResult[];
  keyword: string;
}

interface AppState {
  highlightIndex: number | null;
  inputText: string;
  aiSummary: string | null;
  message: string | null;
  messageTimer: ReturnType<typeof setTimeout> | null;
}

export function SearchApp({ results, keyword }: SearchAppProps) {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>({
    highlightIndex: null,
    inputText: '',
    aiSummary: null,
    message: null,
    messageTimer: null,
  });
  const [phase, setPhase] = useState<Phase>('idle');

  const clearMessage = useCallback(() => {
    if (state.messageTimer) clearTimeout(state.messageTimer);
    setState((prev) => ({ ...prev, message: null, messageTimer: null }));
  }, [state.messageTimer]);

  const showMessage = useCallback((msg: string) => {
    clearMessage();
    const timer = setTimeout(clearMessage, 3000);
    setState((prev) => ({ ...prev, message: msg, messageTimer: timer }));
  }, [clearMessage]);

  const handleNumberInput = useCallback(async (numStr: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num) || num < 1 || num > results.length) {
      return;
    }

    const index = num - 1;
    const url = results[index].link;

    setState((prev) => ({ ...prev, highlightIndex: index }));

    try {
      await copyToClipboard(url);
      await openLink(url);
      showMessage('链接已复制到剪贴板，正在打开浏览器...');
    } catch (err) {
      showMessage(`错误: ${err instanceof Error ? err.message : '操作失败'}`);
    } finally {
      setState((prev) => ({ ...prev, highlightIndex: null }));
    }
  }, [results, showMessage]);

  const handleCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed === '/save') {
      // Default to txt
      setPhase('saving');
      try {
        const filePath = await saveResults(results, 'txt', keyword);
        showMessage(`已保存到 ${filePath}`);
      } catch (err) {
        showMessage(`保存失败: ${err instanceof Error ? err.message : '未知错误'}`);
      }
      setPhase('idle');
    } else if (trimmed.startsWith('/save ')) {
      const formatRaw = trimmed.replace('/save ', '').trim();
      const format = formatRaw as 'txt' | 'json';
      if (format !== 'txt' && format !== 'json') {
        showMessage('格式不正确，请使用 /save 或 /save json');
        return;
      }
      setPhase('saving');
      try {
        const filePath = await saveResults(results, format, keyword);
        showMessage(`已保存为 ${filePath}`);
      } catch (err) {
        showMessage(`保存失败: ${err instanceof Error ? err.message : '未知错误'}`);
      }
      setPhase('idle');
    } else if (trimmed === '/summary') {
      setPhase('summarizing');
      try {
        const summary = await generateSummary(results);
        setState((prev) => ({ ...prev, aiSummary: summary }));
        showMessage('AI 摘要已生成');
      } catch (err) {
        showMessage(`摘要失败: ${err instanceof Error ? err.message : '未知错误'}`);
      }
      setPhase('idle');
    } else if (trimmed === '/clear') {
      setState((prev) => ({ ...prev, aiSummary: null, inputText: '' }));
    } else {
      // Check if it's a number
      const parsed = parseInt(trimmed, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= results.length) {
        await handleNumberInput(trimmed);
        setState((prev) => ({ ...prev, inputText: '' }));
      } else {
        showMessage(`未知命令: "${trimmed}"。可用: 数字, /save, /save json, /summary, /clear`);
        setState((prev) => ({ ...prev, inputText: '' }));
      }
    }
  }, [results, showMessage, handleNumberInput]);

  useInput((input, key) => {
    // Ctrl+C always exits
    if (key.ctrl && input === 'c') {
      exit();
      return true;
    }

    if (key.escape) {
      setState((prev) => ({ ...prev, inputText: '' }));
      return true;
    }

    if (key.return) {
      if (phase !== 'idle') return false;

      const text = state.inputText.trim();
      if (!text) {
        // Empty enter just clears input
        setState((prev) => ({ ...prev, inputText: '' }));
        return true;
      }

      if (text.startsWith('/')) {
        handleCommand(text);
      } else {
        handleNumberInput(text);
      }
      return true;
    }

    // Accumulate printable characters
    if (input && input.length === 1 && !key.shift && !key.ctrl) {
      setState((prev) => ({ ...prev, inputText: prev.inputText + input }));
      return true;
    }

    return false;
  });

  const promptText = phase === 'idle'
    ? `输入序号(1-${results.length})打开链接，或使用 /save /save json /summary /clear`
    : phase === 'saving' ? '正在保存...' : '正在生成 AI 摘要...';

  return (
    <Box flexDirection="column" padding={1}>
      <SearchResults
        results={results}
        keyword={keyword}
        highlightIndex={state.highlightIndex}
        aiSummary={state.aiSummary}
      />

      <Box flexDirection="column" marginTop={1}>
        {state.message && (
          <Text color="green">{state.message}</Text>
        )}

        <Text color="cyan">{promptText}</Text>
        <Box>
          <Text bold color="yellow">{'> '}</Text>
          <Text>{state.inputText}</Text>
        </Box>
      </Box>
    </Box>
  );
}
