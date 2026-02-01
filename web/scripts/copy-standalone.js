#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const standalone = path.join(root, '.next', 'standalone')
if (!fs.existsSync(standalone)) process.exit(0)

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  fs.cpSync(src, dest, { recursive: true })
}

const publicDir = path.join(root, 'public')
const staticDir = path.join(root, '.next', 'static')
if (fs.existsSync(publicDir)) {
  copyDir(publicDir, path.join(standalone, 'public'))
}
if (fs.existsSync(staticDir)) {
  copyDir(staticDir, path.join(standalone, '.next', 'static'))
}
