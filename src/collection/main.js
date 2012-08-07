var Collection = require('./collection').Collection,
    Model = require('../model/main').Model,
    Snitch = require('../../mixins/snitch').Snitch;

var validateFnc = function(val, prop){
    return this.parent(prop, val);
};

Collection.implement(new Snitch);

exports.Collection = new Class({
    Extends: Collection,

    setup: function(models, options){
        this.setupSnitch();

        this.parent(models, options);

        return this;
    },

    _add: function(model, at){
        /**
         * Validate data, not a model instance.
         */
        this.validate( instanceOf(model, Model) ? model.getData() : model ) && this.parent(model, at)

        return this
    },

    /**
     * Validate every property in a model
     * @param  {Object | Model | Array} models An object, a model instance, or an array mix of both to be validated
     * @return {Boolean} True if all properties in the models validate
     */
    validate: function(models){
        models = Array.from(models);

        return models.every(function(model){
            return instanceOf(model, Model) 
                ? model.every(validateFnc, this) 
                : Object.every(model, validateFnc, this);
        }, this);
    },

    /**
     * Proof every property in the models. Every validator property needs to exist in the model
     * 
     * @param  {Object | Model | Array} models An object, a model instance, or an array mix of both to be proofed
     * @return {Boolean} True if all properties in the models proof, false otherwise.
     */
    proofModel: function(models){
        models = Array.from(models);

        return models.every(function(model){
            return Snitch.proof(
                instanceOf(model, Model)
                    ? model.getData()
                    : model,
                this._validators, this
            );
        }, this);
    },

    /**
     * Proof every model in the collection
     * @return {Boolean} True if all properties in the collection's models proof, false otherwise.
     */
    proof: function(){
        return this.proofModel(this._models);
    }
});