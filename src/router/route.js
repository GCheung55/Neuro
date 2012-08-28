var Model = require('./src/model/main').Model;

var Route = new Class({
    Extends: Model,

    options: {
        defaults: {
            // callback: undefined,
            pattern: undefined,
            priority: 0
        },
        accessors: {
            callback: {
                set: function(key, value){
                    this.addEvent('match', value);

                    this.silent(function(){
                        this.unset(key);
                    });

                    return this;
                }
            }
        }
    },

    setup: function(data, options){
        this.parent(data, options);

        

        return this;
    }
});

exports.Route = Route;