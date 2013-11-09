/**
 * Silent mixin. Inspired by Shipyard.
 */
var Silence = new Class({
    _silent: 0,

    // Silence the object before running the function
    silence: function(fnc){
        this._silent++;
        fnc && fnc.call(this);
        this._silent--;

        return this;
    },

    // Check if object is silent
    isSilent: function(){
        return !!this._silent;
    }
});

exports.Silence = Silence;