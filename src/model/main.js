var Model = require('./model').Model,
    Butler = require('../../mixins/butler').Butler
    Validator = require('../../mixins/validator').Validator,
    signalFactory = require('../../utils/signalFactory');

var curryGetter = function(isPrevious){
    return function(prop){
        var accessor = this.getAccessor(prop, isPrevious ? 'getPrevious' : 'get'),
            // accessing = this.isAccessing(),
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

var Signals = new Class(
    signalFactory(
        ['error'],
        {
            signalErrorProperty: function(prop, newVal, oldVal){
                !this.isSilent() && this.fireEvent('error:' + prop, [this, prop, newVal, oldVal]);
                return this;
            }
        }
    )
);

Model.implement(new Butler);

exports.Model = new Class({
    Extends: Model,

    Implements: [Signals, Validator],

    setup: function(data, options){
        this.setupAccessors();

        this.setupValidators();

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

        return this.parent(prop, val);
    }.overloadSetter(),

    set: function(prop, val){
        var validator;
        if (prop) {
            this.hasValidators() && this.validate(prop, val);

            if (this._errored) {
                // Signal any errored properties
                this._erroredProperty(this._erroredProperties);

                // Signal error
                this.signalError();

                // reset errored and errored properties
                this._resetErrored();
            } else {
                this.parent(prop, val);
            }
        }

        return this;
    },

    get: curryGetter(),

    getPrevious: curryGetter(true),

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

    _errorProperty: function(object, basePath){
        
    },

    _resetErrored: function(){
        this._errored = false;
        this._erroredProperties = {};
        return this;
    },

    /**
     * Tests model data against validators
     * @return {Boolean}
     */
    isValid: function(){
        var isValid = (this.hasValidators() && this.validate(this.getData()), this._errored);

        return !!(this._resetErrored(), isValid);
    },

    validate: function(prop, val){
        /**
         * Test against individual validators.
         * @type {[type]}
         */
        var validator = this.getValidator(prop);
        if (validator && !validator(val)) {
            this._errored = true;
            this._deepSet(this._erroredProperties, prop, val);
        }

        return this;
    }.overloadSetter()
});