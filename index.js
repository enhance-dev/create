#!/usr/bin/env node
// executed in userland
import {
  cpSync,
  existsSync,
  readFileSync,
  // renameSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname, sep } from 'node:path'
import process from 'node:process'

import { success, failure } from './console.js'

const require = createRequire(import.meta.url)
const args = process.argv.slice(2, process.argv.length)
const path = args[0]


try {
  // ensure node 16 or higher
  const v = Number(process.versions.node.split('.')[0])
  if (v < 16) {
    throw Error(`Invalid version of Node. Found ${v} but expected 16 or higher.`)
  }

  // ensure the path arg was passed
  if (!path) {
    throw Error('Missing path.')
  }

  const here = dirname(fileURLToPath(import.meta.url))
  const template = join(here, 'template')
  const dest = join(process.cwd(), path)
  const appName = path.replace(sep, '-')

  if (existsSync(dest)) {
    throw Error('Path already exists.')
  }

  // copy the starter project to the given path
  cpSync(template, dest, { recursive: true })

  // update package.json
  const pkgFile = require(join(dest, 'package.json'))
  pkgFile.name = appName
  pkgFile.version = '0.0.1'
  // specify package.json key order
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

  // update .arc file
  const arcFile = readFileSync(join(dest, '.arc'), 'utf8')
    .toString()
    .replace('myproj', appName)
  writeFileSync(join(dest, '.arc'), arcFile)

  // move the ignore file into place
  // ! currently "starter-project" doesn't have a .gitignore or _.gitignore
  // renameSync(join(dest, '_.gitignore'), join(dest, '.gitignore'))

  success({ path, dest })
}
catch (e) {
  failure({ path, message: e.message })
  process.exit(1)
}
