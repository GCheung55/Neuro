exports.Validator = new Class({
    _validators: {},

    options: {
        validators: {
            // 'name': function(prop, val){}
        }
    },

    setupValidators: function(){
        // set everything else.
        this.setValidator(this.options.validators);

        return this;
    },

    hasValidators: function(){
        return !!Object.getLength(this._validators);
    },

    setValidator: function(name, validator){
        Type.isFunction(validator) && (this._validators[name] = validator.bind(this));

        return this;
    }.overloadSetter(),

    getValidator: function(name){
        return this._validators[name];
    }.overloadGetter()
});

