'use strict';

var fs = require('fs')
var wrup = require('wrapup')
var root = __dirname + '/'

var write = function(name){
    return function(err, js) {
        if (err) {
            console.log(name + ' errors?', err)
            return
        }

        fs.writeFile(root + name, js)
        console.log(name + ' write complete.')
    }
}

wrup().require('Neuro', root).up(write('neuro.js'))

wrup({
    compress: true
}).require('Neuro', root).up(write('neuro-min.js'))
