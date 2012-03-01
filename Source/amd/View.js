define(function(require, exports, module){
var __MODULE0__ = require("../libs/mootools-class-extras/Source/Class.Binds");
var Unit, modelBinder;
;

exports.View

// (function(context){
    Unit = require('../libs/Company/Source/Company').Unit;

    // creates functions to subscribe/unsubscribe based on handlers
    modelBinder = function(bindType){
        return function(){
            var prefix = this.getPrefix();

            prefix && (prefix += '.');

            Object.keys(this.handlers).each(function(type){
                var obj = {},
                    methods = Array.from(this.handlers[type]),
                    len = methods.length,
                    i = 0;

                while(len--){
                    obj[prefix + type] = this.bound(methods[i++]);
                }

                this[bindType](obj);
            }, this);

            return this;
        }
    };

    exports.View = new Class({
        Implements: [Class.Binds, Options, Unit],

        // Model publishers / View methods mapping
        handlers: undefined,

        element: undefined,

        options: {
            handlers: {
                'change': ['render'],
                'destroy': 'destroy'
            }
        },

        initialize: function(data, options){
            this.setup(data, options);
        },

        setup: function(data, options){
            this.setOptions(options);

            this.handlers = this.options.handlers;

            this.setPrefix(this.options.Prefix);

            this.setupUnit();

            this.bindModel();

            this.render();

            return this;
        },

        attachEvents: function(){ return this; },

        detachEvents: function(){ return this; },

        bindModel: modelBinder('subscribe'),

        unbindModel: modelBinder('unsubscribe'),

        render: function(){
            this.attachEvents();

            return this;
        },

        destroy: function(){
            this.detachEvents();

            this.element = (this.element.destroy(), undefined);

            return this;
        }
    });
// })(typeof exports != 'undefined' ? exports : window);
});