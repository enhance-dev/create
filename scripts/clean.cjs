let path = require('path')
let fs = require('fs')
let pathToPkg = path.join(__dirname, '..', 'vendor', 'package.json')
let pkg = require(pathToPkg)
delete pkg.postinstall
fs.writeFileSync(pathToPkg, JSON.stringify(pkg, null, 2))
