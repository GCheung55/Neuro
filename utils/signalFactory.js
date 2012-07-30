exports = module.exports = function(names, curryFnc, stack){
    if (typeOf(curryFnc) != 'function') {
        stack = curryFnc;
        curryFnc = undefined;
    }

    stack = stack || {};
    
    if (typeOf(names) == 'array') {
        names.each(function(name){
            stack['signal' + name.capitalize()] = curryFnc ? curryFnc(name) : function(){
                !this.isSilent() && this.fireEvent(name, this);
                return this;
            };
        });
    }

    return stack;
};