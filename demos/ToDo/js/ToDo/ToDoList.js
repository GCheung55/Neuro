exports: ToDoList

var Observer = require('company').Unit

var ToDoList = new Class({
    Implements: [Class.Binds, Class.Singleton, Options],

    options: {
        unitOptions: {}
    },

    initialize: function(element, options){
        element = this.element = document.id(element);

        if (!element) { return false; }

        return this.check(element) || this.setup(element, options);
    },

    setup: function(element, options){
        this.setOptions(options);

        this.unit = new Observer(this.options.unitOptions);

        this.attachEvents(element);

        return this;
    },

    attachEvents: function(element){
        var prefix = this.unit.getPrefix();
        this.unit.subscribe( (prefix ? prefix + '.' : '') + 'add', this.bound('add'));

        return this;
    },

    detachEvents: function(element){
        var prefix = this.unit.getPrefix();
        this.unit.unsubscribe( (prefix ? prefix + '.' : '') + 'add', this.bound('add'));

        return this;
    },

    add: function(collection, model){
        var listItem = this.create(model, collection);

        listItem.inject(this.element, 'top');

        return this;
    },

    create: function(model, collection){
        var listItem = new Element('li', {
            html: '<strong class="title">' + model.get('title') + '</strong><div>Created on <span class="date">' + model.get('date') + '</span></div> <a class="mark">Complete</a><a class="destroy">Remove</a>',
            events: {
                'click:relay(a.mark)': function(e){
                    e.preventDefault();

                    model.set('complete', !model.get('complete'));
                },
                'click:relay(a.destroy)': function(e){
                    e.preventDefault();

                    collection.remove(model);
                }
            }
        });

        var prefix = model.getPrefix(),
            destroy = function(collection, model){
                listItem.destroy();
                this.unit.unsubscribe((prefix ? prefix + '.' : '') + 'destroy', destroy);
            }.bind(this);

        this.unit.subscribe((prefix ? prefix + '.' : '') + 'destroy', destroy);

        return listItem;
    }
});