var Connector = require('../mixins/connector').Connector,
    Silence = require('../mixins/silence').Silence,
    signalFactory = require('../utils/signalFactory');

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

var Signals = new Class(
    signalFactory(
        ['ready', 'render', 'dispose', 'destroy'],
        {
            signalInject: function(reference, where){
                !this.isSilent() && this.fireEvent('inject', [this, reference, where]);
                return this;
            }
        }
    )
);

var View = new Class({
    Implements: [Connector, Events, Options, Silence, Signals],

    /**
     * Root element - contains all the elements that is to be created
     */
    // element: undefined,

    options: {
        // onReady: function(){},
        // onRender: function(){},
        // onInject: function(){},
        // onDispose: function(){},
        // onDestroy: function(){},
        element: undefined,
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
        if (element){
            this.element && this.destroy();

            element = this.element = document.id(element);
            if (element) {
                this.attachEvents();
            }
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
     * @param {Mixed} data While the argument is not used in the current render function,
     * it is there to help you understand that data should passed in to be used during
     * the render process.
     */
    render: function(data){
        this.signalRender();
        return this;
    },

    /**
     * Inject the root element into another element or View instance. document.id will resolve the element from the View instance
     * @param  {Element | View} reference Element or View instance
     * @param  {String} where Defaults to Element.inject 'bottom' value
     * @return {Class} View instance
     */
    inject: function(reference, where){
        if (this.element){
            reference = document.id(reference);

            where = where || 'bottom';

            this.element.inject(reference, where);
            this.signalInject(reference, where);
        }

        return this;
    },

    /**
     * Dispose the element and signal dipose event
     */
    dispose: function(){
        if (this.element) {
            this.element.dispose();
            this.signalDispose();
        }

        return this;
    },

    /**
     * Detach the events, destroy the element from DOM and remove the reference to the element
     * before signaling destroy event
     */
    destroy: function(){
        var element = this.element;
        
        if (element){
            element && (this.detachEvents(), element.destroy(), this.element = undefined);
            
            this.signalDestroy();
        }
        return this;
    }
});

exports.View = View;