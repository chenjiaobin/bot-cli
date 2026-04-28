import { hasFetch } from './version-check.js';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export interface AiSummaryOptions {
  apiKey?: string;
  baseUrl?: string;
}

export async function generateSummary(
  results: SearchResult[],
  options: AiSummaryOptions = {}
): Promise<string> {
  if (!hasFetch()) {
    throw new Error('当前 Node.js 版本不支持 fetch，请升级至 18 以上');
  }

  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('缺少 OPENAI_API_KEY 环境变量。\n请在 .env 文件或终端中设置此变量。');
  }

  const baseUrl = (options.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

  const context = results
    .map((r, i) => `[${i + 1}] ${r.title}\n链接: ${r.link}\n摘要: ${r.snippet}`)
    .join('\n\n');

  const prompt = `你是一位信息整理助手。根据以下搜索结果，生成一段简洁的中文摘要（300字以内），涵盖主要观点和关键信息。

搜索结果：
${context}

请输出纯文本摘要，不要包含额外的格式标记。`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const summary = data?.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    throw new Error('AI 返回了空结果，请重试');
  }

  return summary;
}
