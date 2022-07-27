#!/bin/sh
rm -rf vendor 
cp -r node_modules/@enhance/starter-project vendor 
rm -rf vendor/.github 
rm -rf vendor/scripts
rm -rf vendor/manifest.json
rm vendor/readme.md
node scripts/clean.cjs
