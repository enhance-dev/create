#!/usr/bin/env node
import { cp, rename } from 'node:fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { success, failure } from './console.mjs'

const args = process.argv.slice(2, process.argv.length)
const path = args[0]

// wrap top-level async in case consumer has Node < 14.8
;(async function main () {
  try {
    // ensure node 16 or higher
    let v = Number(process.versions.node.split('.')[0])
    if (v < 16) {
      throw Error(`Invalid version of Node. Found ${ v } but expected 16 or higher.`)
    }

    // ensure the path arg was passed
    if (!path) {
      throw Error('Missing path.')
    }

    const here = dirname(fileURLToPath(import.meta.url))
    const src = join(here, 'vendor')
    const dest = join(process.cwd(), path)

    if (existsSync(dest)) {
      throw Error('Path already exists.')
    }

    // copy the starter project to the given path
    await cp(src, dest, { recursive: true })

    // TODO: infer name from path
    // TODO: rename @app in .arc
    // TODO: set name in package.json

    // TODO: install dependencies at specific versions instead of "latest"

    // move the ignore file into place
    await rename(join(dest, '_.gitignore'), join(dest, '.gitignore'))

    success({ path, dest })
  }
  catch (e) {
    failure({ path, message: e.message })
    process.exit(1)
  }
})();
