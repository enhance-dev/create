#!/bin/sh
# This script is used to vendor the starter project into this create project.
rm -rf template # in case it exists
cp -r node_modules/@enhance/starter-project template
# Remove files/folders we don't need
rm -rf template/.github/
rm -rf template/scripts/
rm template/manifest.json
rm template/readme.md
rm template/CHANGELOG.md
rm template/LICENSE
# run further cleanup with Node
node scripts/clean.js
