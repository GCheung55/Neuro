var link = require('./lib/link/Source/Library/link.js')
,   fs = require('fs')
,   wrup = require('wrapup')();

// Write the neuro.js file

var src = wrup.require('Neuro', './').up();

fs.writeFile('./neuro.js', src);
console.log('Neuro created.');