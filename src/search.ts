import https from 'https';
import * as cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

function httpsPostPromise(host: string, path: string, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: host,
      path,
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function duckduckgoSearch(query: string, num: number = 10): Promise<SearchResult[]> {
  const html = await httpsPostPromise(
    'html.duckduckgo.com',
    '/html/',
    'q=' + encodeURIComponent(query)
  );

  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  $('a.result__a').each((_index, element) => {
    const $el = $(element);
    const title = $el.text().trim();
    const link = $el.attr('href');

    // Find the snippet in the parent's sibling
    const $body = $el.closest('.result__body');
    const snippet = $body.find('a.result__snippet').text().trim();

    if (title && link) {
      results.push({ title, link, snippet });
    }
  });

  return results.slice(0, num);
}
