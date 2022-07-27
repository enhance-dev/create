let path = require('path')
let fs = require('fs')
let pathToPkg = path.join(__dirname, '..', 'vendor', 'package.json')
let pkg = require(pathToPkg)

delete pkg.name
delete pkg.version
delete pkg.scripts.postinstall

fs.writeFileSync(pathToPkg, JSON.stringify(pkg, null, 2))
