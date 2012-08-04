var modelObj = require('../src/model/model');

exports.Butler = new Class({
    // _accessors: {
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
    // },

    _accessorName: undefined,

    options: {
        accessors: {}
    },

    setupAccessors: function(){
        this._accessors = new modelObj.Model();

        this.setAccessor(this.options.accessors);

        return this;
    },

    isAccessing: function(){
        return !!this._accessorName;
    },

    /**
     * Accessor functions pass through to trigger flags
     * to signify that an accessor is being used.
     */
    _processAccess: function(name, fnc){
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

    setAccessor: function(name, obj){
        var accessors = {};

        if (!!name && Type.isObject(obj)) {

            /**
             * Decorate the functions in obj so that it will be easy to prevent
             * recursive calls to itself because the decorated function tracks
             * the name is.
             */
            Object.each(obj, function(fnc, type) {
                var f;
                if (fnc && !accessors[type]) {
                    f = accessors[type] = function(){
                        return this._processAccess(name, fnc.pass(arguments, this));
                    }.bind(this);

                    f._orig = fnc;
                }
            }, this);

            this._accessors.set(name, accessors);
        }

        return this;
    }.overloadSetter(),

    getAccessor: function(name, type){
        var accessors;
        
        if (name) {
            name = type ? name + '.' + type : name;

            accessors = this._accessors.get(name);
        }

        return accessors;
    },

    unsetAccessor: function(name, type){
        if (name) {
            name = type ? name + '.' + type : name;

            this._accessors.unset(name);
        }

        return this;
    }
});