// take package.json from repo root and add wasm-packs output files
// write that back to the wasm-pack output dir to make nodejs based test work

import fs from 'fs'

const rootPkgFile = fs.readFileSync('package.json', 'utf-8')
const rootPkg = JSON.parse(rootPkgFile)

const wasmPkgFile = fs.readFileSync('./pkg/package.json', 'utf-8')
const wasmPkg = JSON.parse(wasmPkgFile)

rootPkg.files = wasmPkg.files
rootPkg.main = wasmPkg.main
rootPkg.types = wasmPkg.types

fs.writeFileSync('./pkg/package.json', JSON.stringify(rootPkg, null, 2), 'utf-8')