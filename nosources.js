const fs = require('fs')

const sourceMap = JSON.parse(fs.readFileSync('index.js.map'))
sourceMap.sourcesContent = []
fs.writeFileSync('index.js.map', JSON.stringify(sourceMap))
