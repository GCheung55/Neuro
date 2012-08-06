var modelObj = require('../src/model/model');

var separator = '.';

exports.Butler = new Class({
    _accessors: {
    //     key: {
    //         // The buck stops here for this custom set method.
    //         // Any returned value goes into the ether because
    //         // the original set code block is ignored when this is invoked

    //         set: function(prop, val){},

    //         // isPrevious flag lets you choose whether to pull data from this._data or this._previousData
    //         get: function(isPrevious){
    //             //Example
    //             var data = isPrevious ? this._data : this._previousData;
    //             return data['somekey'];
    //         },

    //         getPrevious: function(){}
    //     }
    },

    _accessorName: undefined,

    options: {
        accessors: {}
    },

    setupAccessors: function(){
        var accessors = this._accessors;

        this._accessors = new modelObj.Model();

        this.setAccessor(Object.merge(accessors, this.options.accessors));

        return this;
    },

    isAccessing: function(){
        return !!this._accessorName;
    },

    /**
     * Accessor functions pass through to trigger flags
     * to signify that an accessor is being used.
     */
    _accessFnc: function(name, fnc){
        var value;

        if (name) {
            // this._accessing++;
            this._accessorName = name;

            value = fnc();

            // this._accessing--;
            this._accessorName = void 0;
        }

        return value;
    },

    /**
     * Decorate the functions in obj so that it will be easy to prevent
     * recursive calls to itself because the decorated function tracks
     * the name is.
     * @param  {String} name The name that will be used to prevent recursive calls.
     *                       It can be dot-delimited during processing
     * @param  {Object} obj  The object to process. Calls recursively to process other
     *                       functions existing in the first object
     * @return {Object}      obj
     */
    _decorateAccessors: function(name, obj){
        Object.each(obj, function(fnc, type) {
            var f;
            switch(typeOf(fnc)){
                case 'function':
                    f = obj[type] = function(){
                        return this._accessFnc(name, fnc.pass(arguments, this));
                    }.bind(this);

                    f._orig = fnc;
                    break;
                case 'object':
                    this._decorateAccessors(name + separator + type, fnc);
                    break;
            }
        }, this);

        return obj;
    },

    setAccessor: function(name, obj){
        var accessors;
        if (!!name && Type.isObject(obj)) {
            accessors = this._decorateAccessors(name, obj);

            this._accessors.set(name, accessors);
        }

        return this;
    }.overloadSetter(),

    getAccessor: function(name, type){
        var accessors;
        
        if (name) {
            name = type ? name + separator + type : name;

            accessors = this._accessors.get(name);
        }

        return accessors;
    },

    unsetAccessor: function(name, type){
        if (name) {
            name = type ? name + separator + type : name;

            this._accessors.unset(name);
        }

        return this;
    }
});