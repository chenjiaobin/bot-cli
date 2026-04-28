import fs from 'node:fs/promises';
import path from 'node:path';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

type Format = 'txt' | 'json';

export async function saveResults(
  results: SearchResult[],
  format: Format,
  keyword: string,
  outputDir = path.join(process.cwd(), 'output')
): Promise<string> {
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  const timestamp = Date.now();
  // Use first 10 characters of keyword as filename prefix
  const keywordPrefix = keyword.slice(0, 10).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  const filename = `${keywordPrefix}_${timestamp}.${format}`;
  const filePath = path.join(outputDir, filename);

  const content = format === 'json'
    ? JSON.stringify(results, null, 2)
    : results.map((r, i) => `[${i + 1}] ${r.title}\n${r.link}\n${r.snippet}`).join('\n\n');

  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}
