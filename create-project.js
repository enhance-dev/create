import { createWriteStream,  existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import tiny from 'tiny-json-http'
import tar from 'tar'
import { v4 as uuidv4 } from 'uuid';

export async function createProject ({ dest, path, name }) {
    const here = dirname(fileURLToPath(import.meta.url))
    const appName = name || path.trim().split('/').at(-1) || 'my-enhance-app'

    // Download folder
    const temp = join(tmpdir(), uuidv4())
    mkdirSync(temp)
    const starterProjectArchive = join(temp, 'starter.tgz')

    // Project folder
    const projectDir = resolve(dest)
    if (existsSync(projectDir)) {
        throw Error('Path already exists.')
    }

    try {
        // Get url to latest starter project
        const { body } = await tiny.get({url: 'https://registry.npmjs.org/@enhance/starter-project'})
        const latestVer = body['dist-tags'].latest
        const latestUrl = body.versions[latestVer].dist.tarball

        // Download the starter project
        await downloadStarterProject(latestUrl, starterProjectArchive)

        // Extract starter project
        tar.x({ C: temp, file: starterProjectArchive, sync: true })
        // Move starter project to final destination
        renameSync(join(temp, 'package'), projectDir)
        // Clean up download
        unlinkSync(starterProjectArchive)

        // Update the starter project with your appName
        renameSync(join(projectDir, 'template.gitignore'), join(projectDir, '.gitignore'))
        updatePackageJson(dest, appName)
        updateArcFile(dest, appName)
    } catch (err) {
        throw Error('Unable to create project', err)
    }
}

function updatePackageJson(dest, appName) {
    const require = createRequire(import.meta.url)
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
}

function updateArcFile(dest, appName) {
    const arcFile = readFileSync(join(dest, '.arc'), 'utf8')
    .toString()
    .replace('myproj', appName)

    writeFileSync(join(dest, '.arc'), arcFile)
}

async function downloadStarterProject(url, dest) {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(dest)
        const request = https.get(url, function (response) {
            response.pipe(file)
            file.on('finish', function () {
                file.close(resolve)
            })
        }).on('error', function (err) { // Handle errors
            unlinkSync(dest)
            reject(err)
        })
    })
}
