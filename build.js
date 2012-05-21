var link = require('./lib/link/Source/Library/link.js')
,   fs = require('fs')
,   wrup = require('wrapup')()
,   EventEmitter = require('events').EventEmitter
,   emitter = new EventEmitter;

var srcPath = 'Source/'
,   writePath = 'cjs/';

var writeCount = 0
,   numFiles = 0;

emitter.addListener('writeComplete', function(){
    // Once the number of read files equals the number of written files
    // write the neuro.js file
    if (writeCount == numFiles) {
        var src = wrup.require('Neuro', './' + writePath + 'main.js').up();

        fs.writeFile('./neuro.js', src);
        console.log('Neuro created.');
    }
});

fs.readdir(srcPath, function(err, files){
    var len = files.length
    ,   i = 0, name, fileWrites = 0;

    while(len--){
        name = files[i++];

        !function(path, name){
            fs.stat(path, function(err, stat){
                if (!stat.isDirectory()) {
                    fs.readFile(path, function(err, data){
                        // Increase the number of files that are being read
                        numFiles++;

                        var converted = link.parse(data).convert({cjs: true});
                        
                        fs.writeFile(writePath + name, converted, function(){
                            // Increase the number of files that have been written
                            writeCount++;

                            // Emit that a write has been completed so that once all files have been written
                            // neuro.js build can be written
                            emitter.emit('writeComplete');
                        });
                    });
                }
            });
        }(srcPath + name, name);
    }
});