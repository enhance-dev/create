import { createRequire } from 'module'
import { isAbsolute, join, resolve } from 'path'
import fs from 'fs'
import git from 'isomorphic-git'

const { existsSync, lstatSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } = fs

const require = createRequire(import.meta.url)

export const STARTER_PROJECT = 'https://github.com/enhance-dev/enhance-starter-project'

export async function createProject ({ dest, path, name, template = STARTER_PROJECT }) {
    let looseName = /^[a-z][a-zA-Z0-9-_]+$/
    let appName = 'my-enhance-app'
    if (name) {
        appName = name
    } else if (path) {
        const parts = path.trim().split('/')
        appName = parts[parts.length - 1]
    }

    if (!looseName.test(appName)) {
        throw Error('Invalid app name')
    }

    if (template) {
        try {
            new URL(template)
        } catch (error) {
            throw Error('Invalid template URL')
        }
    }

    // Project folder
    const projectDir = isAbsolute(dest) ? dest : resolve(dest)
    if (existsSync(projectDir)) {
        throw Error('Path already exists.')
    }

    await createFromTemplate(projectDir, dest, appName, template)
}

async function createFromTemplate(projectDir, dest, appName, template) {
    const http = require('isomorphic-git/http/node')
    try {
        // Clone the template project
        await git.clone({ fs, http, dir: projectDir, url: template })

        // Remove git folders
        remove(join(projectDir, '.git'))
        remove(join(projectDir, '.github'))

        // Clean up miscellaneous starter project files
        if (template === STARTER_PROJECT) {
            cleanStarterProject(projectDir)
        }

        updatePackageJson(dest, appName)
        updateArcFile(dest, appName)
    } catch (err) {
        console.log(err)
        throw Error('Unable to create project', err)
    }
}

function cleanStarterProject(projectDir) {
    renameSync(join(projectDir, 'template.gitignore'), join(projectDir, '.gitignore'))
    remove(join(projectDir, '.npmignore'))
    remove(join(projectDir, '.npmrc'))
    remove(join(projectDir, 'LICENSE'))
    remove(join(projectDir, 'manifest.json'))
    remove(join(projectDir, 'readme.md'))
    remove(join(projectDir, 'scripts'))
}

function remove(filePath) {
    if (existsSync(filePath)) {
        if (lstatSync(filePath).isDirectory()) {
            rmSync(filePath, { recursive: true, force: true });
        } else {
            unlinkSync(filePath)
        }
    }
}

function updatePackageJson(dest, appName) {
    const pkgFile = require(join(dest, 'package.json'))
    pkgFile.name = appName
    pkgFile.version = '0.0.1'
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
}

function updateArcFile(dest, appName) {
    const arcFile = readFileSync(join(dest, '.arc'), 'utf8')
        .toString()
        .replace('myproj', appName)

    writeFileSync(join(dest, '.arc'), arcFile)
}
