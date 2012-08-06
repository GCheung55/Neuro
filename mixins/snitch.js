/**
 * Snitch, the test runner. Tells on you if you don't pass the inspection
 * @type {Class}
 */
exports.Snitch = new Class({
    _specs: undefined,

    options: {
        specs: undefined
    },

    setupSpecs: function(){
        this.options.specs && this.setSpecs(this.options.specs);

        return this;
    },

    setSpecs: function(specs){
        this._specs = specs && Object.clone(specs) || undefined;
    },

    getSpecs: function(name){
        return this._specs;
    },

    inspect: function(obj){
        var specs = this.getSpecs();

        /**
         * Every spec item needs to exist in the obj. Every spec also needs to pass
         */
        return Object.every(specs, function(spec, name){
            return !!(name in obj) && spec.call(this, obj[name]);
        }, this);
    }
});