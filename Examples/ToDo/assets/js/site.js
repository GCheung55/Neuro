// Prep ToDo Collection
window.addEvent('domready', function(){
    var collection = new Neuro.Collection(null, {
        silentSetup: true,
        Prefix: 'ToDoCollection'
    });

    collection.subscribe('ToDoCollection.addToDo', collection.add);
});

// Prep ToDo Form
window.addEvent('domready', function(){
    var form = document.id('toDoForm');
    if (!form) { return; }

    var toDoForm = new ToDoForm(form, {
        unitOptions: {
            Prefix: 'ToDoCollection'
        }
    });
});

// Prep ToDo List
window.addEvent('domready', function(){
    var list = document.id('toDoList');
    if (!list) { return; }

    var toDoList = new ToDoList(list, {
        unitOptions: {
            Prefix: 'ToDoCollection'
        }
    });
});

// Prep ToDo Counter
window.addEvent('domready', function(){
    var counter = document.id('toDoCounter');
    if (!counter) { return; }

    var count = counter.getElement('span.count'),
        max = counter.getElement('span.max'),
        unit = new Neuro.Observer({
            initSetup: function(){
                this.complete = this.complete.bind(this);

                this.subscribe('ToDoCollection.add', this.updateMax);
                this.subscribe('ToDoCollection.remove', this.updateMax);
                this.subscribe('ToDoCollection.remove', this.updateCount);

                this.subscribe('ToDoCollection.add', this.bindWithComplete.bind(this));
                this.subscribe('ToDoCollection.remove', this.unbindWithComplete.bind(this));
            },

            updateMax: function(collection){
                var len = collection._models.length
                max.set('text', len);
            },

            updateCount: function(collection){
                var len = collection.filter(function(model){
                    return model.get('complete');
                }).length;
                count.set('text', len);
            },

            incrementCount: function(){
                count.set('text', count.get('text').toInt() + 1);
            },

            decrementCount: function(){
                count.set('text', count.get('text').toInt() - 1);
            },

            bindWithComplete: function(collection, model){
                var prefix = model.getPrefix();
                this.subscribe( (prefix ? prefix + '.' : '') + 'change:complete', this.complete );
            },

            unbindWithComplete: function(collection, model){
                var prefix = model.getPrefix();
                this.unsubscribe( (prefix ? prefix + '.' : '') + 'change:complete', this.complete );
            },

            complete: function(model, key, val){
                this[ (val) ? 'incrementCount' : 'decrementCount' ]();
            }
        });

});