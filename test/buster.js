var config = module.exports;

config["Neuro"] = {
    rootPath: "../",
    environment: "browser",
    // environment: "node",
    sources: [
        "test/assets/js/mootools-core.js",
        "neuro.js"
    ],
    tests: [
        "test/**/*-test.js"
    ]
};