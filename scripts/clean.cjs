const path = require('path')
const fs = require('fs')
const pathToPkg = path.join(__dirname, '..', 'vendor', 'package.json')
const pkg = require(pathToPkg)

delete pkg.name
delete pkg.version
delete pkg.scripts.postinstall

fs.writeFileSync(pathToPkg, JSON.stringify(pkg, null, 2))
