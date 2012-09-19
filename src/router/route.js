/**
 * A route ported from Crossroads.js by Miller Medeiros (https://github.com/millermedeiros/crossroads.js)
 * date - Jul 29, 2012
 * crossroads.js commit - 3b413b0b506b0c04f80b03194d4c1abaeccc9574
 * @type {Class}
 */
var Model = require('../model/main').Model,
    patternLexer = require('./patternlexer'),
    utils = require('./utils'),
    signalFactory = require('../../utils/signalFactory');

// IE 7-8 capture optional groups as empty strings while other browsers
// capture as `undefined`
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

                        // Set the pattern first, so it doesn't create a loop if the browser doesn't go through the obj's order properly
                        this.set(prop, value);

                        obj._matchRegexp = value;
                        obj._optionalParamsIds = obj._paramsIds = void 0;

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
                    if (this.validate(prop, value)) {
                        this.set(prop, new Model(value));
                    }
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
                return ['null', 'regexp', 'string'].contains(typeOf(val));
            },
            priority: Type.isNumber,
            normalizer: Type.isFunction,
            greedy: Type.isBoolean,
            rules: Type.isObject
        }
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
            // normalize_ isn't a validation rule... (#39)
            return !(key != 'normalize_' && !this._isValidParam(request, key, values));
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
                    values[n] = val = decodeQueryString(val);
                }
                // IE will capture optional groups as empty strings while other
                // browsers will capture `undefined` so normalize behavior.
                // see: #gh-58, #gh-59, #gh-60
                if ( _hasOptionalGroupBug && val === '' && _optionalParamsIds && _optionalParamsIds.indexOf(param) !== -1 ) {
                    values[n] = val = void 0;
                }
                o[param] = val;
            }
            //alias to paths and for RegExp pattern
            o[n] = val;
        }
        o.request_ = shouldTypecast ? typecastValue(request) : request;
        o.vals_ = values;
        return o;
    },

    _getParamsArray: function(request){
        var rules = this.get('rules'),
            // use rules normalize if it exists, otherwise use the default
            norm = (rules && rules.get('normalize_')) || this.get('normalizer'),
            params;

        if (norm && Type.isFunction(norm)) {
            params = norm(request, this._getParamsObject(request));
        } else {
            params = this._getParamsObject(request).vals_;
        }
        return params;
    },

    interpolate: function(replacements){
        var str = this.getLexer().interpolate(this.get('pattern'), replacements);

        if (!this._validateParams(str)) {
            throw new Error('Generated string doesn\'t validate against `Route.rules`.');
        }

        return str;
    },

    getLexer: function(){
        return patternLexer;
    }
});

Route.implement(
    signalFactory(['match', 'pass'])
);

exports.Route = Route;