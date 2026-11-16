[![make.fun · markdown-render-speed-02](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/syuaibcvk/fast-marked/rank.svg)](https://make.fun/bounty/markdown-render-speed-02/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/syuaibcvk/fast-marked/reward.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)

# markdown-render-speed-02 — a faster drop-in for marked

`parse.js` exports `parse(markdown)`, which returns exactly the HTML that
marked 18.1.3's `marked.parse` returns with default options (gfm true,
breaks false, pedantic false), byte for byte, for every input — only faster.
`main.ts` is the harness driver: it reads `cases.json` from
`MAKEFUN_INPUT_DIR` (or `/input`), renders each case on its own, and writes
the array of HTML strings to `html.json` in `MAKEFUN_OUTPUT_DIR` (or
`/output`).

## Provenance

`parse.js` is a fork of marked 18.1.3 (MIT — see `LICENSE` and `NOTICE`):
the npm build `lib/marked.esm.js`, reformatted from its minified form so it
could be worked on, then optimized. No rendering rule was changed; every
optimization is a way of *not doing* work whose result is provably the same:

- **Lexer dispatch.** Every block and inline tokenizer regex is anchored and
  opens with a specific character. The lexers now check the opening first
  and skip the attempts that cannot match (the rest still run in marked's
  order). Two tokenizers whose regexes scan the whole remaining text on a
  failed attempt — tables and setext headings — get cheap necessary-condition
  scans instead (`tablePossible`, `lheadingPossible`).
- **List internals.** The six per-line "begin" regex tests are gated by the
  line's first character after its indent; first lines are taken with
  `indexOf` instead of `split`; tab expansion is skipped on lines without
  tabs; the trailing-blank-line test walks backwards instead of running a
  `$`-anchored regex.
- **Inline text.** When nothing ahead can stop a text run (no construct
  opener, email/URL boundary or hard break), the text regex — the lexer's
  most complex — is replaced by taking the string whole, which is what it
  would match.
- **Masking and closer scans.** The emphasis masking replaces are skipped
  when their regexes cannot match (no backslash/backtick, no `[`/backtick/
  `<`), the delimiter-closer scan is skipped for inline text without
  delimiters, and the scan itself now walks backwards with `lastIndexOf`.
- **Small things.** CR normalization only when a CR is present, the entity
  decoder only when an `&` is present, per-loop lookups (tokenizer,
  extensions) hoisted out of the lexer and parser loops.

Correctness is guarded by construction and by test: the entry renders the
kit's 720 practice cases identically to marked, and also matches marked on
fresh document sets drawn by the competition's own generator from other
seeds and on a battery of hand-written edge cases.

## Layout

- `main.ts` — the driver (erasable TypeScript only, Node 22).
- `parse.js` — the renderer; dependency-free, imports nothing.
- `LICENSE` — MIT (marked's licence, which also carries the original
  Markdown notice).
- `NOTICE` — attribution for the marked fork.
