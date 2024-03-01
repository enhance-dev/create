#!/usr/bin/env node
// executed in userland
import process from 'process'
import { resolve } from 'path'

import { failure, success } from './console.js'
import { createProject } from './create-project.js'

import { createRequire } from 'module'

const args = process.argv.slice(2, process.argv.length)
const path = args[0]
const require = createRequire(import.meta.url)

// Need to pin major version set in package.json
const { starterProjectVersion } = require('./package.json')

if (!path) {
  throw Error('Missing path. Pass a pathname to create a new project.')
}

const dest = resolve(process.cwd(), path)

try {
  await createProject({ path, dest, starterProjectVersion })
  success({ path, dest })
}
catch (e) {
  failure({ path, message: e.message })
  process.exit(1)
}
