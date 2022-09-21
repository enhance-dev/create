#!/usr/bin/env node
import { cp, rename } from 'node:fs/promises'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname, sep } from 'path'
import { fileURLToPath } from 'url'
import { success, failure } from './console.mjs'

const args = process.argv.slice(2, process.argv.length)
const path = args[0]

function shortenPath (filePath) {
  let packageName = `@enhance${sep}starter-project${sep}`
  return filePath.substring(filePath.lastIndexOf(packageName) + packageName.length)
}

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
    const src = join(here, 'node_modules/@enhance/starter-project')
    const dest = join(process.cwd(), path)

    if (existsSync(dest)) {
      throw Error('Path already exists.')
    }

    let starterProjectManifest = JSON.parse(readFileSync(join(src, "manifest.json")))

    // Create starter files
    starterProjectManifest.fileList.forEach(async file => {
      let filename = shortenPath(file)
      await cp(join(src, filename), join(dest, filename), { recursive: true })
    })

    // move the ignore file into place
    await cp(join(src, '.npmignore'), join(dest, '.gitignore'))

    // copy .arc file into place
    await cp(join(src, '.arc'), join(dest, '.arc'))

    // package.json
    let pkg = JSON.parse(readFileSync(join(src, 'package.json')))

    delete pkg.name
    delete pkg.version
    delete pkg.scripts.postinstall

    writeFileSync(join(dest, 'package.json'), JSON.stringify(pkg, null, 2))

    success({ path, dest })
  }
  catch (e) {
    failure({ path, message: e.message })
    process.exit(1)
  }
})();
