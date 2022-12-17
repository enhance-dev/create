#!/bin/sh
# This script is used to vendor the starter project into this create project.
rm -rf template # in case it exists
cp -r node_modules/@enhance/starter-project template

# Remove files/folders we don't need
rm -rf template/.github/  # TODO: remove
rm -rf template/scripts/  # TODO: remove
rm template/manifest.json # TODO: remove
rm template/CHANGELOG.md  # TODO: remove
rm template/readme.md
rm template/LICENSE

# rename gitignore template
mv template/template.gitignore template/.gitignore

# clean package.json
node -p "
const pkg = require('./template/package.json')
delete pkg.name
delete pkg.version
delete pkg.scripts.postinstall
JSON.stringify(pkg, null, 2)" > template/new-package

mv template/new-package template/package.json

echo "Vendored starter project into template folder"
