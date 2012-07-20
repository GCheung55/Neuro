// (function(context){

var Is = require('neuro-is').Is,
    Silence = require('../mixins/silence').Silence,
    Connector = require('../mixins/connector').Connector,
    CustomAccessor = require('../mixins/customAccessor').CustomAccessor;

var curryGetter = function(type){
    /**
     * isPrevious is a parameter to be passed into custom getter accessors.
     * This will allow the getter to know whether it should be retrieving from _data or _previousData.
     * @type {Boolean}
     */
    var isPrevious = type == '_previousData' || void 0;

    return function(prop){
        var accessor = this.getAccessor(prop, 'get');

        return accessor ? accessor.call(this, isPrevious) : this[type][prop];
    }.overloadGetter();
};

var curryGetData = function(type){
    return function(){
        var props = this.keys(),
            obj = {};

        props.each(function(prop){
            var val = this[type](prop);
            switch(typeOf(val)){
                case 'array':
                    val = val.slice(); break;
                case 'object':
                    if (!val.$constructor || (val.$constructor && !instanceOf(val.$constructor, Class))){
                        val = Object.clone(val);
                    }
                    break;
            }

            obj[prop] = val;
        }.bind(this));

        return obj;
    };
};

var Model = new Class({
    Implements: [Connector, CustomAccessor, Events, Options, Silence],

    primaryKey: undefined,

    _data: {},

    _defaults: {},

    _changed: false,

    _changedProperties: {},

    _previousData: {},

    _accessors: {
        /*
        key: {
            // Must return a value that is NOT null in order to mark this model changed by this property change
            set: function(prop, val){return val;},

            // isPrevious flag lets you choose whether to pull data from this._data or this._previousData
            get: function(isPrevious){
                //Example
                var data = isPrevious ? this._data : this._previousData;
                return data['somekey'];
            },
        }
        */
    },

    options: {
        // onChange: function(){},
        // 'onChange:key': function(){},
        // onDestroy: function(){},
        // onReset: function(){},
        primaryKey: undefined,
        accessors: {},
        defaults: {}
    },

    initialize: function(data, options){
        if (instanceOf(data, this.constructor)) {
            return data;
        }

        this.setup(data, options);
    },

    setup: function(data, options){
        this.setOptions(options);

        this.primaryKey = this.options.primaryKey;

        this.setupAccessors();

        // properly set the defaults object
        Object.merge(this._defaults, this.options.defaults);

        // Set the _data defaults silently because listeners shouldn't need to know that the defaults have been defined
        this.silence(function(){
            this.set(this._defaults);
        }.bind(this));

        // Just set the data instead of Object merging. This will skip cloning Class instances.
        if (data) { this.set(data); }

        return this;
    },

    /**
     * Store the key/value pair in the Model instance
     * Signal to property referenced change listener if property value is changed
     *
     * @param  {String} prop Property name to be stored
     * @param  {Array|Function|Number|Object|String} val Property value to be stored
     * @return {Class} The Model instance
     */
    _set: function(prop, val){
        // Store the older prop
        var old = this.get(prop);

        switch(typeOf(val)){
            // Dereference the new val if it's an Array
            case 'array': val = val.slice(); break;
            // Or an Object but not an instance of Class
            case 'object':
                if (!val.$constructor || (val.$constructor && !instanceOf(val.$constructor, Class))){
                    val = Object.clone(val);
                }
                break;
        }

        if (!Is.Equal(old, val)) {
            this._changed = true;

            this._data[prop] = this._changedProperties[prop] = val;

            return this;
        }

        return this;
    }.overloadSetter(),

    /**
     * Store the key/value pair in the Model instance
     *
     * @param  {String} prop Property name to be stored
     * @param  {Array|Function|Number|Object|String} val Property value to be stored
     *         Function property will be invoked with 'call', bound to the Model instance
     * @return {Class} The Model instance
     */
    set: function(prop, val){
        if (prop) {
            /**
             * Use the custom setter accessor if it exists.
             * Otherwise, set the property in the regular fashion.
             */
            var accessor = this.getAccessor(prop, 'set');

            /**
             * If the accessor is true, then run it, and return false
             * to the if statement to prevent it from continuing to 
             * run through the code block
             */
            if (!accessor || (accessor.apply(this, arguments), false) ) {
                // store the previously changed property
                this._setPrevious(this.getData());

                this._set(prop, val);
                
                this.changeProperty(this._changedProperties);

                this.change();
                
                // reset changed and changed properties
                this._resetChanged();
            }
        }

        return this;
    },

    /**
     * Unset a data property. It can not be erased so it will be set to undefined
     *
     * @param  {String|Array} prop Property name/names to be unset
     * @return {Class} The Model instance
     */
    unset: function(prop){
        var props = {},
            len, i = 0, item;

        prop = Array.from(prop);
        len = prop.length;
        
        while(len--){
            props[prop[i++]] = void 0;
        }

        // void 0 is used because 'undefined' is a var that can be changed in some browsers
        this.set(props);

        return this;
    },

    reset: function(prop){
        var props = {},
            len, i = 0, item;
        
        if (prop) {
            prop = Array.from(prop);
            len = prop.length;
            
            while(len--){
                item = prop[i++];
                props[item] = this._defaults[item];
            }
        } else {
            props = this._defaults;
        }

        this.set(props);

        this.signalReset();

        return this;
    },

    /**
     * Retrieve the stored property
     *
     * @param  {String} prop Property name to retrieve
     * @return Value referenced by prop param
     */
    get: curryGetter('_data'),

    /**
     * Retrieve entire data object in Model instance
     *
     * @return {Object}
     */
    getData: curryGetData('get'),
    
    _setPrevious: function(prop, val){
        this._previousData[prop] = val;
        return this;
    }.overloadSetter(),
    
    getPrevious: curryGetter('_previousData'),
    
    getPreviousData: curryGetData('getPrevious'),
    
    _resetChanged: function(){
        if (this._changed) {
            // reset the changed
            this._changed = false;
    
            // reset changed properties
            this._changedProperties = {};
        }
        
        return this;
    },

    /**
     * Signal to 'change' listener if model has changed
     *
     * @return {[type]}
     */
    change: function(){
        if (this._changed) {
            this.signalChange();
        }

        return this;
    },

    /**
     * Signal to 'change:prop' listener if model property has changed
     * @param  {String} prop Name of property
     * @return {[type]}
     */
    changeProperty: function(prop, val){
        if (this._changed) {
            this.signalChangeProperty(prop, val, this.getPrevious(prop));
        }

        return this;
    }.overloadSetter(),

    /**
     * Signal to 'destroy' listener if model is to be destroyed
     *
     * @return {[type]}
     */
    destroy: function(){
        this.signalDestroy();

        return this;
    },
    
    signalChange: function(){
        !this.isSilent() && this.fireEvent('change', this);
        return this;
    },
    
    signalChangeProperty: function(prop, newVal, oldVal){
        !this.isSilent() && this.fireEvent('change:' + prop, [this, prop, newVal, oldVal]);
        return this;
    },
    
    signalDestroy: function(){
        !this.isSilent() && this.fireEvent('destroy', this);
        return this;
    },

    signalReset: function(){
        !this.isSilent() && this.fireEvent('reset', this);
        return this;
    },

    toJSON: function(){
        return this.getData();
    },

    /**
     * Add a listener to the property change
     * @param  {String|Object}  prop    String or object of string/function pairs
     * @param  {Function}   callback    Function that is executed upon event firing
     * @return {Class}  Class instance
     */
    spy: function(prop, callback){
        if ((typeOf(prop) == 'string' && prop in this._data) && typeOf(callback) == 'function' ) {
            this.addEvent('change:' + prop, callback);
        }

        return this;
    }.overloadSetter(),

    /**
     * Remove a listener to the property change
     * @param  {String|Object}  prop    String or object of string/function pairs
     * @param  {Function}   callback    Function that is executed upon event firing.
     * @return {Class}  Class instance
     */
    unspy: function(prop, callback){
        if ((typeOf(prop) == 'string' && prop in this._data)) {
            this.removeEvents('change:' + prop, callback);
        }

        return this;
    }.overloadSetter()
});

['subset', 'map', 'filter', 'every', 'some', 'keys', 'values', 'getLength', 'keyOf', 'contains', 'toQueryString'].each(function(method){
    Model.implement(method, function(){
        return Object[method].apply( Object, [this._data].append( Array.from(arguments) ) );
    });
});

exports.Model = Model;
// }(typeof exports != 'undefined' ? exports : window));
