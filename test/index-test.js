import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import test from 'tape'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const TEST_APP_NAME = 'test-app'
const EXPECTED_FILES = [
  'app',
  'public',
  '.arc',
  '.gitignore',
  'package.json',
  'prefs.arc',
].sort()

function cleanup() {
  execSync('rm -rf template test/test-app')
}

test('setup', (t) => {
  cleanup()
  t.end()
})

test('vendor-template.sh', (t) => {
  t.plan(2)
  const stdout = execSync('scripts/vendor-template.sh').toString()
  t.ok(stdout.includes('Vendored'), 'vendor-template.sh ran')

  // verify output in template/
  t.deepEqual(
    readdirSync('template'),
    EXPECTED_FILES,
    'template file structure is correct'
  )
})

// run index.js in subprocess with path arg
test('index.js', (t) => {
  t.plan(6)

  const stdout = execSync(`node index.js test/${TEST_APP_NAME}`).toString()
  t.ok(stdout.includes('cd test/test-app'), 'index.js ran')

  t.deepEqual(
    readdirSync(join(here, TEST_APP_NAME)),
    EXPECTED_FILES,
    'new app file structure is correct'
  )

  // verify output in test/test-app/
  const pkg = require(`./${TEST_APP_NAME}/package.json`)
  t.equal(pkg.name, TEST_APP_NAME, 'package: name is correct')
  t.equal(pkg.version, '0.0.1', 'package: version is correct')
  t.notOk(pkg.scripts['postinstall'], 'package: no postinstall')

  const arcFile = readFileSync(join(here, TEST_APP_NAME, '.arc'), 'utf8').toString()
  t.ok(arcFile.indexOf(`@app\n${TEST_APP_NAME}`) === 0, 'arc: app name is correct')
})

test.onFinish(() => {
  cleanup()
})
