import { randomUUID } from 'crypto'
import { accessSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync, rmSync } from 'fs'
import { createRequire } from 'module'
import { tmpdir } from 'os'
import { isAbsolute, join, resolve, parse } from 'path'
import https from 'https'
import tiny from 'tiny-json-http'
import tar from 'tar'

const require = createRequire(import.meta.url)

export async function createProject ({ dest, path, name, starterProjectVersion = 9999 }) {
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

    // Download folder
    const temp = join(tmpdir(), randomUUID())
    mkdirSync(temp)
    const starterProjectArchive = join(temp, 'starter.tgz')

    // Project folder
    const projectDir = isAbsolute(dest) ? dest : resolve(dest)
    if (existsSync(projectDir)) {
        throw Error('Path already exists.')
    }

    try {
        // Get tarball url
        const latestUrl = await computeTarballUrl(starterProjectVersion)

        // Download the starter project
        await downloadStarterProject(latestUrl, starterProjectArchive)

        // Extract starter project
        tar.x({ C: temp, file: starterProjectArchive, sync: true })

        // Move starter project to final destination
        const packageDir = join(temp, 'package')
        copySync(packageDir, projectDir)
        rmSync(packageDir, { recursive: true })

        // Clean up download
        unlinkSync(starterProjectArchive)

        // Update the starter project with your appName
        renameSync(join(projectDir, 'template.gitignore'), join(projectDir, '.gitignore'))
        unlinkSync(join(projectDir, 'LICENSE'))
        unlinkSync(join(projectDir, 'manifest.json'))
        unlinkSync(join(projectDir, 'readme.md'))
        updatePackageJson(dest, appName)
        updateArcFile(dest, appName)
    } catch (err) {
        console.log(err)
        throw Error('Unable to create project', err)
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

async function computeTarballUrl(starterProjectVersion) {
    // Get url to latest starter project
    const { body } = await tiny.get({url: 'https://registry.npmjs.org/@enhance/starter-project'})

    // get keys from body.version
    const latestVer = body['dist-tags'].latest
    const version = Object.keys(body.versions).reduce(
        (accumulator, currentValue) => {
            let major = currentValue.split('.')[0]
            return major <= starterProjectVersion ? currentValue : accumulator
        },
        latestVer
    )
    return body.versions[version].dist.tarball
}

// When node 14 support is dropped switch to using `cpSync`
function copySync(src, dest) {
    const copy = (copySrc, copyDest) => {
      const list = readdirSync(copySrc)
      list.forEach((item) => {
        const ss = resolve(copySrc, item)
        const stat = statSync(ss)
        const curSrc = resolve(copySrc, item)
        const curDest = resolve(copyDest, item)

        if (stat.isFile()) {
          const fileData = readFileSync(curSrc)
          writeFileSync(curDest, fileData)
        } else if (stat.isDirectory()) {
          mkdirSync(curDest, { recursive: true })
          copy(curSrc, curDest)
        }
      })
    }

    try {
      accessSync(dest)
    } catch (err) {
      mkdirSync(dest, { recursive: true })
    }
    copy(src, dest)
}
