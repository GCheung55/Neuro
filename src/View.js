var Connector = require('../mixins/connector').Connector;

/**
 * Events are attached/detached with the returned function
 * options.events is a map that contains a mix of functions
 * or strings of methods names on the view instance. The strings
 * are used to retrieve bound methods from the view instance while
 * the functions are stored on options.events
 */
var eventHandler = function(handler){
    return function(){
        var events = this.options.events,
            element = this.element;

        if (element && events) {
            Object.each(events, function(val, key){
                var methods = Array.from(val),
                    len = methods.length,
                    i = 0, method;

                while(len--){
                    method = methods[i++];
                    this.element[handler](key, typeOf(method) == 'function' ? method : this.bound(method));
                }
            }, this);
        }

        return this;
    }
};

var View = new Class({
    Implements: [Connector, Events, Options],

    /**
     * Root element - contains all the elements that is to be created
     */
    element: undefined,

    options: {
        // onReady: function(){},
        // onRender: function(){},
        // onInject: function(){},
        // onDispose: function(){},
        // onDestroy: function(){},
        events: {
            // 'click': 'nameOfMethod',
            // 'focus': function(){},
            // 'click:relay(a)': ['nameOfMethod', 'nameOfOtherMethod'],
            // 'click:relay(b)': [function(){}, 'nameOfOtherMethod'],
        }
    },

    initialize: function(options){
        this.setup(options);
    },

    setup: function(options){
        this.setOptions(options);

        if (this.options.element) {
            this.setElement(this.options.element);
        }

        this.signalReady();

        return this;
    },

    toElement: function(){
        return this.element;
    },

    setElement: function(element){
        this.element && this.destroy();

        element = this.element = document.id(element);
        if (element) {
            this.attachEvents();
        }

        return this;
    },

    /**
     * Attaches the events found in options.events
     */
    attachEvents: eventHandler('addEvent'),

    /**
     * Detaches the events found in options.events
     */
    detachEvents: eventHandler('removeEvent'),

    /**
     * Override this function with another when extending View
     */
    create: function(){
        return this;
    },

    /**
     * Override this function with another when extending View
     */
    render: function(){
        this.signalRender();
        return this;
    },

    /**
     * Inject an element or View instance. document.id will resolve the element from the View instance
     * @param  {Element | View} reference Element or View instance
     * @param  {String} where Defaults to Element.inject 'bottom' value
     * @return {Class} View instance
     */
    inject: function(reference, where){
        if (instanceOf(reference, View)) {
            reference = document.id(reference);
        }

        where = where || 'bottom';

        this.element.inject(reference, where);
        this.signalInject(reference, where);
        return this;
    },

    /**
     * Dispose the element and signal dipose event
     */
    dispose: function(){
        this.element.dispose();
        this.signalDispose();
        return this;
    },

    /**
     * Detach the events, destroy the element from DOM and remove the reference to the element
     * before signaling destroy event
     */
    destroy: function(){
        var element = this.element;
        element && (this.detachEvents(), element.destroy(), this.element = undefined);
        
        this.signalDestroy();
        return this;
    },

    /**
     * Triggered when the instance's setup method has finished
     */
    signalReady: function(){
        this.fireEvent('ready', this);
        return this;
    },

    /**
     * Triggered when the render method is finished
     */
    signalRender: function(){
        this.fireEvent('render', this);
        return this;
    },

    /**
     * Triggered when the instance's inject method is finished
     */
    signalInject: function(reference, where){
        this.fireEvent('inject', [this, reference, where]);
        return this;
    },

    /**
     * Triggered when the instance's dispose method is finished
     * @return {[type]} [description]
     */
    signalDispose: function(){
        this.fireEvent('dispose', this);
        return this;
    },

    /**
     * Triggered when the instance's destroy method is finished
     * @return {[type]} [description]
     */
    signalDestroy: function(){
        this.fireEvent('destroy', this);
        return this;
    }

});

exports.View = View;