var CustomAccessor = new Class({
    options: {
        accessors: {}
    },

    setupAccessors: function(){
        this.setAccessor(this.options.accessors);

        return this;
    },

    setAccessor: function(name, val){
        this._accessors[name] = val;

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