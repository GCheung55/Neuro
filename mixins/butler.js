var accessTypes = ['set', 'get', 'getPrevious'],
    getMap = {
        get: false,
        getPrevious: true
    };

var CustomAccessor = new Class({
    _accessors: {
        /*
        key: {
            // The buck stops here for this custom set method.
            // Any returned value goes into the ether because
            // the original set code block is ignored when this is invoked

            set: function(prop, val){},

            // isPrevious flag lets you choose whether to pull data from this._data or this._previousData
            get: function(isPrevious){
                //Example
                var data = isPrevious ? this._data : this._previousData;
                return data['somekey'];
            },

            getPrevious: function(){}
        }
        */
    },

    _accessorName: undefined,

    options: {
        accessors: {}
    },

    setupAccessors: function(){
        this.setAccessor(Object.merge({}, this._accessors, this.options.accessors));

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
        var value = undefined;

        if (name) {
            // this._accessing++;
            this._accessorName = name;

            value = fnc();

            // this._accessing--;
            this._accessorName = undefined;
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
                if (fnc && !accessors[type]) {
                    accessors[type] = function(){
                        return this._processAccess(name, fnc.pass(arguments, this));
                    }.bind(this);

                    accessors[type]._orig = fnc;
                }
            }, this);

            this._accessors[name] = accessors;
        }

        return this;
    }.overloadSetter(),

    getAccessor: function(name, type){
        var accessors = this._accessors[name];

        if (type) {
            return accessors && accessors[type] ? accessors[type] : undefined;
        }

        return accessors;
    },

    unsetAccessor: function(name, type){
        if (name) {
            if (type) {
                delete this._accessors[name][type];
            } else {
                delete this._accessors[name];
                this._accessors[name] = undefined;
            }
        }

        return this;
    }
});

exports.CustomAccessor = CustomAccessor