require('mootools');

var config = module.exports;

config["Neuro - Node"] = {
    rootPath: "../",
    // environment: "browser",
    environment: "node",
    tests: [
        "test/**/*-test.js"
    ]
};

config["Neuro - Browser"] = {
    extends: "Neuro - Node",
    environment: "browser",
    sources: [
        "test/assets/js/mootools-core.js",
        "neuro.js"
    ],
}