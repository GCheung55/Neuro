var Silence = new Class({
    _silent: false,

    silence: function(silent){
        this._silent = !!silent;

        return this;
    },

    isSilent: function(){
        return !!this._silent;
    },
});

exports = module.exports = Silence;