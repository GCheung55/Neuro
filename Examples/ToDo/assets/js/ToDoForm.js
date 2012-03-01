var ToDoForm = new Class({
    Implements: [Class.Binds, Class.Singleton, Options],

    options: {
        unitOptions: {}
    },

    initialize: function(element, options){
        element = this.element = document.id(element);

        if (!element) {
            return;
        }

        return this.check(element) || this.setup(element, options);
    },

    setup: function(element, options){
        this.setOptions(options);

        this.unit = new Neuro.Observer(this.options.unitOptions);

        this.attachEvents(element);

        return this;
    },

    attachEvents: function(element){
        var events = {
            'submit': this.bound('submit'),
            'click:relay(input[type=submit])': this.bound('submit')
        };

        element.addEvents(events);

        return this;
    },

    detachEvents: function(element){
        var events = {
            'submit': this.bound('submit'),
            'click:relay(input[type=submit])': this.bound('submit')
        };

        element.removeEvents(events);

        return this;
    },

    submit: function(e){
        e.preventDefault();

        var input = this.element.getElement('input[name=title]');
        if (!input.value.length) { return false; }

        var data = {
            title: input.value,
            date: new Date(),
            complete: false
        };

        this.unit.publish('addToDo', data);

        this.reset();

        return this;
    },

    reset: function(){
        this.element.reset();

        return this;
    }

});