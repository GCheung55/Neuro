// Make the $boundFn unique
var uid = String.uniqueID(),
    $boundFnStr = uid + '_$boundFn';

var isBound = function(fn){
    return fn && typeOf(fn[$boundFnStr]) == 'function';
};

var bindFn = function(fn, to){
    // make sure fn hasn't been bound yet
    if (!isBound(fn) && typeOf(fn) == 'function') {
        fn[$boundFnStr] = fn.bind(to);
    }

    return fn;
};

var getBoundFn = function(fn){
    return fn[$boundFnStr];
};

var processFn = function(type, evt, fn, obj){
    if (type == 'string') {
        fn = obj[fn];

        if (typeOf(fn) == 'function') {
            if (!isBound(fn)) {
                bindFn(fn, obj);
            }

            fn = getBoundFn(fn);
        }
    }
    
    return fn;
};

var mapSubEvents = function(obj, baseEvt){
    var map = {};

    Object.each(obj, function(val, key){
        // it's the parent event
        if (key == '*') {
            key = baseEvt;
        // Model sub event: 'change:key'
        // Sync sub event: 'sync:complete'
        } else {
            key = baseEvt  + ':' + key;
        }

        map[key] = val;
    });

    return map;
};

var process = function(methodStr, map, obj){
    Object.each(map, function(methods, evt){
        methods = Array.from(methods);

        methods.each(function(method){
            var type = typeOf(method);

            switch(type){
                case 'object': 
                    if (!instanceOf(method, Class)) {
                        process.call(this, methodStr, mapSubEvents(method, evt), obj);
                    }
                    break;
                case 'string':
                case 'function':
                    method = processFn.call(this, type, evt, method, obj);

                    method && this[methodStr](evt, method);
                    break;
            };
        }, this);
    }, this);
};

var curryConnection = function(str){
    var methodStr = str == 'connect' ? 'addEvent' : 'removeEvent';

    return function(obj, hasConnected){
        if (obj && typeOf(obj[str]) == 'function') {
            var map = this.options.connector;

            process.call(this, methodStr, map, obj);

            // Connecting is a two way street. Connect/disconnect
            // will first connect/disconnect 'this' with obj's methods. Next
            // it will attempt to connect/disconnect obj with 'this' methods
            // hasConnected will prevent a loop.
            !hasConnected && obj[str](this, true);
        }

        return this;
    };
};

var Connector = new Class({
    // options: {
    //     connector: {
    //         'thisEvent': 'otherObjMethod',
    //         model
    //         'change': 'someMethodName'
    //         'change': function(){},
    //         'change': {
    //             '*': 'updateAll',
    //             'name': 'updateName',
    //             'age': function(){}
    //         },
    //         'change': {
    //              '*': ['someMethod', 'someOtherMethod'],
    //              'name': ['updateName', 'updateFullName']
    //         },
    //         'change': [{'*': ['someMethod']}, {'*': ['someOtherMethod']}],
    //     }
    // },

    connect: curryConnection('connect'),

    disconnect: curryConnection('disconnect')
});

exports.Connector = Connector;