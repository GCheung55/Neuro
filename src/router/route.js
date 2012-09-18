/**
 * A route ported from Crossroads.js by Miller Medeiros (https://github.com/millermedeiros/crossroads.js)
 * date - Jul 29, 2012
 * crossroads.js commit - 3b413b0b506b0c04f80b03194d4c1abaeccc9574
 * @type {Class}
 */
var Model = require('../model/main').Model,
    patternLexer = require('./patternlexer'),
    utils = require('./utils');

var _hasOptionalGroupBug = (/t(.+)?/).exec('t')[1] === '';

var typecastValue = utils.typecastValue,
    decodeQueryString = utils.decodeQueryString;

var Route = new Class({
    Extends: Model,

    options: {
        defaults: {
            pattern: void 0,
            priority: 0,
            normalizer: void 0,
            greedy: false,
            rules: {},
            typecast: false,
            // _paramsIds: void 0,
            // _optionalParamsIds: void 0,
            // _matchRegexp: void 0
        },

        accessors: {
            pattern: {
                // Process the pattern before setting
                set: function(prop, value){
                    // Validate that it is regexp or string
                    if (this.validate(prop, value)) {
                        var obj = {},
                            lexer = this.getLexer();

                        obj[prop] = value;

                        obj._matchRegexp = value;
                        obj._optionalparamsIds = obj._paramsIds = void 0;

                        if (typeOf(value) != 'regexp') {
                            obj._paramsIds = lexer.getParamIds(value);
                            obj._optionalParamsIds = lexer.getOptionalParamsIds(value);
                            obj._matchRegexp = lexer.compilePattern(value);
                        }

                        this.set(obj);
                    }
                }
            },
            rules: {
                set: function(prop, value){
                    // Validate that it is an object
                    if (!this.validate(prop, value)) {
                        value = {};
                    }

                    this.set(prop, new Model(value));
                }
            },
            callback: {
                set: function(prop, value){
                    if (typeOf(value) == 'function') {
                        this.addEvent('match', value);
                    }
                }
            }
        },

        validators: {
            pattern: function(val){
                var type = typeOf(val);
                return type == 'null' || type == 'regexp' || type == 'string';
            },
            priority: Type.isNumber,
            normalizer: Type.isFunction,
            greedy: Type.isBoolean,
            rules: Type.isObject
        }
    },

    setup: function(data, options){
        this.parent(data, options);
        return this;
    },

    match: function(request){
        request = request || '';

        //validate params even if regexp because of `request_` rule.
        return this.get('_matchRegexp').test(request) && this._validateParams(request);
    },

    _validateParams: function(request){
        var rules = this.get('rules'),
            values = this._getParamsObject(request);

        return rules.every(function(rule, key){
            return !!this._isValidParam(request, key, values);
        }, this);
    },

    _isValidParam: function(request, prop, values){

        var validationRule = this.get('rules').get(prop),
            val = values[prop],
            isValid = false,
            isQuery = (prop.indexOf('?') === 0),
            _optionalParamsIds = this.get('_optionalParamsIds'),
            type;

        if (!val && _optionalParamsIds && _optionalParamsIds.indexOf(prop) !== -1) {
            return true;
        }

        type = typeOf(validationRule);

        if (type !== 'function' && isQuery) {
            val = values[prop + '_']; // use raw string
        }

        if (type == 'regexp') {
            isValid = validationRule.test(val);
        } else if (type == 'array') {
            isValid = validationRule.indexOf(val) !== -1;
        } else if (type == 'function') {
            isValid = validationRule(val, request, values);
        }

        return isValid; //fail silently if validationRule is from an unsupported type
    },

    _getParamsObject: function(request){
        var shouldTypecast = this.get('typecast'),
            _paramsIds = this.get('_paramsIds'),
            _optionalParamsIds = this.get('_optionalParamsIds'),
            values = this.getLexer().getParamValues(request, this.get('_matchRegexp'), shouldTypecast),
            o = {},
            n = values.length,
            param, val;

        while (n--) {
            val = values[n];
            if (_paramsIds) {
                param = _paramsIds[n];
                if (param.indexOf('?') === 0 && val) {
                    //make a copy of the original string so array and
                    //RegExp validation can be applied properly
                    o[param +'_'] = val;
                    //update vals_ array as well since it will be used
                    //during dispatch
                    val = decodeQueryString(val);
                    values[n] = val;
                }
                // IE will capture optional groups as empty strings while other
                // browsers will capture `undefined` so normalize behavior.
                // see: #gh-58, #gh-59, #gh-60
                if ( _hasOptionalGroupBug && val === '' && _optionalParamsIds && _optionalParamsIds.indexOf(param) !== -1 ) {
                    val = void 0;
                    values[n] = val;
                }
                o[param] = val;
            }
            //alias to paths and for RegExp pattern
            o[n] = val;
        }
        o.request_ = shouldTypecast? typecastValue(request) : request;
        o.vals_ = values;
        return o;
    },

    _getParamsArray: function(request){
        var rules = this.get('rules'),
            // use rules normalize if it exists
            norm = rules && rules.get('normalize_'),
            params;

        // Use the stored normalizer
        norm = norm || this.get('normalizer'); // default normalize

        if (norm && Type.isFunction(norm)) {
            params = norm(request, this._getParamsObject(request));
        } else {
            params = this._getParamsObject(request).vals_;
        }
        return params;
    },

    interpolate: function(replacements){
        var str = this.getLexer().interpolate(this.get('pattern'), replacements);

        if (! this._validateParams(str) ) {
            throw new Error('Generated string doesn\'t validate against `Route.rules`.');
        }

        return str;
    },

    getLexer: function(){
        return patternLexer;
    }
});

exports.Route = Route;