// Driver for the markdown-render-speed-02 entry.
//
// The harness runs `node /bot/main.ts` (Node 22, type stripping on). It feeds
// us /input/cases.json: an array of { id, markdown }. Every case is rendered
// on its own with parse() from ./parse.js and the HTML strings are written,
// in the same order, as a JSON array to /output/html.json. When run outside
// the sandbox, MAKEFUN_INPUT_DIR / MAKEFUN_OUTPUT_DIR point at the two
// directories instead. Type annotations here are erasable syntax only.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from './parse.js';

interface Case {
  id: string;
  markdown: string;
}

const inputDir: string = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const raw: string = readFileSync(join(inputDir, 'cases.json'), 'utf8');
const cases: Case[] = JSON.parse(raw) as Case[];

const html: string[] = new Array<string>(cases.length);
for (let idx = 0; idx < cases.length; idx++) {
  html[idx] = parse(cases[idx].markdown);
}

writeFileSync(join(outputDir, 'html.json'), JSON.stringify(html));
