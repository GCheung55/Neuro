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

    setAccessor: function(name, val){
        var accessors = {},
            cont = Object.keys(val).some(accessTypes.contains, accessTypes);

        if (!!name && cont) {

            /**
             * Create a getPrevious method that is the get method,
             * but passed a true arg to signify it should access _previousData
             * while the get method gets passed a false value to signify it
             * should access _data.
             */
            if (val.get && !val.getPrevious) {
                val.getPrevious = val.get;
            }

            if (val.set) {
                accessors.set = function(a, b){
                    return this._processAccess(name, val.set.bind(this, a, b));
                }.bind(this);

                accessors.set._orig = val.set;
            }

            /**
             * Loop through the 'get' types to define accessors functions if
             * it doesn't already exist on the accessors object.
             *
             * The bool is passed to the method regardless of whether a get or
             * getPrevious method existed for consistency.
             */
            Object.each(getMap, function(bool, type) {
                if (val[type] && !accessors[type]) {
                    accessors[type] = function(){
                        return this._processAccess(name, val[type].bind(this, bool));
                    }.bind(this);

                    accessors[type]._orig = val[type];
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
        if (name && type) {
            delete this._accessors[name][type];
        } else {
            delete this._accessors[name];
            this._accessors[name] = undefined;
        }

        return this;
    }
});

exports.CustomAccessor = CustomAccessor