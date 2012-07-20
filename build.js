var fs = require('fs')
,   wrup = require('wrapup')();

// Write the neuro.js file

var neuro = wrup.require('Neuro', './')
,   src = neuro.up()
,   compressed = neuro.up({compress: true});

fs.writeFile('./neuro.js', src);
fs.writeFile('./neuro-min.js', compressed);
console.log('Neuro created.');