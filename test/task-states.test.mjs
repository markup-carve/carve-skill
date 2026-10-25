import test from 'node:test'
import assert from 'node:assert/strict'
import { carveToHtml, parse, renderCarve } from '@markup-carve/carve'

test('published engine preserves all authored task state spellings', () => {
  const source = '- [ ] open\n- [_] open alias\n- [/] progress\n- [!] blocked\n- [-] canceled\n- [>] delegated\n- [?] unknown\n- [x] done\n- [X] done alias\n'
  const tree = parse(source)
  const roundtrip = renderCarve(tree)
  for (const marker of ['[ ]', '[_]', '[/]', '[!]', '[-]', '[>]', '[?]', '[x]']) {
    assert.ok(roundtrip.includes(marker), `lost ${marker}`)
  }
  const html = carveToHtml(source)
  for (const state of ['_', '/', '!', '-', '>', '?']) {
    assert.ok(html.includes(`data-task-state="${state === ">" ? "&gt;" : state}"`), `lost HTML state ${state}`)
  }
})
