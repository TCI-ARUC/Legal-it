#!/usr/bin/env bash
# Minify CSS/JS na het bewerken van de bronbestanden (css/styles.css, js/main.js)
set -e
npx --yes esbuild css/styles.css --minify --outfile=css/styles.min.css
npx --yes esbuild js/main.js --minify --outfile=js/main.min.js
echo "Geminificeerd: css/styles.min.css + js/main.min.js"
