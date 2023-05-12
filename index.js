#!/usr/bin/env node
// executed in userland
import process from 'process'
import { resolve } from 'path'

import { failure, success } from './console.js'
import { createProject } from './create-project.js'

const args = process.argv.slice(2, process.argv.length)
const path = args[0]

if (!path) {
  throw Error('Missing path. Pass a pathname to create a new project.')
}

const dest = resolve(process.cwd(), path)

try {
  await createProject({ path, dest })
  success({ path, dest })
}
catch (e) {
  failure({ path, message: e.message })
  process.exit(1)
}
