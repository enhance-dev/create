#!/bin/sh
# This script is used to vendor the starter project into this create project.
rm -rf vendor # in case it exists
cp -r node_modules/@enhance/starter-project vendor
# Remove files/folders we don't need
rm -rf vendor/.github/
rm -rf vendor/scripts/
rm vendor/manifest.json
rm vendor/readme.md
rm vendor/CHANGELOG.md
rm vendor/LICENSE
# run further cleanup with Node
node scripts/clean.cjs
