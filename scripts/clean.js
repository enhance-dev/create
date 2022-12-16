// executed in CI before module is published
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSync } from 'node:fs'

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const pathToPkg = join(here, '..', 'template', 'package.json')

const pkgFile = require(pathToPkg)

pkgFile.name = undefined
pkgFile.version = undefined
pkgFile.scripts.postinstall = undefined

writeFileSync(pathToPkg, JSON.stringify(pkgFile, null, 2))
