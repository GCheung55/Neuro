var accessTypes = ['set', 'get', 'getPrevious'],
    getMap = {
        get: false,
        getPrevious: true
    };

var CustomAccessor = new Class({
    _accessors: {},

    options: {
        accessors: {}
    },

    setupAccessors: function(){
        this.setAccessor(Object.merge({}, this._accessors, this.options.accessors));

        return this;
    },

    setAccessor: function(name, val){
        var accessors = {},
            cont = Object.keys(val).some(accessTypes.contains, accessTypes);

        if (cont) {
            /**
             * Create a getPrevious method that is the get method,
             * but passed a true arg to signify it should access _previousData
             * while the get method gets passed a false value to signify it
             * should access _data.
             */
            if (val.get && !val.getPrevious) {
                accessors.getPrevious = val.get.bind(this, true);
                accessors.get = val.get.bind(this, false);
            }

            val.set && (accessors.set = val.set.bind(this));

            /**
             * Loop through the 'get' types to define accessors functions if
             * it doesn't already exist on the accessors object.
             *
             * The bool is passed to the method regardless of whether a get or
             * getPrevious method existed for consistency.
             */
            Object.each(getMap, function(bool, type) {
                if (val[type] && !accessors[type]) {
                    accessors[type] = val[type].bind(this, bool);
                }
            }, this);

            this._accessors[name] = accessors;
        }

        return this;
    }.overloadSetter(),

    getAccessor: function(name, type){
        var accessors = this._accessors[name];

        if (type && accessors && accessors[type]) {
            accessors = accessors[type]
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