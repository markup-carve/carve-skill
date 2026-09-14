#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const args = process.argv.slice(2)
const valueAfter = (flag) => {
  const index = args.indexOf(flag)
  return index === -1 ? undefined : args[index + 1]
}

const installedRoot = resolve(valueAfter('--root') ?? join(homedir(), '.codex', 'skills', 'carve-authoring'))
const installedPackage = JSON.parse(await readFile(join(installedRoot, 'package.json'), 'utf8'))
const installed = String(installedPackage.version)
let latest = valueAfter('--latest')

if (!latest) {
  const response = await fetch('https://api.github.com/repos/markup-carve/carve-skill/releases/latest', {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'carve-skill-version-check' },
  })
  if (!response.ok) throw new Error(`GitHub release lookup failed: HTTP ${response.status}`)
  latest = String((await response.json()).tag_name)
}

const parse = (version) => {
  const match = version.replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/)
  if (!match) throw new Error(`Unsupported skill version: ${version}`)
  return match.slice(1).map(Number)
}
const compare = (left, right) => {
  const a = parse(left)
  const b = parse(right)
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

const relation = compare(installed, latest)
if (relation < 0) {
  console.error(`carve-authoring update available: installed ${installed}, latest ${latest.replace(/^v/, '')}`)
  console.error('Reinstall from https://github.com/markup-carve/carve-skill.')
  process.exitCode = 1
} else if (relation > 0) {
  console.log(`carve-authoring ${installed} is ahead of the latest release ${latest.replace(/^v/, '')}.`)
} else {
  console.log(`carve-authoring ${installed} is current.`)
}
