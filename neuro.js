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
        Neuro.Collection = require("8").Collection;
        Neuro.View = require("9").View;
        exports = module.exports = Neuro;
    },
    "1": function(require, module, exports, global) {
        var Neuro = {
            version: "0.2.0"
        };
        exports = module.exports = Neuro;
    },
    "2": function(require, module, exports, global) {
        var Is = require("3").Is, Silence = require("4").Silence, Connector = require("5").Connector, CustomAccessor = require("7").CustomAccessor;
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
            var isPrevious = type == "_previousData" || void 0;
            return function(prop) {
                var accessor = this.getAccessor(prop, isPrevious ? "getPrevious" : "get"), accessorName = this._accessorName;
                if (accessor) {
                    if (accessorName != prop) {
                        return accessor();
                    }
                }
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
            Implements: [ Connector, CustomAccessor, Events, Options, Silence ],
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
                this.setup(data, options);
            },
            setup: function(data, options) {
                this.setOptions(options);
                this.primaryKey = this.options.primaryKey;
                this.setupAccessors();
                this.silence(function() {
                    this.set(this.options.defaults);
                }.bind(this));
                if (data) {
                    this.set(data);
                }
                return this;
            },
            __set: function(prop, val) {
                var accessor = this.getAccessor(prop, "set");
                if (accessor && this._accessorName != prop) {
                    return accessor.apply(this, arguments);
                }
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
                    if (!isSetting) {
                        this.changeProperty(this._changedProperties);
                        this.change();
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
            change: function() {
                if (this._changed) {
                    this.signalChange();
                }
                return this;
            },
            changeProperty: function(prop, val) {
                if (this._changed) {
                    this.signalChangeProperty(prop, val, this.getPrevious(prop));
                }
                return this;
            }.overloadSetter(),
            destroy: function() {
                this.signalDestroy();
                return this;
            },
            signalChange: function() {
                !this.isSilent() && this.fireEvent("change", this);
                return this;
            },
            signalChangeProperty: function(prop, newVal, oldVal) {
                !this.isSilent() && this.fireEvent("change:" + prop, [ this, prop, newVal, oldVal ]);
                return this;
            },
            signalDestroy: function() {
                !this.isSilent() && this.fireEvent("destroy", this);
                return this;
            },
            signalReset: function() {
                !this.isSilent() && this.fireEvent("reset", this);
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
        [ "each", "subset", "map", "filter", "every", "some", "keys", "values", "getLength", "keyOf", "contains", "toQueryString" ].each(function(method) {
            Model.implement(method, function() {
                return Object[method].apply(Object, [ this._data ].append(Array.from(arguments)));
            });
        });
        exports.Model = Model;
    },
    "3": function(require, module, exports, global) {
        (function(context) {
            var toString = Object.prototype.toString, hasOwnProperty = Object.prototype.hasOwnProperty, oldType = window.Type, Is = context.Is = {};
            var Type = window.Type = function(name, object) {
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
            var eq = function(a, b, stack) {
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
                var length = stack.length;
                while (length--) {
                    if (stack[length] == a) return true;
                }
                stack.push(a);
                var size = 0, result = true;
                if (typeA == "array") {
                    size = a.length;
                    result = size == b.length;
                    if (result) {
                        while (size--) {
                            if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
                        }
                    }
                } else {
                    if ("constructor" in a != "constructor" in b || a.constructor != b.constructor) return false;
                    for (var key in a) {
                        if (has(a, key)) {
                            size++;
                            if (!(result = has(b, key) && eq(a[key], b[key], stack))) break;
                        }
                    }
                    if (result) {
                        for (key in b) {
                            if (has(b, key) && !(size--)) break;
                        }
                        result = !size;
                    }
                }
                stack.pop();
                return result;
            };
            Is.Equal = function(a, b) {
                return eq(a, b, []);
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
        })(typeof exports != "undefined" ? exports : window);
    },
    "4": function(require, module, exports, global) {
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
    "5": function(require, module, exports, global) {
        require("6");
        var processFn = function(type, evt, fn, obj) {
            if (type == "string") {
                fn = obj[fn] ? obj.bound(fn) : undefined;
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
            return function(obj, oneWay) {
                if (obj && typeOf(obj[str]) == "function") {
                    var map = this.options.connector;
                    process.call(this, methodStr, map, obj);
                    !oneWay && obj[str](this, true);
                }
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
    "6": function(require, module, exports, global) {
        Class.Binds = new Class({
            $bound: {},
            bound: function(name) {
                return this.$bound[name] ? this.$bound[name] : this.$bound[name] = this[name].bind(this);
            }
        });
    },
    "7": function(require, module, exports, global) {
        var accessTypes = [ "set", "get", "getPrevious" ], getMap = {
            get: false,
            getPrevious: true
        };
        var CustomAccessor = new Class({
            _accessors: {},
            _accessorName: undefined,
            options: {
                accessors: {}
            },
            setupAccessors: function() {
                this.setAccessor(Object.merge({}, this._accessors, this.options.accessors));
                return this;
            },
            isAccessing: function() {
                return !!this._accessorName;
            },
            _processAccess: function(name, fnc) {
                var value = undefined;
                if (name) {
                    this._accessorName = name;
                    value = fnc();
                    this._accessorName = undefined;
                }
                return value;
            },
            setAccessor: function(name, val) {
                var accessors = {}, cont = Object.keys(val).some(accessTypes.contains, accessTypes);
                if (!!name && cont) {
                    if (val.get && !val.getPrevious) {
                        val.getPrevious = val.get;
                    }
                    if (val.set) {
                        accessors.set = function(a, b) {
                            return this._processAccess(name, val.set.bind(this, a, b));
                        }.bind(this);
                        accessors.set._orig = val.set;
                    }
                    Object.each(getMap, function(bool, type) {
                        if (val[type] && !accessors[type]) {
                            accessors[type] = function() {
                                return this._processAccess(name, val[type].bind(this, bool));
                            }.bind(this);
                            accessors[type]._orig = val[type];
                        }
                    }, this);
                    this._accessors[name] = accessors;
                }
                return this;
            }.overloadSetter(),
            getAccessor: function(name, type) {
                var accessors = this._accessors[name];
                if (type) {
                    return accessors && accessors[type] ? accessors[type] : undefined;
                }
                return accessors;
            },
            unsetAccessor: function(name, type) {
                if (name && type) {
                    delete this._accessors[name][type];
                } else {
                    delete this._accessors[name];
                    this._accessors[name] = undefined;
                }
                return this;
            }
        });
        exports.CustomAccessor = CustomAccessor;
    },
    "8": function(require, module, exports, global) {
        var Model = require("2").Model, Silence = require("4").Silence, Connector = require("5").Connector;
        var Collection = new Class({
            Implements: [ Connector, Events, Options, Silence ],
            _models: [],
            _Model: Model,
            length: 0,
            primaryKey: undefined,
            options: {
                primaryKey: undefined,
                Model: undefined,
                modelOptions: undefined
            },
            initialize: function(models, options) {
                this.setup(models, options);
            },
            setup: function(models, options) {
                this.setOptions(options);
                this.primaryKey = this.options.primaryKey;
                if (this.options.Model) {
                    this._Model = this.options.Model;
                }
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
            _add: function(model, at) {
                model = new this._Model(model, this.options.modelOptions);
                if (!this.hasModel(model)) {
                    model.addEvent("destroy", this.bound("remove"));
                    if (at != undefined) {
                        this._models.splice(at, 0, model);
                    } else {
                        this._models.push(model);
                    }
                    this.length = this._models.length;
                    this.signalAdd(model);
                }
                return this;
            },
            add: function(models, at) {
                models = Array.from(models);
                var len = models.length, i = 0;
                while (len--) {
                    this._add(models[i++]);
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
                model.removeEvent("destroy", this.bound("remove"));
                this._models.erase(model);
                this.length = this._models.length;
                this.signalRemove(model);
                return this;
            },
            remove: function(models) {
                models = Array.from(models).slice();
                var l = models.length, i = 0;
                while (l--) {
                    this._remove(models[i++]);
                }
                return this;
            },
            replace: function(oldModel, newModel, signal) {
                var index;
                if (oldModel && newModel) {
                    index = this.indexOf(oldModel);
                    if (index > -1) {
                        newModel = new this._Model(newModel, this.options.modelOptions);
                        this._models.splice(index, 1, newModel);
                        if (signal) {
                            this.signalAdd(newModel);
                            this.signalRemove(oldModel);
                        }
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
            signalAdd: function(model) {
                !this.isSilent() && this.fireEvent("add", [ this, model ]);
                return this;
            },
            signalRemove: function(model) {
                !this.isSilent() && this.fireEvent("remove", [ this, model ]);
                return this;
            },
            signalEmpty: function() {
                !this.isSilent() && this.fireEvent("empty", this);
                return this;
            },
            signalSort: function() {
                !this.isSilent() && this.fireEvent("sort", this);
                return this;
            },
            toJSON: function() {
                return this.map(function(model) {
                    return model.toJSON();
                });
            }
        });
        [ "forEach", "each", "invoke", "every", "filter", "clean", "indexOf", "map", "some", "associate", "link", "contains", "getLast", "getRandom", "flatten", "pick" ].each(function(method) {
            Collection.implement(method, function() {
                return Array.prototype[method].apply(this._models, arguments);
            });
        });
        exports.Collection = Collection;
    },
    "9": function(require, module, exports, global) {
        var Connector = require("5").Connector;
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
            Implements: [ Connector, Events, Options ],
            element: undefined,
            options: {
                events: {}
            },
            initialize: function(options) {
                this.setup(options);
            },
            setup: function(options) {
                this.setOptions(options);
                if (this.options.element) {
                    this.setElement(this.options.element);
                }
                this.signalReady();
                return this;
            },
            toElement: function() {
                return this.element;
            },
            setElement: function(element) {
                this.element && this.destroy();
                element = this.element = document.id(element);
                if (element) {
                    this.attachEvents();
                }
                return this;
            },
            attachEvents: eventHandler("addEvent"),
            detachEvents: eventHandler("removeEvent"),
            create: function() {
                return this;
            },
            render: function() {
                this.signalRender();
                return this;
            },
            inject: function(reference, where) {
                if (instanceOf(reference, View)) {
                    reference = document.id(reference);
                }
                where = where || "bottom";
                this.element.inject(reference, where);
                this.signalInject(reference, where);
                return this;
            },
            dispose: function() {
                this.element.dispose();
                this.signalDispose();
                return this;
            },
            destroy: function() {
                var element = this.element;
                element && (this.detachEvents(), element.destroy(), this.element = undefined);
                this.signalDestroy();
                return this;
            },
            signalReady: function() {
                this.fireEvent("ready", this);
                return this;
            },
            signalRender: function() {
                this.fireEvent("render", this);
                return this;
            },
            signalInject: function(reference, where) {
                this.fireEvent("inject", [ this, reference, where ]);
                return this;
            },
            signalDispose: function() {
                this.fireEvent("dispose", this);
                return this;
            },
            signalDestroy: function() {
                this.fireEvent("destroy", this);
                return this;
            }
        });
        exports.View = View;
    }
});