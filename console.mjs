// silly helpers
let red = msg => console.log('\x1b[31m%s\x1b[0m', msg)
let green = msg => console.log('\x1b[32m%s\x1b[0m', msg)
let grey = msg => console.log('\x1b[2m%s\x1b[0m', msg)
let cyan = msg => console.log('\x1b[1m\x1b[36m%s\x1b[0m', msg)

export function success ({ path, dest }) {
  console.log('')
  green(`Created ${ dest }`)
  console.log('')
  grey(`--- to get started run the following commands ---`)
  cyan(`cd ${ path }`)
  cyan(`npm install`)
  cyan(`npm start`)
  console.log('')
}

export function failure ({ path, message }) {
  console.log('')
  red(`Failed to create! ${ path || '' }`)
  console.log('')
  grey(message)
  console.log('')
}
