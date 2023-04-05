import { cpSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export function createProject ({ dest, path }) {
    const require = createRequire(import.meta.url)
    const here = dirname(fileURLToPath(import.meta.url))
    const template = join(here, 'template')
    const appName = path.trim().split('/').at(-1) || 'my-enhance-app'

    if (existsSync(dest)) {
        throw Error('Path already exists.')
    }

    cpSync(template, dest, { recursive: true })

    renameSync(join(dest, 'template.gitignore'), join(dest, '.gitignore'))

    const pkgFile = require(join(dest, 'package.json'))
    pkgFile.name = appName
    const newPkgFile = Object.assign({
            name: null,
            version: null,
            scripts: null,
            dependencies: null,
            devDependencies: null,
        },
    pkgFile)

    writeFileSync(
        join(dest, 'package.json'),
        JSON.stringify(newPkgFile, null, 2),
    )

    const arcFile = readFileSync(join(dest, '.arc'), 'utf8')
        .toString()
        .replace('myproj', appName)

    writeFileSync(join(dest, '.arc'), arcFile)
}
