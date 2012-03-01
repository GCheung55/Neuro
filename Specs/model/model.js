
exports.setup = function(Tests){

    Tests.describe('Model', function(it, setup){

        setup('beforeEach', function(){
            this.mockModel = new Neuro.Model();

            this.mockData = {
                'firstName': 'Garrick',
                'lastName': 'Cheung',
                'fullName': function(){
                    return this.get('firstName') + ' ' + this.get('lastName');
                },
                'age': 29
            };

            this.mockModelWithData = new Neuro.Model(this.mockData);
        });

        it('should return a Model instance', function(expect){
            expect(this.mockModel).toBeAnInstanceOf(Neuro.Model);
        });

        it('should return a Model instance with data', function(expect){
           expect(this.mockModelWithData).toBeAnInstanceOf(Neuro.Model);
           expect(this.mockModelWithData).not.toBeSimilar({});
        });

        // test get
        it('should return age 29 from Model instance', function(expect){
            var age = this.mockModelWithData.get('age');

            expect(age).toBe(29);
        });

        // test set
        it('should set and return age to be 30 from Model instance', function(expect){
            var age = this.mockModelWithData.set('age', 30).get('age');

            expect(age).toBe(30);
        });

        it('should set and dereference arrays an objects in Model instance', function(expect){
            var obj = {a: 'str', b: [], c: {more: 'tests'}},
                test, result;

            this.mockModel.set(obj);

            test = JSON.stringify(this.mockModel.getData());

            obj.a = 'rts';
            obj.b.push(0);
            obj.c.tests = 'more';
            result = JSON.stringify(obj);

            expect(test).not.toBeSimilar(result);
        });

        //test unset
        it('should unset and return age to be undefined from Model instance', function(expect){
            var age = this.mockModelWithData.unset('age').get('age');

            expect(age).toBeUndefined();
        });

        //test getData
        it('should return all data in the Model instance', function(expect){
            var data = this.mockModelWithData.getData(),
                obj = this.mockData;

            expect(data).toBeSimilar(obj);
        });

        it('should not change Model instance data if mock data object is changed', function(expect){
            this.mockData.firstName = 'Mark';

            var name = this.mockModelWithData.get('firstName');

            expect(name).not.toBe('Mark');
        });

        // not sure.. maybe?
        it('should execute Model instance data values stored as functions', function(expect){
            var fullName = this.mockModelWithData.get('fullName');

            expect(fullName).toBe('Garrick Cheung');
        });

        it('should set an optional prefix on the Model instance', function(expect){
            var prefix = 123,
                modelPrefix = new Neuro.Model(null, {Prefix: prefix}).getPrefix();

            expect(modelPrefix).toEqual(prefix);
        });

    });

    Tests.describe('Model: PubSub', function(it, setup){
        setup('before', function(){
            this.dispatcher = Neuro.Observer.Dispatcher;
        });

        setup('beforeEach', function(){
            Neuro.Observer.Dispatcher.flush();

            this.mockPrefix = '123';

            this.mockData = {
                'firstName': 'Garrick',
                'lastName': 'Cheung',
                'fullName': function(){
                    return this.get('firstName') + ' ' + this.get('lastName');
                },
                'age': 29
            };

            this.mockModelWithData = new Neuro.Model(this.mockData);
        });

        // test prefixed change publisher
        it('should notify subscribers of changed Model instance', function(expect){
            var fn = this.createSpy(),
                unit = new Neuro.Observer().subscribe(this.mockPrefix + '.change', fn);

            this.mockModelWithData.setPrefix(this.mockPrefix).set('age', 30);

            expect(fn.getCallCount()).toBe(1);
            expect(fn.getLastArgs()).toBeLike([this.mockModelWithData]);

        });

        // test prefixed changed data property publisher
        it('should notify subscribers of changed data property of changed Model instance', function(expect){
            var key = 'age',
                val = 30,
                fn = this.createSpy(),
                unit = new Neuro.Observer().subscribe(this.mockPrefix + '.change:' + key, fn);

            this.mockModelWithData.setPrefix(this.mockPrefix).set(key, val);

            expect(fn.getCallCount()).toBe(1);
            expect(fn.getLastArgs()).toBeLike([this.mockModelWithData, key, val]);
        });

        // test prefixed changed data property publisher when all data is set
        it('should notify subscribers of changed data property of changed Model instance', function(expect){
            var obj = {
                    firstName: 'notGarrick',
                    lastName: 'notCheung',
                    age: 30
                },
                key = 'age',
                fn = this.createSpy(),
                unit = new Neuro.Observer().subscribe(this.mockPrefix + '.change:' + key, fn);

            this.mockModelWithData.setPrefix(this.mockPrefix).set(obj);

            expect(fn.getCallCount()).toBe(1);
            expect(fn.getLastArgs()).toBeLike([this.mockModelWithData, key, 30]);
        });

    });

    Tests.describe('Model: Object methods', function(it, setup){
        setup('beforeEach', function(){
            this.mockData = {
                'firstName': 'Garrick',
                'lastName': 'Cheung',
                'fullName': function(){
                    return this.get('firstName') + ' ' + this.get('lastName');
                },
                'age': 29
            };

            this.mockModelWithData = new Neuro.Model(this.mockData);

            this.mockComparatorData = {
                'a': 'string',
                'b': 29,
                'c': {}
            }

            this.mockComparatorModel = new Neuro.Model(this.mockComparatorData);
        });

        it('should return a copy of Model instance data', function(expect){
            var test = this.mockModelWithData.clone(),
                result = this.mockModelWithData._data;

            expect(test).toBeSimilar(result);

            this.mockModelWithData.set('age', 30);
            expect(test).not.toBeSimilar(result);
        });

        it('should return subset of Model instance data', function(expect){
            var model = this.mockModelWithData,
                test = JSON.stringify(model.subset(['firstName', 'age'])),
                result = '{"firstName":"Garrick","age":29}';

            expect(test).toBeSimilar(result);
        });

        it('should map Model instance data according to comparator', function(expect){
            var test = this.mockComparatorModel.map(Type.isNumber);
                result = {'a':false,'b':true,'c':false};

            expect(test).toBeSimilar(result);
        });

        it('should filter Model instance data according to comparator', function(expect){
            var test = this.mockComparatorModel.filter(Type.isNumber),
                result = {'b': 29};

            expect(test).toBeSimilar(result);
        });

        it('should return true if every value in the Model instance matches the comparator, otherwise false', function(expect){
            var test = this.mockComparatorModel.every(typeOf),
                test2 = this.mockComparatorModel.every(Type.isNumber);

            expect(test).toBeTruthy();
            expect(test2).toBeFalsy();
        });

        it('should return true if some of the values in the Model instance match the comparator, otherwise false', function(expect){
            var test = this.mockComparatorModel.some(Type.isNumber),
                test2 = this.mockComparatorModel.some(Type.isArray);

            expect(test).toBeTruthy();
            expect(test2).toBeFalsy();
        });

        it('should return an array containing the keys of the Model instance data', function(expect){
            var test = this.mockComparatorModel.keys(),
                result = ['a', 'b', 'c'];

            expect(test).toBeLike(result);
        });

        it('should return an array containing the values of the Model instance data', function(expect){
            var test = this.mockComparatorModel.values(),
                result = ['string', 29, {}];

            expect(test).toBeLike(result);
        });

        it('should return a json string of the Model instance data', function(expect){
            var test = JSON.stringify(this.mockModelWithData),
                result = '{"firstName":"Garrick","lastName":"Cheung","age":29}';

            expect(test).toBeSimilar(result);
        });
    });

};