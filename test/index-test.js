import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import test from 'tape'

const here = dirname(fileURLToPath(import.meta.url))
const TEST_APP_NAME = 'test-name'
const TEST_APP_PATH = 'test-app'
const BASE_FILES = [
  'app',
  'public',
  '.arc',
  'package.json',
  'prefs.arc',
].sort()
const TEMPLATE_FILES = [
  'template.gitignore',
  ...BASE_FILES
].sort()
const EXPECTED_FILES = [
  '.gitignore',
  ...BASE_FILES
].sort()

function cleanup() {
  cleanTemplate()
  cleanProj()
}

function cleanTemplate() {
  execSync('rm -rf template')
}

function cleanProj() {
  execSync('rm -rf test/test-app')
}

test('setup', (t) => {
  cleanup()
  t.end()
})

// run index.js in subprocess with path arg
test('index.js', (t) => {
  t.plan(5)

  const stdout = execSync(`node index.js test/${TEST_APP_PATH}`).toString()
  t.ok(stdout.includes('cd test/test-app'), 'index.js ran')

  t.deepEqual(
    readdirSync(join(here, TEST_APP_PATH)),
    EXPECTED_FILES,
    'new app file structure is correct'
  )

  // verify output in test/test-app/
  let pkg = readFileSync(join(here, TEST_APP_PATH, 'package.json'), 'utf8').toString()
  pkg = JSON.parse(pkg)
  t.equal(pkg['name'], TEST_APP_PATH, 'package: name is correct')
  t.equal(pkg['version'], '0.0.1', 'package: version is correct')

  const arcFile = readFileSync(join(here, TEST_APP_PATH, '.arc'), 'utf8').toString()
  t.ok(arcFile.indexOf(`@app\n${TEST_APP_PATH}`) === 0, 'arc: app name is correct')
  t.teardown(() => {
    cleanProj()
  })
})

// run create-project.js in subprocess with path and name args
test('index.js', async (t) => {
  t.plan(4)

  let { createProject } = await import('../create-project.js')
  await createProject({ path: `test/${TEST_APP_PATH}`, dest: join(process.cwd(), `test/${TEST_APP_PATH}`), name: TEST_APP_NAME })

  t.deepEqual(
    readdirSync(join(here, TEST_APP_PATH)),
    EXPECTED_FILES,
    'new app file structure is correct'
  )

  // verify output in test/test-app/
  let pkg = readFileSync(join(here, TEST_APP_PATH, 'package.json'), 'utf8').toString()
  pkg = JSON.parse(pkg)
  t.equal(pkg['name'], TEST_APP_NAME, 'package: name is correct')
  t.equal(pkg['version'], '0.0.1', 'package: version is correct')

  const arcFile = readFileSync(join(here, TEST_APP_PATH, '.arc'), 'utf8').toString()
  t.ok(arcFile.indexOf(`@app\n${TEST_APP_NAME}`) === 0, 'arc: app name is correct')
  t.teardown(() => {
    cleanProj()
  })
})

test.onFinish(() => {
  cleanup()
})
