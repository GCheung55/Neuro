// (function(context){

var Is = require('neuro-is').Is,
    Silence = require('../../mixins/silence').Silence,
    Connector = require('../../mixins/connector').Connector,
    signalFactory = require('../../utils/signalFactory');

var separator = '.';

var isObject = function(obj){ return Type.isObject(obj); };

var cloneVal = function(val){
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

    return val;
};

var curryGetter = function(type){
    /**
     * isPrevious is a parameter to be passed into custom getter accessors.
     * This will allow the getter to know whether it should be retrieving from _data or _previousData.
     * @type {Boolean}
     */
    var isPrevious = type == '_previousData' || void 0;

    return function(prop){
        return this._deepGet(this[type], prop, isPrevious);
    }.overloadGetter();
};

var curryGetData = function(type){
    return function(){
        var props = this.keys(),
            obj = {};

        props.each(function(prop){
            // cloneVal will return a cloned of an Array or Object that is not a Class or the val itself
            obj[prop] = cloneVal(this[type](prop));
        }.bind(this));

        return obj;
    };
};

var Signals = new Class(
    signalFactory(
        ['change', 'destroy', 'reset'],
        {
            signalChangeProperty: function(prop, newVal, oldVal){
                !this.isSilent() && this.fireEvent('change:' + prop, [this, prop, newVal, oldVal]);
                return this;
            }
        }
    )
);

var Model = new Class({
    Implements: [Connector, Events, Options, Silence, Signals],

    primaryKey: undefined,

    _data: {},

    // _defaults: {},

    _changed: false,

    _changedProperties: {},

    _previousData: {},

    _setting: 0,

    options: {
        // onChange: function(){},
        // 'onChange:key': function(){},
        // onDestroy: function(){},
        // onReset: function(){},
        primaryKey: undefined,
        defaults: {}
    },

    initialize: function(data, options){
        if (instanceOf(data, this.constructor)) {
            return data;
        }

        this.setOptions(options);

        this.setup(data, options);
    },

    setup: function(data, options){
        this.primaryKey = this.options.primaryKey;

        // Set the _data defaults silently because listeners shouldn't need to know that the defaults have been defined
        this.silence(function(){
            this.set(this.options.defaults);
        }.bind(this));

        // Just set the data instead of Object merging. This will skip cloning Class instances.
        if (data) { this.set(data); }

        return this;
    },

    _deepSet: function(object, path, val){
        path = (typeof path == 'string') ? path.split(separator) : path.slice(0);
        var key = path.pop(),
            len = path.length,
            i = 0,
            current;

        while (len--) {
            current = path[i++];

            object = current in object && typeOf(object[current]) != 'null' ? object[current] : (object[current] = {});

            /**
             * Since the object is a model, lets use its own set method.
             * 
             * Not setting previous here because that's only handled by setting data.
             */
            if (instanceOf(object, Model)) { 
                path = path.slice(i);
                path.push(key)
                object.set(path.join(separator), val);
                return this;
            }
        }

        /**
         * Class instances are typed as Objects
         */
        if (isObject(object)) {
            object[key] = val;
        } else {
            throw new Error('Can not set to this path: ' + path.join(separator));
        }

        return this;
    },

    _deepGet: function(object, path, prev){
        if (typeof path == 'string') {
            path = path.split(separator);
        }

        for (var i = 0, l = path.length; i < l; i++) {
            if (!object) continue;

            if (hasOwnProperty.call(object, path[i])) {
                object = object[path[i]];
            } else if (instanceOf(object, Model)) {
                // A model should be treated differently. And will rely on 'prev' to properly access data
                object = object[prev ? 'getPrevious': 'get'](path[i]);
            } else {
                return object[path[i]];
            }
        }

        return object;
    },

    /**
     * Store the key/value pair in the Model instance
     * Signal to property referenced change listener if property value is changed
     *
     * @param  {String} prop Property name to be stored
     * @param  {Array|Function|Number|Object|String} val Property value to be stored
     * @return {Class} The Model instance
     */
    __set: function(prop, val){
        // Store the older prop
        var old = this.get(prop);

        if (!Is.Equal(old, val)) {
            // cloneVal will return a cloned of an Array or Object that is not a Class or the val itself
            val = cloneVal(val);
            this._deepSet(this._data, prop, val);
            
            this._changed = true;
            this._deepSet(this._changedProperties, prop, val);
        }

        return this;
    }.overloadSetter(),

    _set: function(prop, val){
        /**
         * Increment/decrement _setting value so that calls to set method in
         * custom setters won't trigger change and setPrevious. Doing so during
         * setting would cause discrepancies in previously stored data.
         */
        this._setting++;

        this.__set(prop, val);

        this._setting--;

        return this;
    },

    /**
     * Store the key/value pair in the Model instance
     *
     * @param  {String} prop Property name to be stored
     * @param  {Array|Function|Number|Object|String} val Property value to be stored
     *         Function property will be invoked with 'call', bound to the Model instance
     * @return {Class} The Model instance
     */
    set: function(prop, val){
        var isSetting;

        if (prop) {
            isSetting = this.isSetting();

            // store the previously changed property
            !isSetting && this._setPrevious(this.getData());

            /**
             * If the prop arg is a Model, then we should get all the data to set
             */
            prop = instanceOf(prop, Model) ? prop.getData() : prop;

            this._set(prop, val);

            if (!isSetting) {
                
                if (this._changed) {
                    // Signal any changed properties
                    this._changeProperty(this._changedProperties);

                    // Signal change
                    this.signalChange();
                    
                    // reset changed and changed properties
                    this._resetChanged();
                }
            }
        }

        return this;
    },

    isSetting: function(){
        return !!this._setting;
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
            defaults = this.options.defaults,
            len, i = 0, item;
        
        if (prop) {
            prop = Array.from(prop);
            len = prop.length;
            
            while(len--){
                item = prop[i++];
                props[item] = this._deepGet(defaults, item);
            }
        } else {
            props = defaults;
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
        // reset the changed
        this._changed = false;

        // reset changed properties
        this._changedProperties = {};
        
        return this;
    },

    /**
     * Signal to 'change:prop' listener if model property has changed
     * @param  {String} prop Name of property
     * @return {[type]}
     */
    // _changeProperty: function(prop, val){
    //     this.signalChangeProperty(prop, val, this.getPrevious(prop));

    //     return this;
    // }.overloadSetter(),
    _changeProperty: function(object, basePath){
        basePath = basePath ? basePath + separator : '';

        Object.each(object, function(val, prop){
            var path = basePath + prop,
                newVal = this.get(path), oldVal = this.getPrevious(path),
                newValIsObject = isObject(newVal), oldValIsObject = isObject(oldVal);

            this.signalChangeProperty(path, newVal, oldVal);

            /**
             * Use the val instead of newVal because they're actually different.
             * val is the actually changed value, while newVal contains other values on the object
             *
             * Skip objects that are Class instances. They shouldn't be iterated over anyways.
             */
            newValIsObject && !instanceOf(object, Class) && this._changeProperty(val, path);

            // Report the change of old objects that the new parent value is now not an object
            oldValIsObject && this._changeProperty(oldVal, path);
        }, this);

        return this;
    },

    /**
     * Signal to 'destroy' listener if model is to be destroyed
     *
     * @return {[type]}
     */
    destroy: function(){
        this.signalDestroy();

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
        if ((Type.isString(prop) && prop in this._data) && Type.isFunction(callback)) {
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
        if ((Type.isString(prop) && prop in this._data)) {
            this.removeEvents('change:' + prop, callback);
        }

        return this;
    }.overloadSetter()
});

['each', 'subset', 'map', 'filter', 'every', 'some', 'keys', 'values', 'getLength', 'keyOf', 'contains', 'toQueryString'].each(function(method){
    Model.implement(method, function(){
        return Object[method].apply( Object, [this._data].append( Array.from(arguments) ) );
    });
});

exports.Model = Model;
// }(typeof exports != 'undefined' ? exports : window));
