var Model = require('./model').Model,
    Butler = require('../../mixins/butler').Butler,
    Snitch = require('../../mixins/snitch').Snitch;

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

exports.Model = new Class({
    Extends: Model,

    setup: function(data, options){
        this.setupAccessors();

        this.setupSnitch();

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
            return this;
        }

        return this.parent(prop, val);
    }.overloadSetter(),

    get: curryGetter('get'),

    getPrevious: curryGetter('getPrevious'),

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

    proof: function(){
        return this.parent(this.getData());
    }
});