var Neuro = require('./Neuro');

Neuro.Model = require('./model/main').Model;
Neuro.Collection = require('./collection/main').Collection;
Neuro.View = require('./view/main').View;

Neuro.Router = require('./router/main').Router;
Neuro.Route = require('./route/main').Route;

Neuro.Is = require('neuro-is').Is;

//Mixins
Neuro.Mixins = {
    Butler: require('../mixins/butler').Butler,
    Connector: require('../mixins/connector').Connector,
    Silence: require('../mixins/silence').Silence,
    Snitch: require('../mixins/snitch').Snitch
};

exports = module.exports = Neuro;