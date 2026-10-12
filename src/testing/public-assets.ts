import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A `fetch` that serves files from the repository `public/` folder, so component and
 * repository specs exercise the real shipped SVGs without a network. Unknown paths are 404.
 */
export function publicFetch(requests: string[] = []): typeof fetch {
  return async (input) => {
    const url = new URL(String(input), 'http://localhost/');
    requests.push(url.pathname);
    try {
      return new Response(readFileSync(join(process.cwd(), 'public', url.pathname), 'utf8'), {
        status: 200,
      });
    } catch {
      return new Response('not found', { status: 404 });
    }
  };
}

/** The source text of one shipped file under `public/`. */
export function publicFile(path: string): string {
  return readFileSync(join(process.cwd(), 'public', path), 'utf8');
}
