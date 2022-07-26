#!/bin/sh
rm -rf vendor 
cp -r node_modules/@enhance/starter-project vendor 
rm -rf vendor/.github 
rm -rf vendor/scripts
rm -rf vendor/manifest.json
node scripts/clean.cjs
