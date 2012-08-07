var Neuro = require('./Neuro');

Neuro.Model = require('./model/main').Model;
Neuro.Collection = require('./collection/main').Collection;
Neuro.View = require('./view/main').View;

//Mixins
Neuro.Mixins = {
    Butler: require('../mixins/butler').Butler,
    Connector: require('../mixins/connector').Connector,
    Silence: require('../mixins/silence').Silence,
    Snitch: require('../mixins/Snitch').Snitch
};

exports = module.exports = Neuro;