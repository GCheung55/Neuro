exports.setup = function(Tests){

    Tests.describe('Collection', function(it, setup){

        setup('beforeEach', function(){
            this.mockCollection = new Collection();

            this.mockData = {
                a: 'str', b: [], c: {}
            };
        });

        it('should return a Model instance', function(expect){
            expect(this.mockCollection).toBeAnInstanceOf(Collection);
        });

        it('should add data by creating a new Model instance to the Collection instance', function(expect){
            var models = this.mockCollection._models;

            expect(models.length).toEqual(0);

            this.mockCollection.add(this.mockData);

            expect(models.length).toEqual(1);

            expect(models[0]).toBeAnInstanceOf(Model);

            expect(models[0]).toBeSimilar(this.mockData);
        });

        it('should get a Model instance from the Collection instance by index number', function(expect){
            var model;

            this.mockCollection.add(this.mockData);

            model = this.mockCollection.get(0);

            expect(model).toBeSimilar(this.mockData);
        });

        it('should remove a Model instance from the Collection instance by model', function(expect){
            var model, models = this.mockCollection._models;

            this.mockCollection.add(this.mockData);
            this.mockCollection.add(this.mockData);

            model = this.mockCollection.get(0);

            expect(models.length).toEqual(2);

            this.mockCollection.remove(model);

            expect(models.length).toEqual(1);
        });

        it('should empty the Collection instance of all models', function(expect){
            this.mockCollection.add(this.mockData);
            this.mockCollection.add(this.mockData);
            expect(this.mockCollection._models.length).toEqual(2);

            this.mockCollection.empty();

            expect(this.mockCollection._models.length).toEqual(0);
        });

        it('should return a JSON string of all models contained in the Collection instance', function(expect){
            this.mockCollection.add(this.mockData);
            this.mockCollection.add(this.mockData);

            expect(JSON.stringify(this.mockCollection)).toBeSimilar('[{"a":"str","b":[],"c":{}},{"a":"str","b":[],"c":{}}]');
        });

    });

    Tests.describe('Collection: PubSub', function(it, setup){

        setup('before', function(){
            this.dispatcher = Unit.Dispatcher;
        });

        setup('beforeEach', function(){

            Unit.Dispatcher.flush();

            this.mockCollection = new Collection();

            this.mockPrefix = '123';

            this.mockData = {
                a: 'str', b: [], c: {}
            };
        });

        it('should notify subscribers of models added to Collection instance', function(expect){
            var spy = this.createSpy(),
                unit = new Unit().subscribe(this.mockPrefix + '.add', spy),
                model;

            this.mockCollection.setPrefix(this.mockPrefix).add(this.mockData);

            model = this.mockCollection.get(0);
            // make sure the model has the correct data
            expect(model.getData()).toBeSimilar(this.mockData);

            expect(spy.getCallCount()).toBe(1);
            expect(spy.getLastArgs()).toBeLike([this.mockCollection, model]);
        });

        it('should notify subscribers of models removed from Collection instance', function(expect){
            var spy = this.createSpy(),
                unit = new Unit().subscribe(this.mockPrefix + '.remove', spy),
                model;

            this.mockCollection.setPrefix(this.mockPrefix).add(this.mockData);
            model = this.mockCollection.get(0);
            // make sure the model has the correct data
            expect(model.getData()).toBeSimilar(this.mockData);

            this.mockCollection.remove(model);

            expect(spy.getCallCount()).toBe(1);
            expect(spy.getLastArgs()).toBeLike([this.mockCollection, model]);
        });

        it('should notify subscribers emptying Collection instance', function(expect){
            var spy = this.createSpy(),
                unit = new Unit().subscribe(this.mockPrefix + '.empty', spy),
                model;

            this.mockCollection.setPrefix(this.mockPrefix).add(this.mockData);
            model = this.mockCollection.get(0);
            // make sure the model has the correct data
            expect(model.getData()).toBeSimilar(this.mockData);

            this.mockCollection.empty();

            expect(spy.getCallCount()).toBe(1);
            expect(spy.getLastArgs()).toBeLike([this.mockCollection]);
            expect(this.mockCollection._models.length).toBe(0);
        });

    });

    Test.describe('Collection: Array methods', function(it, setup){

        setup('beforeEach', function(){
            this.mockCollection = new Collection();

            this.mockData = {
                a: 'str', b: [], c: {}
            };
        });

    });

};