// silly helpers
const red = msg => console.log('\x1b[31m%s\x1b[0m', msg)
const green = msg => console.log('\x1b[32m%s\x1b[0m', msg)
const grey = msg => console.log('\x1b[2m%s\x1b[0m', msg)
const cyan = msg => console.log('\x1b[1m\x1b[36m%s\x1b[0m', msg)

export function success ({ path, dest }) {
  green(`\nCreated ${ dest }\n`)
  grey('--- to get started run the following commands ---')
  cyan(`cd ${ path }`)
  cyan('npm install')
  cyan('npm start')
  console.log('')
}

export function failure ({ path, message }) {
  red(`\nFailed to create! ${ path || '' }\n`)
  grey(message)
  console.log('')
}
