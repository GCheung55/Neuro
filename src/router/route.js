var Model = require('./src/model/main').Model,
    patternLexer = require('./src/router/patternlexer.js');

var Route = new Class({
    Extends: Model,

    options: {
        defaults: {
            // callback: undefined,
            pattern: undefined,
            priority: 0,
            _paramsIds: undefined,
            _optionalParamsIds: undefined,
            _matchRegexp: undefined
        },
        accessors: {
            pattern: {
                // Process the pattern before setting
                set: function(key, value){
                    var obj = {},
                        lexer = this.getLexer();

                    obj[key] = value;

                    if (typeOf(pattern) != 'regexp') {
                        obj._paramsIds = patternLexer.getParamIds(value);
                        obj._optionalParamsIds = patternLexer.getOptionalParamsIds(value);
                        obj._matchRegexp = patternLexer.compilePattern(value);
                    } else {
                        obj._matchRegexp = pattern;
                    }

                    this.set(obj);
                }
            },
            callback: {
                set: function(key, value){
                    this.addEvent('match', value);

                    return this;
                }
            }
        },

        validators: {
            pattern: function(val){
                var type = typeOf(val);
                return type == 'regexp' || type == 'string';
            },
            priority: Type.isNumber
        }
    },

    setup: function(data, options){
        this.parent(data, options);

        return this;
    },

    getLexer: function(){
        return patternLexer;
    }
});

exports.Route = Route;