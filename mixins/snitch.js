var asterisk = '*';

var normalizeValidators = function(arg){
    var obj = {};

    if (typeOf(arg) == 'function') {
        obj[asterisk] = arg;
    } else {
        obj = arg;
    }

    return obj;
};

/**
 * A utility class. The spec runner. Validate individual properties or proof
 * an object against the entire spec.
 *
 * Thanks to Elrood Sands (https://github.com/kelexel)
 * 
 * @type {Class}
 * @requires [MooTools-Core]
 */
var Snitch = new Class({
    _validators: {},

    options: {
        validators: {
            // key: function(){}
        }
    },

    setupValidators: function(options){
        // reference the validators
        var validators = this._validators;

        options = options || {}

        // reset the validators
        this._validators = {};

        // process the validators
        this.setValidator(
            Object.merge(
                {}, 
                normalizeValidators(validators), 
                normalizeValidators(options)
            )
        );
        return this;
    },

    setValidator: function(prop, fnc){
        var orig = fnc;
        
        if (fnc && !fnc._orig) {
            fnc = fnc.bind(this);
            fnc._orig = orig;
        }

        this._validators[prop] = fnc;

        return this;
    }.overloadSetter(),

    getValidator: function(prop){
        return this._validators[prop];
    }.overloadGetter(),

    /**
     * Validate key/value pairs.
     * @param  {String} prop Name of validator.
     * @param  {Mixed} val  Item to be tested against validator.
     * @return {Class}      This class instance.
     */
    validate: function(prop, val){
        var validator = this.getValidator(prop),
            pass = true;

        if (validator) {
            pass = validator(val);
        }

        return pass;
    },

    /**
     * Proof the object that it has every item that this._validators has
     * and that every validator passes.
     * @param  {Object} obj        Object to validate
     * @return {Boolean}           The answer to whether the object passes or not
     */
    proof: function(obj){
        var validators = Object.clone(this._validators),
            // Store the global validator
            global = validators[asterisk], keys;

        // If global validator exists, test the object against it
        if (global) {
            // remove '*' validator from validators obj otherwise comparing keys will not pass
            delete validators[asterisk];
            
            // retrieve keys of obj for comparison;
            keys = Object.keys(obj);
            // return global(obj) && Object.every(validators, function(val, prop){ return prop in obj;});
            return global(obj) && Object.keys(validators).every( keys.contains.bind(keys) );
        } else {
            // result and Snitch.proof must return true in order to pass proofing
            return Snitch.proof(obj, validators);
        }
    }
});

/**
 * Proof the object that it has every item that validators has
 * and that every validator passes.
 * @param  {Object} obj        Object to validate
 * @param  {Object} validators Object to validate against
 * @return {Boolean}           The answer to whether the object passes or not
 */
Snitch.proof = function(obj, validators){
    return Object.every(validators, function(fnc, prop){
        return (prop in obj) && fnc(obj[prop]);
    });
};

exports.Snitch = Snitch;