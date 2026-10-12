/**
 * Minimal Node typings for the few specs that read edition and art files from disk. The
 * project does not depend on `@types/node`; only the calls used by those specs are declared.
 */
declare module 'node:fs' {
  export interface Dirent {
    readonly name: string;
    isDirectory(): boolean;
  }
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function readdirSync(path: string, options: { withFileTypes: true }): Dirent[];
}

declare module 'node:path' {
  export function join(...paths: string[]): string;
}

declare const process: { cwd(): string };
