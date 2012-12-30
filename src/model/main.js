var Model = require('./model').Model,
    Butler = require('../../mixins/butler').Butler,
    Snitch = require('../../mixins/snitch').Snitch,
    signalFactory = require('../../utils/signalFactory');

/**
 * Create the get/getPrevious functions with the type to define what accessor to retrieve
 * @param  {String} type It is used to define what accessor to retrieve, a get or getPrevious
 * @return {Function}
 */
var curryGetter = function(type){
    return function(prop){
        var accessor = this.getAccessor(prop, type),
            accessorName = this._accessorName;

        /**
         * Prevent recursive get calls by checking if it's currently accessing
         * and if the accessor name is the same as the property arg. If all positive,
         * then return the value from _data/_previousData, otherwise return from 
         * the accessor function. Fallback to returning from the _data/_previousData
         * if an accessor function does not exist.
         */
        if (accessor && accessorName != prop) {
            return accessor();
        }

        return this.parent(prop);
    }.overloadGetter();
};

Model.implement(new Butler);
Model.implement(new Snitch);
Model.implement(
    signalFactory(
        ['error'],
        {
            signalErrorProperty: function(prop, val){
                !this.isSilent() && this.fireEvent('error:' + prop, [this, prop, val]);
            }
        }
    )
);

exports.Model = new Class({
    Extends: Model,

    _errored: false,

    _erroredProperties: {},

    setup: function(data, options){
        this.setupAccessors(this.options.accessors);

        this.setupValidators(this.options.validators);

        this.parent(data, options);

        return this;
    },

    __set: function(prop, val){
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
        if (accessor && this._accessorName != prop) {
            return accessor.apply(this, arguments);
        }

        /**
         * Validate the property value. validate method will
         * check for existence of a a validator
         */
        if (!this.validate(prop, val)) {
            this._errored = true;
            this._erroredProperties[prop] = val;
            return this;
        }

        return this.parent(prop, val);
    }.overloadSetter(),

    set: function(prop, val){
        this.parent(prop, val);

        if (!this.isSetting() && this._errored) {
            // Signal any errored properties
            this._onErrorProperty(this._erroredProperties);

            // Signal error
            this.signalError();

            // reset errored and errored properties
            this._resetErrored();
        }

        return this;
    },

    get: curryGetter('get'),

    getPrevious: curryGetter('getPrevious'),

    _resetErrored: function(){
        if (this._errored) {
            // reset the errored
            this._errored = false;

            // reset errored properties
            this._erroredProperties = {};
        }

        return this;
    },

    _onErrorProperty: function(prop, val){
        this.signalErrorProperty(prop, val);

        return this;
    }.overloadSetter(),

    setAccessor: function(name, val){
        if (name && val) {
            /**
             * Create a getPrevious method that is the get method,
             * but passed a true arg to signify it should access _previousData
             * while the get method gets passed a false value to signify it
             * should access _data.
             */
            if (val.get && !val.getPrevious) {
                val.getPrevious = val.get;
            }

            /**
             * Continue with the parent setAccessor so 
             * the set/get/getPrevious are decorated
             */
            this.parent(name, val);
        }

        return this;
    }.overloadSetter(),

    validate: function(prop, val){
        // If the global validator exists, then all validation pipes through it
        // Otherwise, use the prop referenced validator
        return (this.getValidator('*') || this.parent).call(this, prop, val);
    },

    proof: function(){
        return this.parent(this.getData());
    }
});