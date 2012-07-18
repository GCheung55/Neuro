buster.testCase('Neuro Model', {
    setUp: function(){
        var testModel = new Class({
            Extends: Neuro.Model,
            options: {
                defaults: {
                    'firstName': '',
                    'lastName': '',
                    'fullName': '',
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
                        var data = isPrevious ? this._previousData : this._data;

                        return data['fullName'];
                    }
                }
            }
        });

        this.mockModel = new testModel();

        this.mockData = {
            'firstName': 'Garrick',
            'lastName': 'Cheung',
            'fullName': 'Garrick Cheung',
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
        this.mockModelWithData.set('age', 30);
        var test = this.mockModelWithData.getPrevious('age'),
            result = 29;

        assert.equals(test, result);
    },

    'getPreviousData should return the previously changed dataset': function(){
        var test = this.mockModelWithData.set('age', 30).getPreviousData(),
            result = this.mockData;

        assert.equals(test, result);

        test = this.mockModelWithData.set('age', 29).getPreviousData();
        refute.equals(test, result);
    },

    'custom accessors should be used to set/get property': function(){
        var test = this.mockModelWithData.set('fullName', 'Mark Obcena').get('fullName'),
            result = 'Mark Obcena';

        assert.equals(test, result);
    },

    'setAccessor/getAccessor should set/get accessors that are used to set/get properties': function(){
        var accessor = {
            set: function(key, val){
                if (val) {
                    var name = val.split(' '),
                        first = val[1],
                        last = val[0];

                    this.set('firstName', first);
                    this.set('lastName', last);
                    this._data['fullName'] = first + ' ' + last;
                }
            },
            get: this.mockModelWithData.getAccessor('fullName').get
        }

        this.mockModelWithData.setAccessor('fullName', accessor);

        assert.equals(accessor, this.mockModelWithData.getAccessor('fullName'));
    },

    'unsetAccessor should unset accessor by key': function(){
        var test = this.mockModelWithData.unsetAccessor('fullName').set('fullName', 'something').get('firstName'),
            result = 'Garrick';

        assert.equals(test, result);
    },

    'JSON encode/stringify should return a json string of the data': function(){
        var test = JSON.encode(this.mockModelWithData),
            result = '{"firstName":"Garrick","lastName":"Cheung","fullName":"Garrick Cheung","age":29}';

        assert.equals(test, result);
    },

    'should trigger a change event attached to the model': function(){
        var spy = this.spy(),
            model = this.mockModelWithData.addEvent('change', spy);

        model.set('age', 30);

        assert.called(spy);
        assert.calledWith(spy);
    },

    'should trigger a change event that notifies what property and value was changed': function(){
        var spy = this.spy(),
            model = this.mockModelWithData.addEvent('change:age', spy);

        model.set('age', 30);

        assert.called(spy);
        assert.calledWith(spy, 'age', 30, 29);
    },

    'should trigger an event when the model is destroyed': function(){
        var spy = this.spy(),
            model = this.mockModelWithData.addEvent('destroy', spy);

        model.destroy();

        assert.called(spy);
        assert.calledWith(spy);
    },

    'should enable/disable signal execution with the silence method': function(){
        var spy = this.spy(),
            model = new Neuro.Model();

        model.addEvent('change', spy);

        model.set('a', 'rts');

        model.silence(function(){
            model.set('b', {});
        });

        assert.equals(model.get('a'), 'rts');
        assert.equals(model.get('b'), {});

        assert.calledOnceWith(spy);
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

                            assert.calledWith(spy, 'a', 'string', undefined);
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

                            assert.calledWith(spy, 'a', 'function', undefined);
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
                            assert.calledWith(spy, 'a', 'keyVal', undefined);
                        }
                    }
                }
            }
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