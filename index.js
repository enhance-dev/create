#!/usr/bin/env node
// executed in userland
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

import { failure, success } from './console.js'

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const template = join(here, 'template')
const args = process.argv.slice(2, process.argv.length)
const path = args[0]

if (!path) {
  throw Error('Missing path. Pass a pathname to create a new project.')
}

const dest = join(process.cwd(), path)
const appName = path.trim().split('/').at(-1) || 'my-enhance-app'

try {
  if (existsSync(dest)) {
    throw Error('Path already exists.')
  }

  cpSync(template, dest, { recursive: true })

  const pkgFile = require(join(dest, 'package.json'))
  pkgFile.name = appName
  pkgFile.version = '0.0.1'
  const newPkgFile = Object.assign(
    {
      name: null,
      version: null,
      scripts: null,
      dependencies: null,
      devDependencies: null,
    },
    pkgFile
  )
  writeFileSync(
    join(dest, 'package.json'),
    JSON.stringify(newPkgFile, null, 2),
  )

  const arcFile = readFileSync(join(dest, '.arc'), 'utf8')
    .toString()
    .replace('myproj', appName)
  writeFileSync(join(dest, '.arc'), arcFile)

  success({ path, dest })
}
catch (e) {
  failure({ path, message: e.message })
  process.exit(1)
}
