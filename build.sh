#!/bin/bash
./node_modules/.bin/tsc src/iframe-overlay.ts --outDir lib  --target ES5 --declaration --module commonjs --removeComments &&
mkdir -p dist &&
./node_modules/.bin/browserify lib/iframe-overlay.js --standalone iframeOverlay --outfile dist/iframe-overlay.js
