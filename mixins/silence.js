/**
 * Silent mixin. Inspired by Shipyard.
 */
var Silence = new Class({
    _silent: 0,

    silence: function(fnc){
        this._silent++;
        fnc();
        this._silent--;

        return this;
    },

    isSilent: function(){
        return !!this._silent;
    },
});

exports = module.exports = Silence;