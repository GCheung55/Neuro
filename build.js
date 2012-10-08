var fs = require('fs')
,   wrup = require('wrapup')()
,   root = __dirname + '/';

// Write the neuro.js file

var neuro = wrup.require('Neuro', './')
,   src = neuro.up()
,   compressed = neuro.up({compress: true});

var writeNeuro = function(){
    fs.writeFile(root + 'neuro.js', src);
    fs.writeFile(root + 'neuro-min.js', compressed);
    console.log('Neuro created.');
};

writeNeuro();