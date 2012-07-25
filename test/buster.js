var config = module.exports;

config["Neuro"] = {
    rootPath: "../",
    environment: "browser", // or "node"
    sources: [
        "test/assets/js/mootools-core.js",
        "neuro.js"
    ],
    tests: [
        // "test/*-test.js"
        "test/model-test.js",
        "test/collection-test.js",
        "test/view-test.js"
    ]
};