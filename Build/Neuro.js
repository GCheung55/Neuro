(function(modules) {
    var cache = {}, require = function(id) {
        var module;
        if (module = cache[id]) return module.exports;
        module = cache[id] = {
            exports: {}
        };
        var exports = module.exports;
        modules[id].call(exports, require, module, exports, window);
        return module.exports;
    };
    window.Neuro = require("0");
})({
    "0": function(require, module, exports, global) {
        exports.Observer = require("1").Unit;
        exports.View = require("2").View;
        exports.Collection = require("4").Collection;
        exports.Model = require("5").Model;
    },
    "1": function(require, module, exports, global) {
        ((function() {
            var removeOnRegexp = /^on([A-Z])/, removeOnFn = function(_, ch) {
                return ch.toLowerCase();
            }, wrap = function(fn) {
                return function() {
                    return fn.apply(this, arguments);
                };
            }, mix = function() {
                var len = arguments.length;
                while (len--) {
                    var Current = arguments[len];
                    switch (typeOf(Current)) {
                      case "type":
                      case "class":
                        Current.$prototyping = !0;
                        Object.append(this, new Current);
                        delete Current.$prototyping;
                        break;
                      case "unit":
                        for (var i in Current) {
                            if (!Current.hasOwnProperty(i)) continue;
                            var value = Current[i];
                            this[i] = typeof value == "function" && !value.exec ? wrap(value) : value;
                        }
                        break;
                      default:
                        Object.append(this, Current);
                    }
                }
                return this;
            }, callback = function() {
                var current = callback.current;
                current.apply(current.$ownerObj, callback.args);
            }, Dispatcher = new Events;
            unwrapClassMethods : for (var prop in Dispatcher) {
                var item = Dispatcher[prop];
                if (typeof item != "function" || item.exec || !item.$origin) continue;
                Dispatcher[prop] = item.$origin;
            }
            Object.append(Dispatcher, {
                $dispatched: {},
                $finished: {},
                $mediator: this.document ? this.document.createElement("script") : null,
                setup: function() {
                    var mediator = this.$mediator;
                    if (!mediator || !mediator.attachEvent && !mediator.addEventListener) return this;
                    if (mediator.addEventListener) {
                        mediator.addEventListener("publishDispatch", callback, !1);
                        this.dispatch = function(fn, args) {
                            var e = document.createEvent("UIEvents");
                            e.initEvent("publishDispatch", !1, !1);
                            callback.args = args;
                            callback.current = fn;
                            mediator.dispatchEvent(e);
                        };
                    } else if (mediator.attachEvent && !mediator.addEventListener) {
                        $(document.head).appendChild(mediator);
                        mediator.publishDispatch = 0;
                        mediator.attachEvent("onpropertychange", callback);
                        this.dispatch = function(fn, args) {
                            callback.args = args;
                            callback.current = fn;
                            mediator.publishDispatch++;
                        };
                        var cleanUp = function() {
                            mediator.detachEvent("onpropertychange", callback);
                            mediator.parentNode.removeChild(mediator);
                            this.detachEvent("onunload", cleanUp);
                        };
                        window.attachEvent("onunload", cleanUp);
                    }
                    return this;
                },
                getFinished: function(key) {
                    return this.$finished[key] || null;
                },
                getDispatched: function(key) {
                    return this.$dispatched[key] || [];
                },
                dispatch: function(fn, args) {
                    callback.args = args;
                    callback.current = fn;
                    callback.call(null);
                },
                replay: function(type, fn) {
                    var dispatched = this.$dispatched, args = null;
                    if (!dispatched || !(args = dispatched[type])) return !1;
                    this.dispatch(fn, args);
                    return !0;
                },
                redispatch: function(type, fn) {
                    var finished = this.$finished, args = null;
                    if (!finished || !(args = finished[type])) return !1;
                    this.dispatch(fn, args);
                    return !0;
                },
                fireEvent: function(type, args, finish) {
                    var self = this, dispatched = this.$dispatched, finished = this.$finished, events = this.$events, handlers = null;
                    type = type.replace(removeOnRegexp, removeOnFn);
                    args = Array.from(args);
                    dispatched[type] = args;
                    finish && (finished[type] = args);
                    if (!events || !(handlers = events[type])) return this;
                    for (var i = 0, l = handlers.length; i < l; i++) this.dispatch(handlers[i], args);
                    return this;
                },
                removeEvents: function(events) {
                    var type;
                    if (typeOf(events) == "object") {
                        for (type in events) {
                            if (!events.hasOwnProperty(type)) continue;
                            this.removeEvent(type, events[type]);
                        }
                        return this;
                    }
                    events && (events = events.replace(removeOnRegexp, removeOnFn));
                    for (type in this.$events) {
                        if (events && events != type) continue;
                        var fns = this.$events[type];
                        for (var i = fns.length; i--; ) i in fns && this.removeEvent(type, fns[i]);
                    }
                    return this;
                },
                removeFinished: function() {
                    var finished = this.$finished;
                    for (var i in finished) {
                        if (!finished.hasOwnProperty(i) || i == "window.domready" || i == "window.load") continue;
                        delete finished[i];
                    }
                    return this;
                },
                removeDispatched: function() {
                    var dispatched = this.$dispatched;
                    for (var i in dispatched) {
                        if (!dispatched.hasOwnProperty(i) || i == "window.domready" || i == "window.load") continue;
                        delete dispatched[i];
                    }
                    return this;
                },
                flush: function() {
                    this.removeEvents();
                    delete Dispatcher.$events;
                    Dispatcher.$events = {};
                    this.removeFinished();
                    this.removeDispatched();
                    return this;
                }
            }).setup();
            window.addEvents({
                domready: function() {
                    Dispatcher.fireEvent("window.domready", [], !0);
                },
                load: function() {
                    Dispatcher.fireEvent("window.load", [], !0);
                }
            });
            function Unit(desc) {
                if (this instanceof Unit) {
                    this.$unitAttached = !0;
                    this.$unitHandlers = {};
                    this.$unitPrefix = "";
                    if (Unit.$prototyping) return this;
                    if (desc) {
                        this.extendUnit(desc);
                        this.setupUnit();
                    }
                    return this;
                }
                return new Unit(desc);
            }
            var decorateFireEvent = function(origin, rep) {
                var fn = function() {
                    rep.apply(this, arguments);
                    return origin.apply(this, arguments);
                };
                fn.$unwrapped = origin;
                return fn;
            }, decorateFn = function(value, unit) {
                var fn = function() {
                    return value.apply(unit, arguments);
                };
                fn.$origin = value;
                return fn;
            };
            this.Unit = (new Type("Unit", Unit)).extend({
                isUnit: function(obj) {
                    return typeOf(obj) === "unit" ? !0 : obj.$unitInstance ? obj.$unitInstance instanceof Unit : !1;
                },
                decorate: function(obj, nowrap) {
                    if (obj.$unitInstance) return obj;
                    var unit = obj.$unitInstance = new Unit;
                    unit.extendUnit = function(ext) {
                        mix.call(obj, ext);
                        return this;
                    };
                    for (var i in unit) {
                        var value = unit[i];
                        if (obj[i] || i == "$family" || typeof value != "function" || value.exec) continue;
                        obj[i] = decorateFn(value, unit);
                    }
                    obj.setupUnit();
                    return nowrap ? obj : this.wrapEvents(obj);
                },
                undecorate: function(obj) {
                    var unit = obj.$unitInstance;
                    if (!unit) return obj;
                    for (var key in unit) {
                        var value = obj[key];
                        if (!value || value.$origin == value) continue;
                        delete obj[key];
                    }
                    this.unwrapEvents(obj);
                    delete obj.$unitInstance;
                    return obj;
                },
                wrapEvents: function(unit) {
                    var fireEvent = unit.fireEvent;
                    if (!fireEvent || fireEvent.$unwrapped) return unit;
                    unit.fireEvent = decorateFireEvent(fireEvent, function(type, args) {
                        unit.publish(type, args);
                    });
                    return unit;
                },
                unwrapEvents: function(unit) {
                    var fireEvent = unit.fireEvent;
                    fireEvent && fireEvent.$unwrapped && (unit.fireEvent = fireEvent.$unwrapped);
                    return unit;
                }
            }).implement({
                setupUnit: function() {
                    var self = this;
                    if (this.Uses) {
                        Array.from(this.Uses).each(this.extendUnit.bind(this));
                        delete this.Uses;
                    }
                    if (this.Prefix) {
                        this.setPrefix(this.Prefix);
                        delete this.Prefix;
                    }
                    this.initSetup && Dispatcher.dispatch(function() {
                        self.initSetup.apply(self);
                    });
                    this.readySetup && this.subscribe("window.domready", function() {
                        self.readySetup();
                    });
                    this.loadSetup && this.subscribe("window.load", function() {
                        self.loadSetup();
                    });
                    return this;
                },
                extendUnit: function(obj) {
                    mix.call(this, obj);
                    return this;
                },
                getPrefix: function() {
                    return this.$unitPrefix;
                },
                setPrefix: function(str) {
                    this.$unitPrefix = (str || "").toString();
                    return this;
                },
                isAttached: function() {
                    return !!this.$unitAttached;
                },
                detachUnit: function() {
                    var attached = this.$unitHandlers;
                    if (!this.$unitAttached) return this;
                    for (var key in attached) {
                        var len = attached[key].length;
                        while (len--) Dispatcher.removeEvent(key, attached[key][len]);
                    }
                    this.$unitAttached = !1;
                    return this;
                },
                attachUnit: function() {
                    var attached = this.$unitHandlers;
                    if (this.$unitAttached) return this;
                    for (var key in attached) {
                        var len = attached[key].length;
                        while (len--) Dispatcher.addEvent(key, attached[key][len]);
                    }
                    this.$unitAttached = !0;
                    return this;
                },
                destroyUnit: function() {
                    this.detachUnit();
                    this.$unitHandlers = {};
                    return this;
                },
                subscribe: function(key, fn, replay) {
                    if (typeof key == "object") for (var i in key) this.subscribe(i, key[i], fn); else {
                        key.charAt(0) == "!" && (replay = !!(key = key.substring(1)));
                        fn.$ownerObj = this;
                        if (!Dispatcher.redispatch(key, fn)) {
                            Events.prototype.addEvent.call({
                                $events: this.$unitHandlers
                            }, key, fn);
                            if (this.$unitAttached) {
                                Dispatcher.addEvent(key, fn);
                                replay && Dispatcher.replay(key, fn);
                            }
                        }
                    }
                    return this;
                },
                unsubscribe: function(key, fn) {
                    if (typeof key != "string") for (var i in key) this.unsubscribe(i, key[i]); else {
                        Dispatcher.removeEvent(key, fn);
                        Events.prototype.removeEvent.call({
                            $events: this.$unitHandlers
                        }, key, fn);
                    }
                    return this;
                },
                publish: function(type, args, finish) {
                    type.charAt(0) == "!" ? finish = type = type.substring(1) : this.$unitPrefix && (type = this.$unitPrefix + "." + type);
                    this.$unitAttached && Dispatcher.fireEvent.call(Dispatcher, type, args, finish);
                    return this;
                }
            });
            var wrapDispatcherFn = function(origin) {
                var fn = function() {
                    fn.$spy.apply(null, arguments);
                    fn.$unwrapped.apply(Dispatcher, arguments);
                };
                return Object.append(fn, {
                    $unwrapped: origin
                });
            };
            Unit.Dispatcher = {
                flush: function() {
                    Dispatcher.flush();
                    return this;
                },
                getFinished: function() {
                    return Object.clone(Dispatcher.$finished);
                },
                removeFinished: function() {
                    Dispatcher.removeFinished();
                    return this;
                },
                getDispatched: function(key) {
                    return key ? (Dispatcher.$dispatched[key] || []).clone() : Object.clone(Dispatcher.$dispatched);
                },
                removeDispatched: function() {
                    Dispatcher.removeDispatched();
                    return this;
                },
                getSubscribers: function(key) {
                    return key ? (Dispatcher.$events[key] || []).clone() : Object.clone(Dispatcher.$events);
                },
                spySubscribe: function(spy) {
                    var fnAddEvent = Dispatcher.addEvent;
                    fnAddEvent.$unwrapped || (Dispatcher.addEvent = wrapDispatcherFn(fnAddEvent));
                    Dispatcher.addEvent.$spy = spy;
                    return this;
                },
                unspySubscribe: function() {
                    var fnAddEvent = Dispatcher.addEvent;
                    fnAddEvent.$unwrapped && (Dispatcher.addEvent = fnAddEvent.$unwrapped);
                    return this;
                },
                spyUnsubscribe: function(spy) {
                    var fnRemoveEvent = Dispatcher.removeEvent;
                    fnRemoveEvent.$unwrapped || (Dispatcher.removeEvent = wrapDispatcherFn(fnRemoveEvent));
                    Dispatcher.removeEvent.$spy = spy;
                    return this;
                },
                unspyUnsubscribe: function() {
                    var fnRemoveEvent = Dispatcher.removeEvent;
                    fnRemoveEvent.$unwrapped && (Dispatcher.removeEvent = fnRemoveEvent.$unwrapped);
                    return this;
                },
                spyPublish: function(spy) {
                    var fnFireEvent = Dispatcher.fireEvent;
                    fnFireEvent.$unwrapped || (Dispatcher.fireEvent = wrapDispatcherFn(fnFireEvent));
                    Dispatcher.fireEvent.$spy = spy;
                    return this;
                },
                unspyPublish: function() {
                    var fnFireEvent = Dispatcher.fireEvent;
                    fnFireEvent.$unwrapped && (Dispatcher.fireEvent = fnFireEvent.$unwrapped);
                    return this;
                }
            };
        })).call(this);
    },
    "2": function(require, module, exports, global) {
        var __MODULE0__ = require("3"), Unit, bridgeEnds;
        exports.View;
        Unit = require("1").Unit;
        bridgeEnds = function(bindType) {
            return function() {
                var prefix = this.getPrefix();
                prefix && (prefix += ".");
                Object.keys(this.handlers).each(function(type) {
                    var obj = {}, methods = Array.from(this.handlers[type]), len = methods.length, i = 0;
                    while (len--) obj[prefix + type] = this.bound(methods[i++]);
                    this[bindType](obj);
                }, this);
                return this;
            };
        };
        exports.View = new Class({
            Implements: [ Class.Binds, Options, Unit ],
            bridges: undefined,
            element: undefined,
            options: {
                bridges: {
                    change: [ "render" ],
                    destroy: "destroy"
                }
            },
            initialize: function(data, options) {
                this.setup(data, options);
            },
            setup: function(data, options) {
                this.setOptions(options);
                this.bridges = this.options.bridges;
                this.setPrefix(this.options.Prefix);
                this.setupUnit();
                this.bindModel();
                this.render();
                return this;
            },
            attachEvents: function() {
                return this;
            },
            detachEvents: function() {
                return this;
            },
            bindModel: bridgeEnds("subscribe"),
            unbindModel: bridgeEnds("unsubscribe"),
            render: function() {
                this.attachEvents();
                return this;
            },
            destroy: function() {
                this.detachEvents();
                this.element = (this.element.destroy(), undefined);
                return this;
            }
        });
    },
    "3": function(require, module, exports, global) {
        Class.Binds = new Class({
            $bound: {},
            bound: function(name) {
                return this.$bound[name] ? this.$bound[name] : this.$bound[name] = this[name].bind(this);
            }
        });
    },
    "4": function(require, module, exports, global) {
        var __MODULE0__ = require("5"), Unit;
        exports.Collection;
        Unit = require("1").Unit;
        exports.Collection = new Class({
            Extends: Unit,
            Prefix: "",
            Model: __MODULE0__.Model,
            _models: [],
            initialize: function(models, options) {
                this.setup(models, options);
            },
            setup: function(models, options) {
                options || (options = {});
                options.Prefix && (this.Prefix = options.Prefix);
                this.setupUnit();
                if (models) {
                    options.silentSetup && this.detachUnit();
                    this.add(models);
                    options.silentSetup && this.attachUnit();
                }
                return this;
            },
            hasModel: function(model) {
                return this._models.contains(model);
            },
            _add: function(model) {
                model = new this.Model(model);
                if (!this.hasModel(model)) {
                    this._models.push(model);
                    this.publish("add", [ this, model ]);
                }
                return this;
            },
            add: function() {
                var models = arguments, len = models.length, i = 0;
                while (len--) this._add(models[i++]);
                return this;
            },
            get: function(index) {
                var len = arguments.length, i = 0, results;
                if (len > 1) {
                    results = [];
                    while (len--) results.push(this.get(arguments[i++]));
                    return results;
                }
                return this._models[index];
            },
            _remove: function(model) {
                model.destroy();
                this._models.erase(model);
                this.publish("remove", [ this, model ]);
                return this;
            },
            remove: function() {
                var models = Array.from(arguments), l = models.length;
                while (l--) this._remove(models[l]);
                return this;
            },
            empty: function() {
                this.remove.apply(this, this._models);
                this.publish("empty", this);
                return this;
            },
            toJSON: function() {
                return this.map(function(model) {
                    return model.toJSON();
                });
            }
        });
        [ "forEach", "each", "invoke", "every", "filter", "clean", "indexOf", "map", "some", "associate", "link", "contains", "getLast", "getRandom", "flatten", "pick" ].each(function(method) {
            exports.Collection.implement(method, function() {
                return Array[method].apply(Array, [ this._models ].append(Array.from(arguments)));
            });
        });
    },
    "5": function(require, module, exports, global) {
        var __MODULE0__ = require("6"), Unit;
        exports.Model;
        Unit = require("1").Unit;
        exports.Model = new Class({
            Extends: Unit,
            _data: {},
            _changed: !1,
            _changedProperties: {},
            _previousProperties: {},
            initialize: function(data, options) {
                if (instanceOf(data, this.constructor)) return data;
                this.setup(data, options);
            },
            setup: function(data, options) {
                options || (options = {});
                this.Prefix = options.Prefix || String.uniqueID();
                this.setupUnit();
                data && (this._data = Object.clone(data));
                return this;
            },
            _set: function(prop, val) {
                var old = this._data[prop];
                Is.Array(val) ? val = val.slice() : Is.Object(val) && (val = Object.clone(val));
                if (!Is.Equal(old, val)) {
                    this._changed = !0;
                    this._changedProperties[prop] = val;
                    this._data[prop] = val;
                }
                return this;
            }.overloadSetter(),
            set: function(prop, val) {
                this._set(prop, val);
                this.changeProperty(this._changedProperties);
                this.change();
                this._previousProperties = Object.clone(this._changedProperties);
                this._changed = !1;
                this._changedProperties = {};
                return this;
            },
            unset: function(prop) {
                this.set(prop, void 0);
                return this;
            },
            get: function(prop) {
                var val = this._data[prop];
                return typeOf(val) == "function" ? val.call(this) : val;
            }.overloadGetter(),
            getData: function() {
                return this._data;
            },
            change: function() {
                this._changed && this.publish("change", this);
                return this;
            },
            changeProperty: function(prop, val) {
                this._changed && this.publish("change:" + prop, [ this, prop, val ]);
                return this;
            }.overloadSetter(),
            destroy: function() {
                this.publish("destroy", this);
                return this;
            },
            toJSON: function() {
                return this.clone();
            }
        });
        [ "clone", "subset", "map", "filter", "every", "some", "keys", "values", "getLength", "keyOf", "contains", "toQueryString" ].each(function(method) {
            exports.Model.implement(method, function() {
                return Object[method].apply(Object, [ this._data ].append(Array.from(arguments)));
            });
        });
    },
    "6": function(require, module, exports, global) {
        (function(context) {
            var toString = Object.prototype.toString, hasOwnProperty = Object.prototype.hasOwnProperty, Is = context.Is = {
                Array: Array.isArray || function(a) {
                    return typeOf(a) === "array";
                },
                NaN: function(a) {
                    return a !== a;
                },
                RegExp: function(a) {
                    return typeOf(a) === "regexp";
                },
                Null: function(a) {
                    return a === null;
                },
                Undefined: function(a) {
                    return a === void 0;
                }
            };
            [ "object", "number", "function", "string", "boolean", "date", "element", "elements" ].each(function(item) {
                Is[item.capitalize()] = function(a) {
                    return typeOf(a) === item;
                };
            });
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
            }, has = function(obj, key) {
                return obj.hasOwnProperty(key);
            }, eq = function(a, b, stack) {
                if (a === b) return a !== 0 || 1 / a == 1 / b;
                if (a == null || b == null) return a === b;
                if (a.isEqual && Is.Function(a.isEqual)) return a.isEqual(b);
                if (b.isEqual && Is.Function(b.isEqual)) return b.isEqual(a);
                var typeA = typeOf(a), typeB = typeOf(b);
                if (typeA != typeB) return !1;
                if (matchMap[typeA]) return matchMap[typeA](a, b);
                if (typeA != "object" || typeB != "object") return !1;
                var length = stack.length;
                while (length--) if (stack[length] == a) return !0;
                stack.push(a);
                var size = 0, result = !0;
                if (typeA == "array") {
                    size = a.length;
                    result = size == b.length;
                    if (result) while (size--) if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
                } else {
                    if ("constructor" in a != "constructor" in b || a.constructor != b.constructor) return !1;
                    for (var key in a) if (has(a, key)) {
                        size++;
                        if (!(result = has(b, key) && eq(a[key], b[key], stack))) break;
                    }
                    if (result) {
                        for (key in b) if (has(b, key) && !(size--)) break;
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
                for (var key in obj) has(obj, key) && (not[key] = function(name) {
                    return function(a, b) {
                        return !obj[name].call(obj, a, b);
                    };
                }(key));
                obj.not = not;
            })(Is);
        })(typeof exports != "undefined" ? exports : window);
    }
});