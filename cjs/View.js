exports.View={}.undefined;with(require("../utilities/Is"))
with(exports)(function(){with(this){
require: '../utilities/Is';

exports: View

// (function(context){
    var Unit = require('company').Unit;
    //var Is =  require('is')
    
    // creates functions to subscribe/unsubscribe based on handlers
    var subCurry = function(bindType){
        return function(){
            var prefix = this.getPrefix();

            // Prepare the prefix to prepend to the keys for subscribe/unsubscribing
            prefix && (prefix += '.');

            Object.each(this.subscriberMap, function(val, key){
                var methods = Array.from(val),
                    len = methods.length,
                    i = 0, method;

                // Create the object with all the methods
                while(len--){
                    // get the method name, or function
                    method = methods[i++];

                    // Subscribe/unsubscribe function or the bound method
                    this[bindType](prefix + key, Is.Function(method) ? method : this.bound(method));
                }
                
            }, this);

            return this;
        }
    };

    var View = new Class({
        Implements: [Class.Binds, Options, Unit],

        // Model publishers / View methods mapping
        subscribeMap: undefined,

        element: undefined,

        options: {
            subscribeMap: {
                'change': ['render']
                ,'destroy': 'destroy'
                // ,'change:id': function(){}
            }
        },

        initialize: function(data, options){
            this.setup(data, options);
        },

        setup: function(data, options){
            this.setOptions(options);

            this.subscribeMap = this.options.subscribeMap;

            this.setPrefix(this.options.Prefix);

            this.setupUnit();

            this.bindModel();

            this.render(data);

            return this;
        },

        attachEvents: function(){ return this; },

        detachEvents: function(){ return this; },

        bindModel: subCurry('subscribe'),

        unbindModel: subCurry('unsubscribe'),
        
        create: function(){
            return this;
        },

        render: function(data){
            this.create();
            
            this.attachEvents();

            return this;
        },

        destroy: function(){
            var element = this.element;

            this.detachEvents();

            this.element = (element && element.destroy(), undefined);

            return this;
        }
    });
// })(typeof exports != 'undefined' ? exports : window);

}}.call(exports));