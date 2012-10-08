(function(modules) {
    var cache = {}, require = function(id) {
        var module = cache[id];
        if (!module) {
            module = cache[id] = {};
            var exports = module.exports = {};
            modules[id].call(exports, require, module, exports, window);
        }
        return module.exports;
    };
    window["Neuro"] = require("0");
})({
    "0": function(require, module, exports, global) {
        var Neuro = require("1");
        Neuro.Model = require("2").Model;
        Neuro.Collection = require("b").Collection;
        Neuro.View = require("d").View;
        Neuro.Router = require("f").Router;
        Neuro.Route = require("g").Route;
        Neuro.Is = require("4").Is;
        Neuro.Mixins = {
            Butler: require("9").Butler,
            Connector: require("6").Connector,
            Silence: require("5").Silence,
            Snitch: require("m").Snitch
        };
        exports = module.exports = Neuro;
    },
    "1": function(require, module, exports, global) {
        exports = module.exports = {
            version: "0.2.7"
        };
    },
    "2": function(require, module, exports, global) {
        var Model = require("3").Model, Butler = require("9").Butler, Snitch = require("a").Snitch, signalFactory = require("8");
        var curryGetter = function(type) {
            return function(prop) {
                var accessor = this.getAccessor(prop, type), accessorName = this._accessorName;
                if (accessor && accessorName != prop) {
                    return accessor();
                }
                return this.parent(prop);
            }.overloadGetter();
        };
        Model.implement(new Butler);
        Model.implement(new Snitch);
        Model.implement(signalFactory([ "error" ], {
            signalErrorProperty: function(prop, val) {
                !this.isSilent() && this.fireEvent("error:" + prop, [ this, prop, val ]);
            }
        }));
        exports.Model = new Class({
            Extends: Model,
            _errored: false,
            _erroredProperties: {},
            setup: function(data, options) {
                this.setupAccessors();
                this.setupValidators();
                this.parent(data, options);
                return this;
            },
            __set: function(prop, val) {
                var accessor = this.getAccessor(prop, "set");
                if (accessor && this._accessorName != prop) {
                    return accessor.apply(this, arguments);
                }
                if (!this.validate(prop, val)) {
                    this._errored = true;
                    this._erroredProperties[prop] = val;
                    return this;
                }
                return this.parent(prop, val);
            }.overloadSetter(),
            set: function(prop, val) {
                this.parent(prop, val);
                if (!this.isSetting() && this._errored) {
                    this._onErrorProperty(this._erroredProperties);
                    this.signalError();
                    this._resetErrored();
                }
                return this;
            },
            get: curryGetter("get"),
            getPrevious: curryGetter("getPrevious"),
            _resetErrored: function() {
                if (this._errored) {
                    this._errored = false;
                    this._erroredProperties = {};
                }
                return this;
            },
            _onErrorProperty: function(prop, val) {
                this.signalErrorProperty(prop, val);
                return this;
            }.overloadSetter(),
            setAccessor: function(name, val) {
                if (name && val) {
                    if (val.get && !val.getPrevious) {
                        val.getPrevious = val.get;
                    }
                    this.parent(name, val);
                }
                return this;
            }.overloadSetter(),
            validate: function(prop, val) {
                return (this.getValidator("*") || this.parent).call(this, prop, val);
            },
            proof: function() {
                return this.parent(this.getData());
            }
        });
    },
    "3": function(require, module, exports, global) {
        var Is = require("4").Is, Silence = require("5").Silence, Connector = require("6").Connector, signalFactory = require("8");
        var cloneVal = function(val) {
            switch (typeOf(val)) {
              case "array":
                val = val.slice();
                break;
              case "object":
                if (!val.$constructor || val.$constructor && !instanceOf(val.$constructor, Class)) {
                    val = Object.clone(val);
                }
                break;
            }
            return val;
        };
        var curryGetter = function(type) {
            return function(prop) {
                return this[type][prop];
            }.overloadGetter();
        };
        var curryGetData = function(type) {
            return function() {
                var props = this.keys(), obj = {};
                props.each(function(prop) {
                    obj[prop] = cloneVal(this[type](prop));
                }.bind(this));
                return obj;
            };
        };
        var Model = new Class({
            Implements: [ Connector, Events, Options, Silence ],
            primaryKey: undefined,
            _data: {},
            _changed: false,
            _changedProperties: {},
            _previousData: {},
            _setting: 0,
            options: {
                primaryKey: undefined,
                defaults: {}
            },
            initialize: function(data, options) {
                if (instanceOf(data, this.constructor)) {
                    return data;
                }
                this.setOptions(options);
                this.setup(data, options);
            },
            setup: function(data, options) {
                this.primaryKey = this.options.primaryKey;
                this.silence(function() {
                    this.set(this.options.defaults);
                }.bind(this));
                if (data) {
                    this.set(data);
                }
                return this;
            },
            __set: function(prop, val) {
                var old = this.get(prop);
                if (!Is.Equal(old, val)) {
                    this._changed = true;
                    this._data[prop] = this._changedProperties[prop] = cloneVal(val);
                }
                return this;
            }.overloadSetter(),
            _set: function(prop, val) {
                this._setting++;
                this.__set(prop, val);
                this._setting--;
                return this;
            },
            set: function(prop, val) {
                var isSetting;
                if (prop) {
                    isSetting = this.isSetting();
                    !isSetting && this._setPrevious(this.getData());
                    prop = instanceOf(prop, Model) ? prop.getData() : prop;
                    this._set(prop, val);
                    if (!isSetting && this._changed) {
                        this._onChangeProperty(this._changedProperties);
                        this.signalChange();
                        this._resetChanged();
                    }
                }
                return this;
            },
            isSetting: function() {
                return !!this._setting;
            },
            unset: function(prop) {
                var props = {}, len, i = 0, item;
                prop = Array.from(prop);
                len = prop.length;
                while (len--) {
                    props[prop[i++]] = void 0;
                }
                this.set(props);
                return this;
            },
            reset: function(prop) {
                var props = {}, defaults = this.options.defaults, len, i = 0, item;
                if (prop) {
                    prop = Array.from(prop);
                    len = prop.length;
                    while (len--) {
                        item = prop[i++];
                        props[item] = defaults[item];
                    }
                } else {
                    props = defaults;
                }
                this.set(props);
                this.signalReset();
                return this;
            },
            get: curryGetter("_data"),
            getData: curryGetData("get"),
            _setPrevious: function(prop, val) {
                this._previousData[prop] = val;
                return this;
            }.overloadSetter(),
            getPrevious: curryGetter("_previousData"),
            getPreviousData: curryGetData("getPrevious"),
            _resetChanged: function() {
                if (this._changed) {
                    this._changed = false;
                    this._changedProperties = {};
                }
                return this;
            },
            _onChangeProperty: function(prop, val) {
                if (this._changed) {
                    this.signalChangeProperty(prop, val, this.getPrevious(prop));
                }
                return this;
            }.overloadSetter(),
            destroy: function() {
                this.signalDestroy();
                return this;
            },
            toJSON: function() {
                return this.getData();
            },
            spy: function(prop, callback) {
                if (Type.isString(prop) && prop in this._data && Type.isFunction(callback)) {
                    this.addEvent("change:" + prop, callback);
                }
                return this;
            }.overloadSetter(),
            unspy: function(prop, callback) {
                if (Type.isString(prop) && prop in this._data) {
                    this.removeEvents("change:" + prop, callback);
                }
                return this;
            }.overloadSetter()
        });
        Model.implement(signalFactory([ "change", "destroy", "reset" ], {
            signalChangeProperty: function(prop, newVal, oldVal) {
                !this.isSilent() && this.fireEvent("change:" + prop, [ this, prop, newVal, oldVal ]);
                return this;
            }
        }));
        [ "each", "subset", "map", "filter", "every", "some", "keys", "values", "getLength", "keyOf", "contains", "toQueryString" ].each(function(method) {
            Model.implement(method, function() {
                return Object[method].apply(Object, [ this._data ].append(Array.from(arguments)));
            });
        });
        exports.Model = Model;
    },
    "4": function(require, module, exports, global) {
        (function(context, global) {
            var toString = Object.prototype.toString, hasOwnProperty = Object.prototype.hasOwnProperty, oldType = global.Type, Is = context.Is = {};
            var Type = global.Type = function(name, object) {
                var obj = new oldType(name, object), str;
                if (!obj) {
                    return obj;
                }
                str = "is" + name, Is[name] = Is.not[name] = Type[str] = oldType[str];
                return obj;
            }.extend(oldType);
            Type.prototype = oldType.prototype;
            for (var i in oldType) {
                if (Type.hasOwnProperty(i) && i.test("is")) {
                    i = i.replace("is", "");
                    Is[i] = Type["is" + i];
                }
            }
            Is["NaN"] = function(a) {
                return a !== a;
            };
            Is["Null"] = function(a) {
                return a === null;
            };
            Is["Undefined"] = function(a) {
                return a === void 0;
            };
            var matchMap = {
                string: function(a, b) {
                    return a == String(b);
                },
                number: function(a, b) {
                    return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
                },
                date: function(a, b) {
                    return +a == +b;
                },
                "boolean": function(a, b) {
                    return this.date(a, b);
                },
                regexp: function(a, b) {
                    return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
                }
            };
            var has = function(obj, key) {
                return obj.hasOwnProperty(key);
            };
            var eq = function(a, b, aStack, bStack) {
                if (a === b) return a !== 0 || 1 / a == 1 / b;
                if (a == null || b == null) return a === b;
                if (a.isEqual && Is.Function(a.isEqual)) return a.isEqual(b);
                if (b.isEqual && Is.Function(b.isEqual)) return b.isEqual(a);
                var typeA = typeOf(a), typeB = typeOf(b);
                if (typeA != typeB) {
                    return false;
                }
                if (matchMap[typeA]) {
                    return matchMap[typeA](a, b);
                }
                if (typeA != "object" || typeB != "object") return false;
                var length = aStack.length;
                while (length--) {
                    if (aStack[length] == a) return bStack[length] == b;
                }
                aStack.push(a);
                bStack.push(b);
                var size = 0, result = true;
                if (typeA == "array") {
                    size = a.length;
                    result = size == b.length;
                    if (result) {
                        while (size--) {
                            if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                        }
                    }
                } else {
                    var aConstructor = a.constructor, bConstructor = b.constructor;
                    if (aConstructor !== bConstructor && !(Is.Function(aConstructor) && instanceOf(aConstructor, aConstructor) && Is.Function(bConstructor) && instanceOf(bConstructor, bConstructor))) return false;
                    for (var key in a) {
                        if (has(a, key)) {
                            size++;
                            if (!(result = has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                        }
                    }
                    if (result) {
                        for (key in b) {
                            if (has(b, key) && !(size--)) break;
                        }
                        result = !size;
                    }
                }
                aStack.pop();
                bStack.pop();
                return result;
            };
            Is.Equal = function(a, b) {
                return eq(a, b, [], []);
            };
            (function(obj) {
                var not = {};
                for (var key in obj) {
                    if (has(obj, key)) {
                        not[key] = function(name) {
                            return function(a, b) {
                                return !obj[name].call(obj, a, b);
                            };
                        }(key);
                    }
                }
                obj.not = not;
            })(Is);
        })(typeof exports != "undefined" ? exports : window, this.window || global);
    },
    "5": function(require, module, exports, global) {
        var Silence = new Class({
            _silent: 0,
            silence: function(fnc) {
                this._silent++;
                fnc && fnc.call(this);
                this._silent--;
                return this;
            },
            isSilent: function() {
                return !!this._silent;
            }
        });
        exports.Silence = Silence;
    },
    "6": function(require, module, exports, global) {
        require("7");
        var processFn = function(type, evt, fn, obj) {
            if (type == "string") {
                fn = obj && obj[fn] ? obj.bound(fn) : undefined;
            }
            return fn;
        };
        var mapSubEvents = function(obj, baseEvt) {
            var map = {};
            Object.each(obj, function(val, key) {
                key = key == "*" ? baseEvt : baseEvt + ":" + key;
                map[key] = val;
            });
            return map;
        };
        var process = function(methodStr, map, obj) {
            Object.each(map, function(methods, evt) {
                methods = Array.from(methods);
                methods.each(function(method) {
                    var type = typeOf(method);
                    switch (type) {
                      case "object":
                        if (!instanceOf(method, Class)) {
                            process.call(this, methodStr, mapSubEvents(method, evt), obj);
                        }
                        break;
                      case "string":
                      case "function":
                        method = processFn.call(this, type, evt, method, obj);
                        method && this[methodStr](evt, method);
                        break;
                    }
                }, this);
            }, this);
        };
        var curryConnection = function(str) {
            var methodStr = str == "connect" ? "addEvent" : "removeEvent";
            return function(obj, key, twoWay) {
                var map = this.options.connector;
                if (Type.isBoolean(key)) {
                    twoWay = key;
                    key = undefined;
                }
                if (key) {
                    map = map[key];
                }
                process.call(this, methodStr, map, obj);
                twoWay && obj && obj[str](this, key, false);
                return this;
            };
        };
        var Connector = new Class({
            Implements: [ Class.Binds ],
            options: {
                connector: {}
            },
            connect: curryConnection("connect"),
            disconnect: curryConnection("disconnect")
        });
        exports.Connector = Connector;
    },
    "7": function(require, module, exports, global) {
        Class.Binds = new Class({
            $bound: {},
            bound: function(name) {
                return this.$bound[name] ? this.$bound[name] : this.$bound[name] = this[name].bind(this);
            }
        });
    },
    "8": function(require, module, exports, global) {
        var prefix = "signal", hyphen = "-", colon = ":";
        exports = module.exports = function(names, curryFnc, stack) {
            if (!Type.isFunction(curryFnc)) {
                stack = curryFnc;
                curryFnc = undefined;
            }
            stack = stack || {};
            Array.from(names).each(function(name) {
                var property = (prefix + hyphen + name.replace(colon, hyphen)).camelCase();
                stack[property] = curryFnc ? curryFnc(name) : function() {
                    Array.prototype.unshift.call(arguments, this);
                    !this.isSilent() && this.fireEvent(name, arguments);
                    return this;
                };
            });
            return stack;
        };
    },
    "9": function(require, module, exports, global) {
        var Butler = new Class({
            _accessors: {},
            _accessorName: undefined,
            options: {
                accessors: {}
            },
            setupAccessors: function() {
                var accessors = this._accessors;
                this._accessors = {};
                this.setAccessor(Object.merge({}, accessors, this.options.accessors));
                return this;
            },
            isAccessing: function() {
                return !!this._accessorName;
            },
            _processAccess: function(name, fnc) {
                var value;
                if (name) {
                    this._accessorName = name;
                    value = fnc();
                    this._accessorName = void 0;
                }
                return value;
            },
            setAccessor: function(name, obj) {
                var accessors = {};
                if (!!name && Type.isObject(obj)) {
                    Object.each(obj, function(fnc, type) {
                        var orig = fnc;
                        if (!fnc._orig) {
                            fnc = function() {
                                return this._processAccess(name, orig.pass(arguments, this));
                            }.bind(this);
                            fnc._orig = orig;
                        }
                        accessors[type] = fnc;
                    }, this);
                    this._accessors[name] = accessors;
                }
                return this;
            }.overloadSetter(),
            getAccessor: function(name, type) {
                var accessors = this._accessors[name];
                if (type) {
                    return accessors && accessors[type];
                }
                return accessors;
            },
            unsetAccessor: function(name, type) {
                if (name) {
                    if (type) {
                        this._accessors[name][type] = void 0;
                    } else {
                        this._accessors[name] = void 0;
                    }
                }
                return this;
            }
        });
        exports.Butler = Butler;
    },
    a: function(require, module, exports, global) {
        var asterisk = "*";
        var normalizeValidators = function(arg) {
            var obj = {};
            if (typeOf(arg) == "function") {
                obj[asterisk] = arg;
            } else {
                obj = arg;
            }
            return obj;
        };
        var Snitch = new Class({
            _validators: {},
            options: {
                validators: {}
            },
            setupValidators: function() {
                var validators = this._validators;
                this._validators = {};
                this.setValidator(Object.merge({}, normalizeValidators(validators), normalizeValidators(this.options.validators)));
                return this;
            },
            setValidator: function(prop, fnc) {
                var orig = fnc;
                if (fnc && !fnc._orig) {
                    fnc = fnc.bind(this);
                    fnc._orig = orig;
                }
                this._validators[prop] = fnc;
                return this;
            }.overloadSetter(),
            getValidator: function(prop) {
                return this._validators[prop];
            }.overloadGetter(),
            validate: function(prop, val) {
                var validator = this.getValidator(prop), pass = true;
                if (validator) {
                    pass = validator(val);
                }
                return pass;
            },
            proof: function(obj) {
                var validators = Object.clone(this._validators), global = validators[asterisk], keys;
                if (global) {
                    delete validators[asterisk];
                    keys = Object.keys(obj);
                    return global(obj) && Object.keys(validators).every(keys.contains.bind(keys));
                } else {
                    return Snitch.proof(obj, validators);
                }
            }
        });
        Snitch.proof = function(obj, validators) {
            return Object.every(validators, function(fnc, prop) {
                return prop in obj && fnc(obj[prop]);
            });
        };
        exports.Snitch = Snitch;
    },
    b: function(require, module, exports, global) {
        var Collection = require("c").Collection, Model = require("2").Model, Snitch = require("a").Snitch;
        var validateFnc = function(val, prop) {
            return this.parent(prop, val);
        };
        Collection.implement(new Snitch);
        exports.Collection = new Class({
            Extends: Collection,
            setup: function(models, options) {
                this.setupValidators();
                this.parent(models, options);
                return this;
            },
            _add: function(model, at) {
                if (!this.validate(model)) {
                    this.signalError(model, at);
                } else {
                    this.parent(model, at);
                }
                return this;
            },
            validate: function(models) {
                var globalValidateFnc = this.getValidator("*");
                models = Array.from(models);
                return models.every(function(model) {
                    var isInstance = instanceOf(model, Model);
                    return globalValidateFnc ? globalValidateFnc(isInstance ? model.getData() : model) : isInstance ? model.every(validateFnc, this) : Object.every(model, validateFnc, this);
                }, this);
            },
            proofModel: function(models) {
                models = Array.from(models);
                return models.every(function(model) {
                    return Snitch.proof(instanceOf(model, Model) ? model.getData() : model, this._validators);
                }, this);
            },
            proof: function() {
                return this.proofModel(this._models);
            },
            signalError: function(model, at) {
                !this.isSilent() && this.fireEvent("error", [ this, model, at ]);
            }
        });
    },
    c: function(require, module, exports, global) {
        var Model = require("2").Model, Silence = require("5").Silence, Connector = require("6").Connector, signalFactory = require("8");
        var Collection = new Class({
            Implements: [ Connector, Events, Options, Silence ],
            _models: [],
            _active: 0,
            _changed: false,
            length: 0,
            primaryKey: undefined,
            options: {
                primaryKey: undefined,
                Model: {
                    constructor: Model,
                    options: undefined
                }
            },
            initialize: function(models, options) {
                this.setOptions(options);
                this.setup(models, options);
            },
            setup: function(models, options) {
                this.primaryKey = this.options.primaryKey;
                this._Model = this.options.Model.constructor;
                if (models) {
                    this.add(models);
                }
                return this;
            },
            hasModel: function(model) {
                var pk = this.primaryKey, has, modelId;
                has = this._models.contains(model);
                if (pk && !has) {
                    modelId = instanceOf(model, Model) ? model.get(pk) : model[pk];
                    has = this.some(function(item) {
                        return modelId === item.get(pk);
                    });
                }
                return !!has;
            },
            resetChange: function() {
                this._changed = false;
            },
            attachModelEvents: function(model) {
                model.addEvents({
                    destroy: this.bound("remove"),
                    change: this.bound("signalChangeModel")
                });
                return this;
            },
            detachModelEvents: function(model) {
                model.removeEvents({
                    destroy: this.bound("remove"),
                    change: this.bound("signalChangeModel")
                });
                return this;
            },
            act: function(fnc) {
                this._active++;
                fnc.call(this);
                this._active--;
                return this;
            },
            isActive: function() {
                return !!this._active;
            },
            _add: function(model, at) {
                model = new this._Model(model, this.options.Model.options);
                if (!this.hasModel(model)) {
                    this.attachModelEvents(model);
                    at = this.length == 0 ? void 0 : at;
                    if (at != void 0) {
                        this._models.splice(at, 0, model);
                    } else {
                        this._models.push(model);
                    }
                    this.length = this._models.length;
                    this._changed = true;
                    this.signalAdd(model, at != void 0 ? at : this.length - 1);
                }
                return this;
            },
            add: function(models, at) {
                var currentLen = this.length;
                models = Array.from(models);
                this.act(function() {
                    var len = models.length, i = 0;
                    while (len--) {
                        this._add(models[i++], at);
                    }
                });
                if (!this.isActive() && this._changed) {
                    this.signalChange();
                    this.resetChange();
                }
                return this;
            },
            get: function(index) {
                var len = arguments.length, i = 0, results;
                if (len > 1) {
                    results = [];
                    while (len--) {
                        results.push(this.get(arguments[i++]));
                    }
                    return results;
                }
                return this._models[index];
            },
            _remove: function(model) {
                if (this.hasModel(model)) {
                    this.detachModelEvents(model);
                    this._models.erase(model);
                    this.length = this._models.length;
                    this._changed = true;
                    this.signalRemove(model);
                }
                return this;
            },
            remove: function(models) {
                var currentLen = this.length;
                models = Array.from(models).slice();
                this.act(function() {
                    var l = models.length, i = 0;
                    while (l--) {
                        this._remove(models[i++]);
                    }
                });
                if (!this.isActive() && this._changed) {
                    this.signalChange();
                    this.resetChange();
                }
                return this;
            },
            replace: function(oldModel, newModel) {
                var index;
                if (oldModel && newModel && this.hasModel(oldModel) && !this.hasModel(newModel)) {
                    index = this.indexOf(oldModel);
                    if (index > -1) {
                        this.act(function() {
                            this.add(newModel, index);
                            this.remove(oldModel);
                        });
                        !this.isActive() && this.signalChange() && this.resetChange();
                    }
                }
                return this;
            },
            sort: function(fnc) {
                this._models.sort(fnc);
                this.signalSort();
                return this;
            },
            reverse: function() {
                this._models.reverse();
                this.signalSort();
                return this;
            },
            empty: function() {
                this.remove(this._models);
                this.signalEmpty();
                return this;
            },
            toJSON: function() {
                return this.map(function(model) {
                    return model.toJSON();
                });
            }
        });
        Collection.implement(signalFactory([ "empty", "sort", "change", "add", "remove", "change:model" ]));
        [ "forEach", "each", "invoke", "every", "filter", "clean", "indexOf", "map", "some", "associate", "link", "contains", "getLast", "getRandom", "flatten", "pick" ].each(function(method) {
            Collection.implement(method, function() {
                return Array.prototype[method].apply(this._models, arguments);
            });
        });
        exports.Collection = Collection;
    },
    d: function(require, module, exports, global) {
        var View = require("e").View;
        exports.View = View;
    },
    e: function(require, module, exports, global) {
        var Connector = require("6").Connector, Silence = require("5").Silence, signalFactory = require("8");
        var eventHandler = function(handler) {
            return function() {
                var events = this.options.events, element = this.element;
                if (element && events) {
                    Object.each(events, function(val, key) {
                        var methods = Array.from(val), len = methods.length, i = 0, method;
                        while (len--) {
                            method = methods[i++];
                            this.element[handler](key, typeOf(method) == "function" ? method : this.bound(method));
                        }
                    }, this);
                }
                return this;
            };
        };
        var View = new Class({
            Implements: [ Connector, Events, Options, Silence ],
            options: {
                element: undefined,
                events: {}
            },
            initialize: function(options) {
                this.setOptions(options);
                this.setup(options);
                this.signalReady();
            },
            setup: function(options) {
                if (this.options.element) {
                    this.setElement(this.options.element);
                }
                return this;
            },
            toElement: function() {
                return this.element;
            },
            setElement: function(element) {
                if (element) {
                    this.element && this.destroy();
                    element = this.element = document.id(element);
                    if (element) {
                        this.attachEvents();
                    }
                }
                return this;
            },
            attachEvents: eventHandler("addEvent"),
            detachEvents: eventHandler("removeEvent"),
            create: function() {
                return this;
            },
            render: function(data) {
                this.signalRender.apply(this, arguments);
                return this;
            },
            inject: function(reference, where) {
                if (this.element) {
                    reference = document.id(reference);
                    where = where || "bottom";
                    this.element.inject(reference, where);
                    this.signalInject(reference, where);
                }
                return this;
            },
            dispose: function() {
                if (this.element) {
                    this.element.dispose();
                    this.signalDispose();
                }
                return this;
            },
            destroy: function() {
                var element = this.element;
                if (element) {
                    element && (element.destroy(), this.element = undefined);
                    this.signalDestroy();
                }
                return this;
            }
        });
        View.implement(signalFactory([ "ready", "render", "dispose", "destroy", "inject" ]));
        exports.View = View;
    },
    f: function(require, module, exports, global) {
        var collectionObj = require("b"), routeObj = require("g"), signalFactory = require("8");
        var Router = new Class({
            Extends: collectionObj.Collection,
            options: {
                Model: {
                    constructor: routeObj.Route,
                    options: {
                        defaults: {
                            typecast: false,
                            normalizer: null
                        }
                    }
                },
                greedy: false,
                greedyEnabled: true
            },
            _prevRoutes: [],
            _prevMatchedRequest: null,
            _prevBypassedRequest: null,
            _add: function(route) {
                var priority = instanceOf(route, routeObj.Route) ? route.get("priority") : route.priority || (route.priority = 0);
                this.parent(route, this._calcPriority(priority));
                return this;
            },
            _calcPriority: function(priority) {
                var route, n = this.length;
                do {
                    --n;
                } while ((route = this.get(n), route) && priority <= route.get("priority"));
                return n + 1;
            },
            resetState: function() {
                this._prevRoutes.length = 0;
                this._prevMatchedRequest = null;
                this._prevBypassedRequest = null;
                return this;
            },
            parse: function(request, defaultArgs) {
                request = request || "";
                defaultArgs = defaultArgs || [];
                if (request !== this._prevMatchedRequest && request !== this._prevBypassedRequest) {
                    var routes = this._getMatchedRoutes(request), i = 0, n = routes.length, cur;
                    if (n) {
                        this._prevMatchedRequest = request;
                        this._notifyPrevRoutes(routes, request);
                        this._prevRoutes = routes;
                        while (i < n) {
                            cur = routes[i];
                            cur.route.signalMatch.apply(cur.route, defaultArgs.concat(cur.params));
                            cur.isFirst = !i;
                            this.signalMatch.apply(this, defaultArgs.concat([ request, cur ]));
                            i += 1;
                        }
                    } else {
                        this._prevBypassedRequest = request;
                        this.signalDefault.apply(this, defaultArgs.concat([ request ]));
                    }
                }
                return this;
            },
            _notifyPrevRoutes: function(matchedRoutes, request) {
                var i = 0, prev;
                while (prev = this._prevRoutes[i++]) {
                    if (this._didSwitch(prev.route, matchedRoutes)) {
                        prev.route.signalPass(request);
                    }
                }
                return this;
            },
            _didSwitch: function(route, matchedRoutes) {
                var i = 0, matched;
                while (matched = matchedRoutes[i++]) {
                    if (matched.route === route) {
                        return false;
                    }
                }
                return true;
            },
            _getMatchedRoutes: function(request) {
                var res = [], n = this.length, route;
                while (route = this.get(--n)) {
                    if ((!res.length || this.options.greedy || route.get("greedy")) && route.match(request)) {
                        res.push({
                            route: route,
                            params: route.parse(request)
                        });
                    }
                    if (!this.options.greedyEnabled && res.length) {
                        break;
                    }
                }
                return res;
            }
        });
        Router.NORM_AS_ARRAY = function(req, vals) {
            return [ vals.vals_ ];
        };
        Router.NORM_AS_OBJECT = function(req, vals) {
            return [ vals ];
        };
        Router.implement(signalFactory([ "match", "default" ]));
        exports.Router = Router;
    },
    g: function(require, module, exports, global) {
        var Route = require("h").Route, PatternLexer = require("k");
        Route.PatternLexer = PatternLexer;
        exports.Route = Route;
    },
    h: function(require, module, exports, global) {
        var modelObj = require("2"), signalFactory = require("8"), typecastValue = require("i"), decodeQueryString = require("j");
        var _hasOptionalGroupBug = /t(.+)?/.exec("t")[1] === "";
        var Route = new Class({
            Extends: modelObj.Model,
            options: {
                defaults: {
                    pattern: void 0,
                    priority: 0,
                    normalizer: void 0,
                    greedy: false,
                    rules: {},
                    typecast: false,
                    patternLexer: void 0
                },
                accessors: {
                    pattern: {
                        set: function(prop, value) {
                            if (this.validate(prop, value)) {
                                this.set(prop, value);
                                var obj = {}, lexer = this.get("patternLexer");
                                obj._matchRegexp = value;
                                obj._optionalParamsIds = obj._paramsIds = void 0;
                                if (typeOf(value) != "regexp") {
                                    obj._paramsIds = lexer.getParamIds(value);
                                    obj._optionalParamsIds = lexer.getOptionalParamsIds(value);
                                    obj._matchRegexp = lexer.compilePattern(value);
                                }
                                this.set(obj);
                            }
                        }
                    },
                    rules: {
                        set: function(prop, value) {
                            if (this.validate(prop, value)) {
                                this.set(prop, new modelObj.Model(value));
                            }
                        }
                    },
                    callback: {
                        set: function(prop, value) {
                            if (typeOf(value) == "function") {
                                this.addEvent("match", value);
                            }
                        }
                    },
                    patternLexer: {
                        get: function() {
                            return this.get("patternLexer") || Route.PatternLexer;
                        }
                    }
                },
                validators: {
                    pattern: function(val) {
                        return [ "null", "regexp", "string" ].contains(typeOf(val));
                    },
                    priority: Type.isNumber,
                    normalizer: Type.isFunction,
                    greedy: Type.isBoolean,
                    rules: Type.isObject,
                    patternLexer: Type.isObject
                }
            },
            match: function(request) {
                request = request || "";
                return this.get("_matchRegexp").test(request) && this._validateParams(request);
            },
            parse: function(request) {
                return this._getParamsArray(request);
            },
            _validateParams: function(request) {
                var rules = this.get("rules"), values = this._getParamsObject(request);
                return rules.every(function(rule, key) {
                    return !(key != "normalize_" && !this._isValidParam(request, key, values));
                }, this);
            },
            _isValidParam: function(request, prop, values) {
                var validationRule = this.get("rules").get(prop), val = values[prop], isValid = false, isQuery = prop.indexOf("?") === 0, _optionalParamsIds = this.get("_optionalParamsIds"), type;
                if (!val && _optionalParamsIds && _optionalParamsIds.indexOf(prop) !== -1) {
                    return true;
                }
                type = typeOf(validationRule);
                if (type !== "function" && isQuery) {
                    val = values[prop + "_"];
                }
                if (type == "regexp") {
                    isValid = validationRule.test(val);
                } else if (type == "array") {
                    isValid = validationRule.indexOf(val) !== -1;
                } else if (type == "function") {
                    isValid = validationRule(val, request, values);
                }
                return isValid;
            },
            _getParamsObject: function(request) {
                var shouldTypecast = this.get("typecast"), _paramsIds = this.get("_paramsIds"), _optionalParamsIds = this.get("_optionalParamsIds"), values = this.get("patternLexer").getParamValues(request, this.get("_matchRegexp"), shouldTypecast), o = {}, n = values && values.length || 0, param, val;
                while (n--) {
                    o[n] = val = values[n];
                    if (_paramsIds) {
                        param = _paramsIds[n];
                        if (param.indexOf("?") === 0 && val) {
                            o[param + "_"] = val;
                            values[n] = val = decodeQueryString(val);
                        }
                        if (_hasOptionalGroupBug && val === "" && _optionalParamsIds && _optionalParamsIds.indexOf(param) !== -1) {
                            values[n] = val = void 0;
                        }
                        o[param] = val;
                    }
                }
                o.request_ = shouldTypecast ? typecastValue(request) : request;
                o.vals_ = values;
                return o;
            },
            _getParamsArray: function(request) {
                var rules = this.get("rules"), norm = rules && rules.get("normalize_") || this.get("normalizer"), obj = this._getParamsObject(request);
                params = obj.vals_;
                if (norm && Type.isFunction(norm)) {
                    params = norm(request, obj);
                }
                return params;
            },
            interpolate: function(replacements) {
                var str = this.get("patternLexer").interpolate(this.get("pattern"), replacements);
                if (!this._validateParams(str)) {
                    throw new Error("Generated string doesn't validate against `Route.rules`.");
                }
                return str;
            }
        });
        Route.implement(signalFactory([ "match", "pass" ]));
        exports.Route = Route;
    },
    i: function(require, module, exports, global) {
        var UNDEF;
        exports = module.exports = function(val) {
            var r;
            if (val === null || val === "null") {
                r = null;
            } else if (val === "true") {
                r = true;
            } else if (val === "false") {
                r = false;
            } else if (val === UNDEF || val === "undefined") {
                r = UNDEF;
            } else if (val === "" || isNaN(val)) {
                r = val;
            } else {
                r = parseFloat(val);
            }
            return r;
        };
    },
    j: function(require, module, exports, global) {
        var typecastValue = require("i");
        exports = module.exports = function(str) {
            var queryArr = (str || "").replace("?", "").split("&"), n = queryArr.length, obj = {}, item, val;
            while (n--) {
                item = queryArr[n].split("=");
                val = typecastValue(item[1]);
                obj[item[0]] = typeof val === "string" ? decodeURIComponent(val) : val;
            }
            return obj;
        };
    },
    k: function(require, module, exports, global) {
        var typecastArrayValues = require("l");
        var ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g, LOOSE_SLASHES_REGEXP = /^\/|\/$/g, LEGACY_SLASHES_REGEXP = /\/$/g, PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g, TOKENS = {
            OS: {
                rgx: /([:}]|\w(?=\/))\/?(:|(?:\{\?))/g,
                save: "$1{{id}}$2",
                res: "\\/?"
            },
            RS: {
                rgx: /([:}])\/?(\{)/g,
                save: "$1{{id}}$2",
                res: "\\/"
            },
            RQ: {
                rgx: /\{\?([^}]+)\}/g,
                res: "\\?([^#]+)"
            },
            OQ: {
                rgx: /:\?([^:]+):/g,
                res: "(?:\\?([^#]*))?"
            },
            OR: {
                rgx: /:([^:]+)\*:/g,
                res: "(.*)?"
            },
            RR: {
                rgx: /\{([^}]+)\*\}/g,
                res: "(.+)"
            },
            RP: {
                rgx: /\{([^}]+)\}/g,
                res: "([^\\/?]+)"
            },
            OP: {
                rgx: /:([^:]+):/g,
                res: "([^\\/?]+)?/?"
            }
        }, LOOSE_SLASH = 1, STRICT_SLASH = 2, LEGACY_SLASH = 3, _slashMode = LOOSE_SLASH;
        function precompileTokens() {
            var key, cur;
            for (key in TOKENS) {
                if (TOKENS.hasOwnProperty(key)) {
                    cur = TOKENS[key];
                    cur.id = "__CR_" + key + "__";
                    cur.save = "save" in cur ? cur.save.replace("{{id}}", cur.id) : cur.id;
                    cur.rRestore = new RegExp(cur.id, "g");
                }
            }
        }
        precompileTokens();
        function captureVals(regex, pattern) {
            var vals = [], match;
            regex.lastIndex = 0;
            while (match = regex.exec(pattern)) {
                vals.push(match[1]);
            }
            return vals;
        }
        function getParamIds(pattern) {
            return captureVals(PARAMS_REGEXP, pattern);
        }
        function getOptionalParamsIds(pattern) {
            return captureVals(TOKENS.OP.rgx, pattern);
        }
        function compilePattern(pattern) {
            pattern = pattern || "";
            if (pattern) {
                if (_slashMode === LOOSE_SLASH) {
                    pattern = pattern.replace(LOOSE_SLASHES_REGEXP, "");
                } else if (_slashMode === LEGACY_SLASH) {
                    pattern = pattern.replace(LEGACY_SLASHES_REGEXP, "");
                }
                pattern = replaceTokens(pattern, "rgx", "save");
                pattern = pattern.replace(ESCAPE_CHARS_REGEXP, "\\$&");
                pattern = replaceTokens(pattern, "rRestore", "res");
                if (_slashMode === LOOSE_SLASH) {
                    pattern = "\\/?" + pattern;
                }
            }
            if (_slashMode !== STRICT_SLASH) {
                pattern += "\\/?";
            }
            return new RegExp("^" + pattern + "$");
        }
        function replaceTokens(pattern, regexpName, replaceName) {
            var cur, key;
            for (key in TOKENS) {
                if (TOKENS.hasOwnProperty(key)) {
                    cur = TOKENS[key];
                    pattern = pattern.replace(cur[regexpName], cur[replaceName]);
                }
            }
            return pattern;
        }
        function getParamValues(request, regexp, shouldTypecast) {
            var vals = regexp.exec(request);
            if (vals) {
                vals.shift();
                if (shouldTypecast) {
                    vals = typecastArrayValues(vals);
                }
            }
            return vals;
        }
        function interpolate(pattern, replacements) {
            if (typeof pattern !== "string") {
                throw new Error("Route pattern should be a string.");
            }
            var replaceFn = function(match, prop) {
                var val;
                if (prop in replacements) {
                    val = String(replacements[prop]);
                    if (match.indexOf("*") === -1 && val.indexOf("/") !== -1) {
                        throw new Error('Invalid value "' + val + '" for segment "' + match + '".');
                    }
                } else if (match.indexOf("{") !== -1) {
                    throw new Error("The segment " + match + " is required.");
                } else {
                    val = "";
                }
                return val;
            };
            if (!TOKENS.OS.trail) {
                TOKENS.OS.trail = new RegExp("(?:" + TOKENS.OS.id + ")+$");
            }
            return pattern.replace(TOKENS.OS.rgx, TOKENS.OS.save).replace(PARAMS_REGEXP, replaceFn).replace(TOKENS.OS.trail, "").replace(TOKENS.OS.rRestore, "/");
        }
        exports = module.exports = {
            strict: function() {
                _slashMode = STRICT_SLASH;
            },
            loose: function() {
                _slashMode = LOOSE_SLASH;
            },
            legacy: function() {
                _slashMode = LEGACY_SLASH;
            },
            getParamIds: getParamIds,
            getOptionalParamsIds: getOptionalParamsIds,
            getParamValues: getParamValues,
            compilePattern: compilePattern,
            interpolate: interpolate
        };
    },
    l: function(require, module, exports, global) {
        var typecastValue = require("i");
        exports = module.exports = function(values) {
            var n = values.length, result = [];
            while (n--) {
                result[n] = typecastValue(values[n]);
            }
            return result;
        };
    },
    m: function(require, module, exports, global) {
        var asterisk = "*";
        var normalizeValidators = function(arg) {
            var obj = {};
            if (typeOf(arg) == "function") {
                obj[asterisk] = arg;
            } else {
                obj = arg;
            }
            return obj;
        };
        var Snitch = new Class({
            _validators: {},
            options: {
                validators: {}
            },
            setupValidators: function() {
                var validators = this._validators;
                this._validators = {};
                this.setValidator(Object.merge({}, normalizeValidators(validators), normalizeValidators(this.options.validators)));
                return this;
            },
            setValidator: function(prop, fnc) {
                var orig = fnc;
                if (fnc && !fnc._orig) {
                    fnc = fnc.bind(this);
                    fnc._orig = orig;
                }
                this._validators[prop] = fnc;
                return this;
            }.overloadSetter(),
            getValidator: function(prop) {
                return this._validators[prop];
            }.overloadGetter(),
            validate: function(prop, val) {
                var validator = this.getValidator(prop), pass = true;
                if (validator) {
                    pass = validator(val);
                }
                return pass;
            },
            proof: function(obj) {
                var validators = Object.clone(this._validators), global = validators[asterisk], keys;
                if (global) {
                    delete validators[asterisk];
                    keys = Object.keys(obj);
                    return global(obj) && Object.keys(validators).every(keys.contains.bind(keys));
                } else {
                    return Snitch.proof(obj, validators);
                }
            }
        });
        Snitch.proof = function(obj, validators) {
            return Object.every(validators, function(fnc, prop) {
                return prop in obj && fnc(obj[prop]);
            });
        };
        exports.Snitch = Snitch;
    }
});