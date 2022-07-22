#!/usr/bin/env node
import { execSync as shell } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ensure the path arg was passed
let args = process.argv.slice(2, process.argv.length)
let path = args[0]
if (!path) {
  console.error('Missing path.')
  process.exit(1)
}

// copy the starter project to the given path
const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, 'node_modules', '@enhance', 'starter-project')
const dist = join(process.cwd(), path)

// FIXME pretty sure this won't work on windows! 
shell(`mkdir -p ${dist}`)
shell(`cp -r ${src}/ ${dist}`)
shell(`rm -rf ${dist}/.github`)
