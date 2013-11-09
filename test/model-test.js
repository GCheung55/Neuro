if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../');
}

var assert = buster.assert;
var refute = buster.refute;

buster.testCase('Neuro Model', {
    setUp: function(){
        var testModel = new Class({
            Extends: Neuro.Model,
            options: {
                defaults: {
                    'firstName': '',
                    'lastName': '',
                    'age': 0
                }
            },
            _accessors: {
                'fullName': {
                    set: function(prop, val){
                        if (val) {
                            var names = val.split(' '),
                                first = names[0],
                                last = names[1];

                            this.set('firstName', first);
                            this.set('lastName', last);
                        }

                        return val;
                    },
                    get: function(isPrevious){
                        var method = isPrevious ? 'getPrevious' : 'get';

                        return this[method]('firstName') + ' ' + this[method]('lastName');
                    }
                }
            }
        });

        this.mockModel = new testModel();

        this.mockData = {
            'firstName': 'Garrick',
            'lastName': 'Cheung',
            'age': 29
        };

        this.mockModelWithData = new testModel(this.mockData);
    },

    'should return a Model instance': function(){
        assert(instanceOf(this.mockModel, Neuro.Model));
    },

    'should return a Model instance with data': function(){
        assert(instanceOf(this.mockModelWithData, Neuro.Model));
        assert.equals(this.mockModelWithData.getData(), this.mockData);
    },

    'get a value of 29': function(){
        var test = this.mockModelWithData.get('age');
        assert.equals(test, 29);
    },

    'set and get a value of 30': function(){
        var test = this.mockModelWithData.set('age', 30).get('age');
        assert.equals(test, 30);
    },

    'arrays and objects should be dereferenced when set': function(){
        var test = {a: 'str', b: [], c: {more: 'tests'}},
            result;

        this.mockModel.set(test);
        test.a = 'rts';
        test.b.push(0);
        test.c.tests = 'more';

        result = this.mockModel.getData();

        refute.same(test, result);
    },

    'should not dereference Class instances when set': function(){
        var testClass = new (new Class()),
            test = {a: 'str', b: testClass};

        this.mockModel.set(test);

        assert(this.mockModel.get('b') === testClass);
    },

    'unset a property, which should be an undefined value': function(){
        var test = this.mockModelWithData.get('age');
        assert.equals(test, 29);

        test = this.mockModelWithData.unset('age').get('age');
        refute.defined(test);
    },

    'unset multiple properties, which should be an undefined values': function(){
        var model = this.mockModelWithData,
            test = model.get('age', 'firstName');

        assert.equals(test, {age: 29, firstName: "Garrick"});

        test = model.unset(['age', 'firstName']).get('age', 'firstName');
        assert.equals(test, {age: undefined, firstName: undefined});
    },

    // 'clear the data by unsetting all properties': function(){
    //     var model = this.mockModelWithData.clear(),
    //         result = model.values().every(function(val){ return val === void 0; });

    //     assert(result);
    // },

    'reset the model by setting it back to options.defaults': function(){
        var model = this.mockModelWithData.reset(),
            test = JSON.encode(model.options.defaults),
            result = JSON.encode(model);

        assert.equals(test, result);
    },

    'reset property of the model back to what it is in options.defaults': function(){
        var model = this.mockModelWithData.reset('age'),
            test = model.get('age'),
            result = 0;

        assert.equals(test, result);
    },

    'reset properties of the model back to what they are in options.defaults': function(){
        var model = this.mockModelWithData.reset(['age', 'firstName']),
            test = model.get('age', 'firstName'),
            result = {'age':0, 'firstName': ''};

        assert.equals(test, result);
    },

    'getData should return all data': function(){
        var test = this.mockModelWithData.getData(),
            result = this.mockData;

        assert.equals(test, result);
    },

    'getPrevious should return a previously changed value': function(){
        var model = this.mockModelWithData.set('age', 30),
            test = this.mockModelWithData.getPrevious('age'),
            result = 29;

        assert.equals(test, result);
    },

    'getPreviousData should return the previously changed dataset': function(){
        var model = this.mockModelWithData,
            result = model.getData();
            test = model.set('age', 30).getPreviousData();

        assert.equals(test, result);

        test = this.mockModelWithData.set('age', 29).getPreviousData();
        refute.equals(test, result);
    },

    'setAccessor/getAccessor should set/get accessors that are used to set/get properties': function(){
        var accessor = {
                set: function(key, val){
                    if (val) {
                        // Make this backwards to differentiate from the original
                        var name = val.split(' '),
                            first = name[1],
                            last = name[0];

                        this.set('firstName', first);
                        this.set('lastName', last);
                    }
                },
                get: this.mockModelWithData.getAccessor('fullName', 'get')._orig
            },
            model = this.mockModelWithData;

        model.setAccessor('fullName', accessor);

        model.set('fullName', 'Garrick Cheung');

        assert.equals('Cheung', model.get('firstName'));
        assert.equals('Garrick', model.get('lastName'));
    },

    'unsetAccessor should unset accessor by key': function(){
        var test = this.mockModelWithData.unsetAccessor('fullName').set('fullName', 'something').get('firstName'),
            result = 'Garrick';

        assert.equals(test, result);
    },

    'custom accessors should be used to set/get property': function(){
        var model = this.mockModelWithData,
            test = model.set('fullName', 'Mark Obcena').get('fullName'),
            result = 'Mark Obcena';

        assert.equals(test, result);
    },

    'custom accessors should not recursively fire itself when calling in the setter': function(){
        var model = this.mockModel.setAccessor('price', {
            set: function(prop, val){
                this.set(prop, '$' + val.toString());
            },

            get: function(){
                var val = this.get('price');
                return val && val.replace('$', '').toInt();
            }
        });

        assert.equals(model.set({'price': 100})._data['price'], '$100');
        assert.equals(model.get('price'), 100);
    },

    'custom setter accessor triggered during setting should not trigger setPrevious and change': function(){
        var spy = this.spy(),
            model = this.mockModelWithData,
            test = model.getData(),
            result;

        model.addEvent('change', spy);

        model.set({
            age: 30,
            fullName: 'Mark Obcena'
        });

        result = model.getPreviousData();

        assert.equals(test, result);
        assert.calledOnce(spy);
    },

    'JSON encode/stringify should return a json string of the data': function(){
        var test = JSON.encode(this.mockModelWithData),
            result = '{"firstName":"Garrick","lastName":"Cheung","age":29}';

        assert.equals(test, result);
    },

    'should trigger a change event attached to the model': function(){
        var spy = this.spy(),
            model = this.mockModelWithData.addEvent('change', spy);

        model.set('age', 30);

        assert.called(spy);
        assert.calledWith(spy, model);
    },

    'should trigger a change event that notifies what property and value was changed': function(){
        var spy = this.spy(),
            model = this.mockModelWithData.addEvent('change:age', spy);

        model.set('age', 30);

        assert.called(spy);
        assert.calledWith(spy, model, 'age', 30, 29);
    },

    'should trigger an event when the model is destroyed': function(){
        var spy = this.spy(),
            model = this.mockModelWithData.addEvent('destroy', spy);

        model.destroy();

        assert.called(spy);
        assert.calledWith(spy, model);
    },

    'should enable/disable signal execution with the silence method': function(){
        var spy = this.spy(),
            model = new Neuro.Model();

        model.addEvent('change', spy);

        model.set('a', 'rts');

        model.silence(function(){
            this.set('b', {});
        });

        assert.equals(model.get('a'), 'rts');
        assert.equals(model.get('b'), {});

        assert.calledOnceWith(spy, model);
    },

    'Connector': {
        setUp: function(){
            var testModel = new Class({
                Extends: Neuro.Model,
                testStr: function(){
                    this.fireEvent('testStr', 'str')
                },
                testFunc: function(){
                    this.fireEvent('testFunc', 'fnc');
                },
                testKeyVal: function(){
                    this.fireEvent('testKeyVal', arguments);
                }
            }), connectorTestFunc = function(){
                this.testFunc();
            };

            this.connectorTestModel = testModel;
            this.connectorModel = new testModel;
            this.connectorTestFunc = connectorTestFunc;
        },
        
        'connect method': {
            'should process options.connector object where key is an event and value is': {
                'a string, which refers to target objects methods to be attached': function(){
                    var spy = this.spy(),
                        target = this.connectorModel,
                        reference = new Neuro.Model(undefined, {
                            connector: {
                                'change': 'testStr'
                            }
                        });

                    target.addEvent('testStr', spy);
                    reference.connect(target);

                    reference.set('a', 'string');

                    assert.calledWith(spy, 'str');
                },
                'a functions, which just needs to be attached': function(){
                    var spy = this.spy(),
                        target = this.connectorModel,
                        reference = new Neuro.Model(undefined, {
                            connector: {
                                'change': this.connectorTestFunc.bind(target)
                            }
                        });

                    target.addEvent('testFunc', spy);
                    reference.connect(target);

                    reference.set('a', 'function');

                    assert.calledWith(spy, 'fnc');
                },
                'an array of strings and/or functions, which just needs to be attached': function(){
                    var spy = this.spy(),
                        target = this.connectorModel,
                        reference = new Neuro.Model(undefined, {
                            connector: {
                                'change': [target.testStr.bind(target), 'testFunc']
                            }
                        });

                    target.addEvent('testStr', spy);
                    target.addEvent('testFunc', spy);
                    reference.connect(target);

                    reference.set('a', 'string');

                    assert.calledWith(spy, 'str');
                    assert.calledWith(spy, 'fnc');
                },
                'an objects.': {
                    '* key should act as the parent event and values can be a': {
                        'string': function(){
                            var spy = this.spy(),
                                target = this.connectorModel,
                                reference = new Neuro.Model(undefined, {
                                connector: {
                                    'change': {
                                        '*': 'testStr'
                                    }
                                }
                            });

                            target.addEvent('testStr', spy);
                            reference.connect(target);

                            reference.set('a', 'string');

                            assert.calledWith(spy, 'str');
                        },
                        'function': function(){
                            var spy = this.spy(),
                                target = this.connectorModel,
                                reference = new Neuro.Model(undefined, {
                                    connector: {
                                        'change': this.connectorTestFunc.bind(target)
                                    }
                                });

                            target.addEvent('testFunc', spy);
                            reference.connect(target);

                            reference.set('a', 'function');

                            assert.calledWith(spy, 'fnc');
                        },
                        'array of strings and/or functions': function(){
                            var spy = this.spy(),
                                target = this.connectorModel,
                                reference = new Neuro.Model(undefined, {
                                    connector: {
                                        'change': [target.testStr.bind(target), 'testFunc']
                                    }
                                });

                            target.addEvent('testStr', spy);
                            target.addEvent('testFunc', spy);
                            reference.connect(target);

                            reference.set('a', 'string');

                            assert.calledWith(spy, 'str');
                            assert.calledWith(spy, 'fnc');
                        }
                    },
                    'All other keys should be subEvents (parent:subevent), and values can be a': {
                        'string': function(){
                            var spy = this.spy(),
                                target = this.connectorModel,
                                reference = new Neuro.Model(undefined, {
                                connector: {
                                    'change': {
                                        'a': 'testKeyVal'
                                    }
                                }
                            });

                            target.addEvent('testKeyVal', spy);
                            reference.connect(target);

                            reference.set('a', 'string');

                            assert.calledWith(spy, reference, 'a', 'string', undefined);
                        },
                        'function': function(){
                            var spy = this.spy(),
                                target = this.connectorModel,
                                reference = new Neuro.Model(undefined, {
                                    connector: {
                                        'change': {
                                            'a': target.testKeyVal.bind(target)
                                        }
                                    }
                                });

                            target.addEvent('testKeyVal', spy);
                            reference.connect(target);

                            reference.set('a', 'function');

                            assert.calledWith(spy, reference, 'a', 'function', undefined);
                        },
                        'array of strings and/or functions': function(){
                            var spy = this.spy(),
                                target = this.connectorModel,
                                reference = new Neuro.Model(undefined, {
                                    connector: {
                                        'change': {
                                            'a': ['testKeyVal', target.testKeyVal.bind(target)]
                                        }
                                    }
                                });

                            target.addEvent('testKeyVal', spy);
                            reference.connect(target);

                            reference.set('a', 'keyVal');

                            assert.calledTwice(spy);
                            assert.calledWith(spy, reference, 'a', 'keyVal', undefined);
                        }
                    }
                }
            },

            'should connect only one object': function(){
                var model1, model2,
                    destroySpy = this.spy(),
                    setSpy = this.spy();

                model1 = model1 = new this.connectorTestModel({id: 1}, {
                    connector: {
                        'change': {
                            'name': function(model, prop, val){
                                model2.set(prop, val);
                            }
                        }
                    }
                });

                model2 = new this.connectorTestModel({id: 2}, {
                    connector: {
                        'destroy': 'destroy'
                    }
                });

                model1.connect(model2);

                model1.addEvent('destroy', destroySpy);

                model2.addEvent('change:name', setSpy);

                // should trigger model2's set method
                model1.set('name', 'Garrick');
                assert.calledOnceWith(setSpy, model2, 'name', 'Garrick', undefined);

                // should not trigger model1's destroy method
                model2.destroy();
                refute.calledOnceWith(destroySpy, model1);
            },

            'should connect both objects optionally': function(){
                var model1, model2,
                    destroySpy = this.spy(),
                    setSpy = this.spy(),
                    twoWayConnect = true;

                model1 = model1 = new this.connectorTestModel({id: 1}, {
                    connector: {
                        'change': {
                            'name': function(model, prop, val){
                                model2.set(prop, val);
                            }
                        }
                    }
                });

                model2 = new this.connectorTestModel({id: 2}, {
                    connector: {
                        'destroy': 'destroy'
                    }
                });

                model1.connect(model2, twoWayConnect);

                model1.addEvent('destroy', destroySpy);

                model2.addEvent('change:name', setSpy);

                // should trigger model2's set method
                model1.set('name', 'Garrick');
                assert.calledOnceWith(setSpy, model2, 'name', 'Garrick', undefined);

                // should trigger model1's destroy method
                model2.destroy();
                assert.calledOnceWith(destroySpy, model1);
            },

            'should optionally disconnect both objects': function(){
                var model1, model2,
                    destroySpy = this.spy(),
                    setSpy = this.spy()
                    twoWayDisconnect = true;

                model1 = model1 = new this.connectorTestModel({id: 1}, {
                    connector: {
                        'change': {
                            'name': function(model, prop, val){
                                model2.set(prop, val);
                            }
                        }
                    }
                });

                model2 = new this.connectorTestModel({id: 2}, {
                    connector: {
                        'destroy': 'destroy'
                    }
                });

                model1.connect(model2, twoWayDisconnect);

                model1.disconnect(model2, twoWayDisconnect);

                model1.addEvent('destroy', destroySpy);

                model2.addEvent('change:name', setSpy);

                model1.set('name', 'Garrick');
                model2.destroy();

                refute.called(destroySpy);
                refute.called(setSpy);
            }
        },

        'should accept a key that defines a more specific connector object to use for connect/disconnect': function(){
            var model1, model2,
                destroySpy = this.spy(),
                setSpy = this.spy();

            model1 = model1 = new this.connectorTestModel({id: 1}, {
                connector: {
                    customTestConnector:{
                        'change': {
                            'name': function(model, prop, val){
                                model2.set(prop, val);
                            }
                        }
                    }
                }
            });

            model2 = new this.connectorTestModel({id: 2}, {
                connector: {
                    'destroy': 'destroy'
                }
            });

            model1.connect(model2, 'customTestConnector');

            model1.addEvent('destroy', destroySpy);

            model2.addEvent('change:name', setSpy);

            // should trigger model2's set method
            model1.set('name', 'Garrick');
            assert.calledOnceWith(setSpy, model2, 'name', 'Garrick', undefined);

            // should not trigger model1's destroy method
            model2.destroy();
            refute.calledOnceWith(destroySpy, model1);
        }
    },

    'Snitch': {
        'setUp': function(){
            var validators = {
                a: Type.isString,
                b: Type.isNumber,
                c: Type.isArray
            };

            var model = new Class({
                Extends: Neuro.Model,
                _validators: validators
            });

            this.mockSnitchModel = model;

            var modelB = new Class({
                Extends: Neuro.Model,
                _validators: {
                    '*': function(prop, val){
                        return validators[prop] && validators[prop](val) || true
                    }
                }
            });

            this.mockSnitchModelB = modelB;
        },

        'setupValidators should be run during instantiation': function(){
            var model = new this.mockSnitchModel({}, {
                validators: {
                    d: Type.isFunction
                }
            });

            assert.equals(Object.getLength(model._validators), 4);
        },

        'set should set a property when validation is': {
            'true': {
                'where a validator does not exist': function(){
                    var model = new this.mockSnitchModel();

                    // no validator automatically sets value
                    model.set('d', true);
                    assert.equals(model.get('d'), true);
                },
                'where a validator exists and returns true': function(){
                    var model = new this.mockSnitchModel();

                    // check against Type.isString
                    model.set('a', 'str');
                    assert.equals(model.get('a'), 'str');
                },
                'where a global (*) validator exists and returns true': function(){
                    var model = new this.mockSnitchModelB();

                    // Unset the existing validator
                    model.set('a', 'str');
                    assert.equals(model.get('a'), 'str');
                }
            }
        },

        'set should not set a property when validation is false where a validator exists and returns false and trigger error and errorProperty events': function(){
            var spyError = this.spy(),
                spyErrorProperty = this.spy(),
                model = new this.mockSnitchModel();

            model.addEvent('error', spyError),
            model.addEvent('error:b', spyErrorProperty);

            // check against Type.isNumber
            model.set('b', '1');
            refute.equals(model.get('b'), '1');

            assert.calledWith(spyError, model);
            assert.calledWith(spyErrorProperty, model, 'b', '1');
        },

        'proof should test the model data against every validator': function(){
            var model = new this.mockSnitchModel({
                a: 'str',
                b: 1,
                c: []
            });

            assert.equals(model.proof(), true);

            model.set('d', {});

            model.setValidator('d', Type.isFunction);

            assert.equals(model.proof(), false);
        }
    },

    'Object Methods': {
        setUp: function(){
            this.mockComparatorData = {
                a: 'str',
                b: 29,
                c: {}
            }

            this.mockComparatorModel = new Neuro.Model(this.mockComparatorData);
        },

        'Subet should return a subset of data': function(){
            var model = this.mockComparatorModel,
                test = model.subset(['a', 'b']),
                result = {a: 'str', b: 29};

            assert.equals(test, result);
        },

        'Map should return data that has been mapped according to comparator': function(){
            var test = this.mockComparatorModel.map(Type.isNumber),
                result = {a: false, b: true, c: false};

            assert.equals(test, result);
        },

        'Filter should return filtered data according to comparator': function(){
            var test = this.mockComparatorModel.filter(Type.isNumber),
                result = {'b': 29};

            assert.equals(test, result);
        },

        'Every should return true if every value in the data match the comparator, otherwise false': function(){
            var test = this.mockComparatorModel.every(typeOf),
                test2 = this.mockComparatorModel.every(Type.isNumber);

            assert(test);
            refute(test2);
        },

        'Some should return true if some of the values in the data match the comparator, otherwise false': function(){
            var test = this.mockComparatorModel.some(Type.isNumber),
                test2 = this.mockComparatorModel.some(Type.isArray);

            assert(test);
            refute(test2);
        },

        'Keys should return an array containing the keys of the data': function(){
            var test = this.mockComparatorModel.keys(),
                result = ['a', 'b', 'c'];

            assert.equals(test, result);
        },

        'Values should return an array containing the values of the data': function(){
            var test = this.mockComparatorModel.values(),
                result = ['str', 29, {}];

            assert.equals(test, result);
        },

        'getLength should return the number of data properties': function(){
            var test = this.mockComparatorModel.getLength(),
                result = 3;

            assert.same(test, result);
        },

        'KeyOf should return the key that references the value in the data properties': function(){
            var test = this.mockComparatorModel.keyOf('str'),
                result = 'a';

            assert.same(test, result);
        },

        'Contains should return true if a value exists in the data properties': function(){
            var test = this.mockComparatorModel.contains('str'),
                test2 = this.mockComparatorModel.contains(30),
                result = true,
                result2 = false;

            assert.same(test, result);
            assert.same(test2, result2);
        },

        'ToQueryString should return a query string representation of the data properties': function(){
            var test = this.mockComparatorModel.toQueryString(),
                result = 'a=str&b=29&';

            assert.same(test, result);
        }
    }
});