exports.setup = function(Testigo){
    require('../model/model').setup(Testigo);
    require('./collection').setup(Testigo);
};