var Model = require('../model/main').Model,
    Silence = require('../../mixins/silence').Silence,
    Connector = require('../../mixins/connector').Connector,
    signalFactory = require('../../utils/signalFactory');

var Signals = new Class(
    signalFactory(
        ['empty', 'sort'],
        signalFactory(
            ['add', 'remove'],
            function(name){
                return function(model){
                    !this.isSilent() && this.fireEvent(name, [this, model]);
                    return this;
                };
            }
        )
    )
);

var Collection = new Class({
    Implements: [Connector, Events, Options, Silence, Signals],

    _models: [],

    _Model: Model,

    length: 0,

    primaryKey: undefined,

    options: {
        // onAdd: function(){},
        // onRemove: function(){},
        // onEmpty: function(){},
        // onSort: function(){},
        primaryKey: undefined,
        Model: undefined,
        // Model Options
        modelOptions: undefined
    },

    initialize: function(models, options){
        this.setOptions(options);
        
        this.setup(models, options);
    },

    setup: function(models, options){
        this.primaryKey = this.options.primaryKey;

        if (this.options.Model) {
            this._Model = this.options.Model;
        }

        if (models) {
            this.add(models);
        }

        return this;
    },

    hasModel: function(model){
        var pk = this.primaryKey,
            has, modelId;

        has = this._models.contains(model);

        // Check via primaryKey if the model exists in the collection
        if (pk && !has) {
            // Check if it's a Model instance to use get method, or check on the object iself for the existence of the pk
            modelId = instanceOf(model, Model) ? model.get(pk) : model[pk];
            
            // the some method will return true if at least one item matches against the comparator
            has = this.some(function(item){
                return modelId === item.get(pk);
            });
        }

        return !!has;
    },

    /**
     * Private add method
     * @param  {Class} model A Model instance
     * @param {Number} at The index at which the model should be inserted
     * @return {Class} Collection Instance
     */
    _add: function(model, at){
        model = new this._Model(model, this.options.modelOptions);

        if (!this.hasModel(model)) {
            // Remove the model if it destroys itself.
            model.addEvent('destroy', this.bound('remove'));

            // If _models is empty, then we make sure to push instead of splice.
            at = this.length == 0 ? void 0 : at;

            if (at != void 0) {
                this._models.splice(at, 0, model);
            } else {
                this._models.push(model);
            }

            this.length = this._models.length;

            this.signalAdd(model);
        }

        return this;
    },

    /**
     * Add a model or models
     * @param {Class || Array} A single Model instance or an array of Model instances
     * @param {Number} at The index at which the model should be inserted
     * @return {Class} Collection Instance
     *
     * @example
     * collectionInstance.add(model, at);
     * collectionInstance.add([model, model], at);
     */
    add: function(models, at){
        models = Array.from(models);

        var len = models.length,
            i = 0;

        while(len--){
            this._add(models[i++], at);
        }

        return this;
    },

    /**
     * Get model by index
     * Overloaded to return an array of models if more than one 'index'
     * argument is passed
     *
     * @param  {Number} index Index of model to return
     * @return {Class || Array} Model instance or Array of Model instances
     */
    get: function(index){
        var len = arguments.length, i = 0, results;

        if (len > 1) {
            results = [];

            while(len--){
                results.push(this.get(arguments[i++]));
            }

            return results;
        }

        return this._models[index];
    },

    /**
     * Private remove method
     * @param  {Class} model A Model instance
     * @return {Class} Collection Instance
     */
    _remove: function(model){
        if (this.hasModel(model)) {
            // Clean up when removing so that it doesn't try removing itself from the collection
            model.removeEvent('destroy', this.bound('remove'));

            this._models.erase(model);

            this.length = this._models.length;
            
            this.signalRemove(model);
        }

        return this;
    },

    /**
     * Remove a model or models
     * @param {Class || Array} A single Model instance or an array of Model instances
     * @return {Class} Collection Instance
     *
     * @example
     * collectionInstance.remove(model);
     * collectionInstance.remove([model, model]);
     */
    remove: function(models){
        // Cloning after converting to an Array because it should be dereferenced
        // in order to continue the while loop when erasing from this._models
        models = Array.from(models).slice();

        var l = models.length,
            i = 0;

        while(l--){
            this._remove(models[i++]);
        }

        return this;
    },

    /**
     * Replace an existing model with a new one
     * @param  {Class} oldModel A Model instance that will be replaced with the new
     * @param  {Object || Class} newModel An object or Model instance that will replace the old
     * @return {Class} Collection Instance
     */
    replace: function(oldModel, newModel){
        var index;

        if (oldModel && newModel && this.hasModel(oldModel) && !this.hasModel(newModel)) {
            index = this.indexOf(oldModel);

            if (index > -1) {
                this.add(newModel, index);

                this.remove(oldModel);
            }
        }

        return this;
    },

    sort: function(fnc){
        this._models.sort(fnc);

        this.signalSort();

        return this;
    },

    reverse: function(){
        this._models.reverse();

        this.signalSort();

        return this;
    },

    empty: function(){
        this.remove(this._models);

        this.signalEmpty();

        return this;
    },

    toJSON: function(){
        return this.map(function(model){
            return model.toJSON();
        });
    }
});

['forEach', 'each', 'invoke', 'every', 'filter', 'clean', 'indexOf', 'map', 'some', 'associate', 'link', 'contains', 'getLast', 'getRandom', 'flatten', 'pick'].each(function(method){
    Collection.implement(method, function(){
        return Array.prototype[method].apply(this._models, arguments);
    });
});

exports.Collection = Collection;