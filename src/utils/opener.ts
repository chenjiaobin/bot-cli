import open from 'open';
import type { ChildProcess } from 'child_process';

export function openLink(url: string): Promise<ChildProcess> {
  return open(url);
}
