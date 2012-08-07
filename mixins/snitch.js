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

        }
    },

    setupSnitch: function(){
        // reference the validators
        var validators = this._validators;

        // reset the validators
        this._validators = {};

        // process the validators
        this.setValidator(Object.merge({}, validators, this.options.validators));
        return this;
    },

    setValidator: function(prop, fnc){
        var orig = fnc;
        
        if (!fnc._orig) {
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
            pass = validator.call(this, val);
        }

        return pass;
    },

    /**
     * Proof the object that it has every item that this.validators has
     * and that every validator passes.
     * @param  {Object} obj        Object to validate
     * @return {Boolean}           The answer to whether the object passes or not
     */
    proof: function(obj){
        return Snitch.proof(obj, this._validators, this);
    }
});

/**
 * Proof the object that it has every item that validators has
 * and that every validator passes.
 * @param  {Object} obj        Object to validate
 * @param  {Object} validators Object to validate against
 * @return {Boolean}           The answer to whether the object passes or not
 */
Snitch.proof = function(obj, validators, bind){
    return Object.every(validators, function(fnc, prop){
        return (prop in obj) && fnc(obj[prop]);
    }, bind);
};

exports.Snitch = Snitch;