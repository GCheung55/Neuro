require: './Model';

exports: Collection

// (function(context){
var Unit = require('./libs/Company/Source/Company').Unit;

var Collection = new Class({

    //Implements: [Unit],
    Extends: Unit,

    // Set prefix when Extending to differentiate against other Collections
    Prefix: '',

    Model: Model,

    _models: [],

    initialize: function(models, options){
        this.setup(models, options);
    },

    setup: function(models, options){
        if (!options) { options = {}; }

        if (options.Prefix) { this.Prefix = options.Prefix; }

        this.setupUnit();

        if (models) {
            if (options.silentSetup) {
                this.detachUnit();
            }

            this.add(models);

            if (options.silentSetup) {
                this.attachUnit();
            }

            // ((options.silentSetup) ? function(){
            //     this.detatchUnit();
            //     this.add(models);
            //     this.attachUnit();
            // } : function(){
            //     this.add(models);
            // }).call(this);
        }

        return this;
    },

    hasModel: function(model){
        return this._models.contains(model);
    },

    // Silent publishing by using detachUnit before adding
    _add: function(model){
        model = new this.Model(model);

        if (!this.hasModel(model)) {
            this._models.push(model);

            this.publish('add', [this, model]);
        }

        return this;
    },

    add: function(){
        var models = arguments,
            len = models.length,
            i = 0;

        while(len--){
            this._add(models[i++]);
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

    _remove: function(model){
        model.destroy();

        this._models.erase(model);

        // Silent publishing by using detachUnit before removing
        this.publish('remove', [this, model]);

        return this;
    },

    remove: function(){
        var models = Array.from(arguments), l = models.length;

        while(l--){
            this._remove(models[l]);
        }

        return this;
    },

    empty: function(){
        this.remove.apply(this, this._models);

        this.publish('empty', this);

        return this;
    },

    toJSON: function(){
        return this.map(function(model){
            return model.toJSON();
        });
    }
});

['forEach', 'each', 'invoke', 'every', 'filter', 'clean',  'indexOf', 'map', 'some', 'associate', 'link', 'contains', /*'append',*/ 'getLast', 'getRandom', /*'include', 'combine', 'erase', 'empty',*/ 'flatten', 'pick'].each(function(method){
    Collection.implement(method, function(){
        return Array[method].apply( Array, [this._models].append( Array.from(arguments) ) );
    });
});

// }(typeof exports != 'undefined' ? exports : window));