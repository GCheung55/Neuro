var Collection = require('./src/collection/main').Collection,
    Route = require('./src/router/route').Route;

var Router = new Class({
    Extends: Collection,

    options: {
        Model: Route
    }
});

exports.Router = Router;