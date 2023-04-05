#!/bin/sh
# This script is used to vendor the starter project into this create project.
rm -rf template # in case it exists
cp -r node_modules/@enhance/starter-project template

# Remove files/folders we don't need
rm template/manifest.json
rm template/readme.md
rm template/LICENSE

# clean package.json
node -p "
JSON.stringify({
  ...require('./template/package.json'),
  name: undefined,
  version: '0.0.1',
}, null, 2)" > template/new-package.json

mv template/new-package.json template/package.json

echo "Vendored starter project into template folder"
