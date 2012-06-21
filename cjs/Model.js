exports.Model={}.undefined;with(require("../lib/util/Is"))
with(exports)(function(){with(this){
require: '../lib/util/Is';

exports: Model

/*
---
name: Model

description: Model to handle data

version: .10

license: TBD

authors:
- Garrick Cheung

requires:
- MooTools-Core/1.3
- Company
- Is.js

provides: [Model]

...
*/

// (function(context){

var Silence = require('../mixins/silence');

var createGetter = function(type){
    /**
     * isPrevious is a parameter to be passed into custom getter accessors.
     * This will allow the getter to know whether it should be retrieving from _data or _previousData.
     * @type {Boolean}
     */
    var isPrevious = type == '_previousData' || void 0;

    return function(prop){
        var val = this[type][prop],
            accessor = this.getAccessor[prop],
            getter = accessor && accessor.get;

        return getter ? getter.call(this, isPrevious) : val;
    }.overloadGetter();
};

var Model = new Class({
    Implements: [Events, Options, Silence],

    _data: {},

    _changed: false,

    _changedProperties: {},

    _previousData: {},

    _accessors: {
        /*
        key: {
            set: function(){},
            get: function(isPrevious){},
        }
        */
    },

    options: {
        // onChange: function(){},
        // 'onChange:key': function(){},
        // onDestroy: function(){},
        accessors: {},
        defaults: {},
        silent: false
    },

    initialize: function(data, options){
        if (instanceOf(data, this.constructor)) {
            return data;
        }

        this.setup(data, options);
    },

    setup: function(data, options){
        this.setOptions(options);

        this.setAccessor(this.options.accessors);

        // Silent property determines whether model will excute signals
        this.silence(this.options.silent);

        if (data) { this._data = Object.merge({}, this.options.defaults, data); }

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
        // Store the older pr
        var old = this._data[prop],
            accessor = this.getAccessor(prop),
            setter = accessor && accessor.set;

        // Dereference the new val
        if (Is.Array(val)) {
            val = val.slice();
        } else if(Is.Object(val)){
            val = Object.clone(val);
        }

        if (!Is.Equal(old, val)) {
            this._changed = true;

            this._changedProperties[prop] = val;

            /**
             * Use the custom setter accessor if it exists.
             * Otherwise, set the property in the regular fashion.
             */
            if (setter) {
                setter.apply(this, arguments);
            } else {
                this._data[prop] = val;
            }
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
        // store the previously changed properties
        this._setPreviousData();

        this._set(prop, val);
        
        this.changeProperty(this._changedProperties);

        this.change();
        
        // reset changed and changed properties
        this._resetChanged();

        return this;
    },

    /**
     * Unset a data property. It can not be erased so it will be set to undefined
     *
     * @param  {[type]} prop Property name to be unset
     * @return {Class} The Model instance
     */
    unset: function(prop){
        // void 0 is used because 'undefined' is a var that can be changed in some browsers
        this.set(prop, void 0);

        return this;
    },

    /**
     * Retrieve the stored property
     *
     * @param  {String} prop Property name to retrieve
     * @return Value referenced by prop param
     */
    get: createGetter('_data'),

    /**
     * Retrieve entire data object in Model instance
     *
     * @return {Object}
     */
    getData: function(){
        /** Should the data be cloned instead of referenced? */
        return this.clone();
        //return this._data;
    },
    
    _setPreviousData: function(){
        this._previousData = Object.clone(this._data);
        
        return this;
    },
    
    getPrevious: createGetter('_previousData'),
    
    getPreviousData: function(){
        return Object.clone(this._previousData);
    },
    
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
            this.signalChangeProperty(prop, val);
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
    
    signalChangeProperty: function(prop, val){
        !this.isSilent() && this.fireEvent('change:' + prop, [this, prop, val]);
        return this;
    },
    
    signalDestroy: function(){
        !this.isSilent() && this.fireEvent('destroy', this);
        return this;
    },

    toJSON: function(){
        return this.clone();
    },

    setAccessor: function(key, val){
        this._accessors[key] = val;

        return this;
    }.overloadSetter(),

    getAccessor: function(key){
        return this._accessors[key];
    }.overloadGetter(),

    unsetAccessor: function(key){
        delete this._accessors[key];
        this._accessors[key] = undefined;

        return this;
    }
});

['clone', 'subset', 'map', 'filter', 'every', 'some', 'keys', 'values', 'getLength', 'keyOf', 'contains', 'toQueryString'].each(function(method){
    Model.implement(method, function(){
        return Object[method].apply( Object, [this._data].append( Array.from(arguments) ) );
    });
});

// }(typeof exports != 'undefined' ? exports : window));

}}.call(exports));