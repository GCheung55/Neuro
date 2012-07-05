buster.testCase('Neuro Collection', {
    setUp: function(){
        this.mockCollection = new Neuro.Collection();

        this.mockData = {
            a: 'str', b: [], c: {}
        };
    },

    'should return a Collection instance': function(){
        assert(instanceOf(this.mockCollection, Neuro.Collection));
    },

    'should add data by creating a new Model instance to the Collection instance': function(){
        var models = this.mockCollection._models;

        assert.same(models.length, 0);

        this.mockCollection.add(this.mockData);

        assert.same(models.length, 1);

        assert(instanceOf(models[0], Neuro.Model));

        assert.equals(models[0].getData(), this.mockData);
    },

    'should add a model instance if it does not exist in the Collection instance': function(){
        var model = new Neuro.Model(this.mockData);

        this.mockCollection.add([model, model]);

        assert.same(this.mockCollection._models.length, 1);

        assert.equals(model, this.mockCollection.get(0));

        assert.equals(model.getData(), this.mockCollection.get(0).getData());
    },

    'should check the primaryKey, if defined, to decide whether a model instance can be added': function(){
        var model = new Neuro.Model(this.mockData),
            collection = new Neuro.Collection([this.mockData], {primaryKey: 'a'});

        assert.same(collection._models.length, 1);

        collection.add(model);

        assert.same(collection._models.length, 1);
    },

    'should get a Model instance / instances by index number': function(){
        var model, models;

        this.mockCollection.add([this.mockData, this.mockData, this.mockData]);

        model = this.mockCollection.get(0);

        models = this.mockCollection.get(0, 2);

        assert.same(model, this.mockCollection._models[0]);
        assert.equals(models, [this.mockCollection._models[0], this.mockCollection._models[2]])
    },

    'should remove a Model instance by model object': function(){
        var model, models = this.mockCollection._models;

        this.mockCollection.add([this.mockData, this.mockData]);

        model = this.mockCollection.get(0);

        assert.same(models.length, 2);

        this.mockCollection.remove(model);

        assert.same(models.length, 1)
    },

    'should replace an existing model with a new one': function(){
        var oldModel, test = {e: false};

        this.mockCollection.add([this.mockData, {d: true}]);

        oldModel = this.mockCollection.get(0);

        this.mockCollection.replace(oldModel, test);

        assert.equals(test, this.mockCollection.get(0).getData());
    },

    'should empty the Collection instance of all models': function(){
        var models = this.mockCollection._models;

        this.mockCollection.add([this.mockData, this.mockData]);

        assert.same(models.length, 2);

        this.mockCollection.empty();

        refute(models.length);
    },

    'should return a JSON string of all models': function(){
        this.mockCollection.add([this.mockData, this.mockData]);

        assert.same(JSON.encode(this.mockCollection), '[{"a":"str","b":[],"c":{}},{"a":"str","b":[],"c":{}}]');
    },

    'should trigger a function that has been attached to the add event': function(){
        var spy = this.spy(),
            collection = this.mockCollection.addEvent('add', spy);

        collection.add(this.mockData);

        assert.called(spy);
        assert.calledWith(spy, collection.get(0));
    },

    'should trigger a function that has been attached to the remove event': function(){
        var spy = this.spy(),
            collection = this.mockCollection.addEvent('remove', spy),
            model;

        collection.add(this.mockData);
        
        model = collection.get(0);

        collection.remove( model );

        assert.called(spy);
        assert.calledWith(spy, model);
    },

    'should trigger a function that has been attached to the empty event': function(){
        var spy = this.spy(),
            collection = this.mockCollection.addEvent('empty', spy);

        collection.add([this.mockData, {d: true}]);

        collection.empty();

        assert.called(spy);
        assert.calledWith(spy);
        assert.equals(collection._models.length, 0);
    },

    'should trigger add and remove events during replace if signaled to': function(){
        var addSpy = this.spy(),
            removeSpy = this.spy(),
            newModel = new Neuro.Model(this.mockData),
            oldModel = new Neuro.Model(this.mockData).set('d', true)
            collection = this.mockCollection;

        collection.add(oldModel);

        collection.addEvent('add', addSpy);
        collection.addEvent('remove', removeSpy);

        collection.replace(oldModel, newModel, true);

        assert.called(addSpy);
        assert.calledWith(addSpy, newModel);

        assert.called(removeSpy);
        assert.calledWith(removeSpy, oldModel);
    },

    'should enable/disable signal execution with the silence method': function(){
        var spy = this.spy(),
            collection = this.mockCollection,
            model1 = new Neuro.Model(this.mockData),
            model2 = new Neuro.Model({Garrick:'Cheung'});

        collection.addEvent('add', spy);

        collection.add(model1);

        collection.silence(true);

        collection.add(model2);

        assert.equals(collection._models.length, 2);

        assert.calledWith(spy, model1);

        refute.calledWith(spy, model2);
    },

    'Array Methods': {
        'Each should loop over each Model instance': function(){
            var spy = this.spy();

            this.mockCollection.add([this.mockData, this.mockData]);

            this.mockCollection.each(spy);

            assert.called(spy);

            assert.calledWith(spy, this.mockCollection._models[0], 0, this.mockCollection._models);
            assert.calledWith(spy, this.mockCollection._models[1], 1, this.mockCollection._models);
        },

        'Invoke should execute a function over each Model instance and return an array or arrays of the executed functions value': function(){
            this.mockCollection.add([this.mockData, this.mockData]);

            var test = this.mockCollection.invoke('keys'),
                results = [['a','b','c'],['a','b','c']];

            assert.equals(test, results);
        },

        'Every should return true if every Model instance matches the comparator': function(){
            this.mockCollection.add(this.mockData);

            var test = this.mockCollection.every(typeOf),
                test2 = this.mockCollection.every(Type.isNumber);

            assert(test);
            refute(test2);
        },

        'Filter should return filtered Model instances according to comparator': function(){
            var test = this.mockCollection.add([this.mockData, {d:true}]).filter(function(model){
                    return model.get('d');
                }),
                result = [this.mockCollection.get(1)];

            assert.equals(test, result);
        },

        'Clean should return an array where none of the items in the array are null': function(){
            var test, result;

            this.mockCollection.add(this.mockData);

            this.mockCollection._models.push(0);

            this.mockCollection.add(this.mockData);

            this.mockCollection.clean();

            test = this.mockCollection.get(0, 1);

            result = [this.mockCollection._models[0], this.mockCollection._models[1]];

            assert.equals(test, result);
        },

        'IndexOf should return the index of a Model instance': function(){
            this.mockCollection.add([this.mockData, this.mockData, this.mockData]);

            var model = this.mockCollection.get(1),
                test = this.mockCollection.indexOf(model),
                result = 1;

            assert.same(test, result);
        },

        'Map should return an array whos items are the result of a function': function(){
            var test = this.mockCollection.add([this.mockData, this.mockData]).map(function(model){
                    return model.get('a') + 'str';
                }),
                result = ['strstr', 'strstr'];

            assert.equals(test, result);
        },

        'Some should return true if at least one item satisfies the provided testing function': function(){
            var test = this.mockCollection.add([this.mockData, this.mockData, {d:true}]). some(function(model){
                    return model.get('d');
                }),
                result = true;

            assert(result);
        },

        'Associate should create an object with key-value pairs based on the array of keywords passed in and the current content of the collection': function(){
            var test = this.mockCollection.add([this.mockData, this.mockData]).associate(['one', 'two']),
                result = {
                    one: this.mockCollection.get(0),
                    two: this.mockCollection.get(1)
                };

            assert.equals(test, result);
        },

        'Link should create an object from an object of key / function pairs to assign values': function(){
            var test = this.mockCollection.add([this.mockData, {d: true}]).link({
                    abc: function(model){ return Type.isString(model.get('a')) && Type.isArray(model.get('b')) && Type.isObject(model.get('c'));},
                    d: function(model){ return !model.get('a') && Type.isBoolean(model.get('d'));}
                }),
                result = {
                    abc: this.mockCollection.get(0),
                    d: this.mockCollection.get(1)
                };

            assert.equals(test, result);
        },

        'Contains should return a boolean value of whether the collection contains a model': function(){
            this.mockCollection.add([this.mockData, this.mockData]);

            var model = this.mockCollection.get(0),
                test = this.mockCollection.contains(model),
                result = true;

            assert(result);
        },

        'getLast should return the last model in the collection': function(){
            this.mockCollection.add([this.mockData, {d: true}, {e: 123}]);

            var test = this.mockCollection.getLast(),
                result = this.mockCollection.get(2);

            assert.same(test, result);
        },

        'getRandom should return a random model in the collection': function(){
            this.mockCollection.add([this.mockData, {d: true}, {e: 123}]);

            assert(this.mockCollection.contains( this.mockCollection.getRandom() ));
            assert(this.mockCollection.contains( this.mockCollection.getRandom() ));
            assert(this.mockCollection.contains( this.mockCollection.getRandom() ));
            assert(this.mockCollection.contains( this.mockCollection.getRandom() ));
        }
    }
});