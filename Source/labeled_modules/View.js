require: '../libs/mootools-class-extras/Source/Class.Binds', '../utilities/Is';

exports: View

// (function(context){
    var Unit = require('../libs/Company/Source/Company').Unit;

    // creates functions to subscribe/unsubscribe based on handlers
    var bridgeEnds = function(bindType){
        return function(){
            var prefix = this.getPrefix();

            prefix && (prefix += '.');

            Object.keys(this.bridges).each(function(type){
                var obj = {},
                    methods = Array.from(this.handlers[type]),
                    len = methods.length,
                    i = 0, method;

                while(len--){
                    method = methods[i++];
                    obj[prefix + type] = Is.Function(method) ? method : this.bound(method);
                }

                this[bindType](obj);
            }, this);

            return this;
        }
    };

    var View = new Class({
        Implements: [Class.Binds, Options, Unit],

        // Model publishers / View methods mapping
        bridges: undefined,

        element: undefined,

        options: {
            bridges: {
                'change': ['render'],
                'destroy': 'destroy',
                'change:id': function(){}
            }
        },

        initialize: function(data, options){
            this.setup(data, options);
        },

        setup: function(data, options){
            this.setOptions(options);

            this.bridges = this.options.bridges;

            this.setPrefix(this.options.Prefix);

            this.setupUnit();

            this.bindModel();

            this.render(data);

            return this;
        },

        attachEvents: function(){ return this; },

        detachEvents: function(){ return this; },

        bindModel: bridgeEnds('subscribe'),

        unbindModel: bridgeEnds('unsubscribe'),

        render: function(data){
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