buster.testCase('Neuro View', {
    setUp: function(){
        this.view = new Neuro.View();

        this.List = new Class({
            Extend: Neuro.View,
            options: {
                subscribeMap: {
                    'change': ['render']
                    ,'destroy': 'destroy'
                }
            },
            attachEvents: function(){
                this.element.addEvent('mouseenter:relay(li)', this.bound('mouseenter'));
                this.element.addEvent('mouseleave:relay(li)', this.bound('mouseleave'));
                return this;
            },
            detachEvents: function(){
                this.element.removeEvent('mouseenter:relay(li)', this.bound('mouseenter'));
                this.element.removeEvent('mouseleave:relay(li)', this.bound('mouseleave'));
                return this;
            },
            mouseenter: function(){
                return this;
            },
            mouseleave: function(){
                return this;
            },
            render: function(data){
                this.element = new Element('ul');
                this.parent(data);
                return this;
            }
        });

        this.ListItem = new Class({
            Extend: Neuro.View,
            options: {
                subscribeMap: {
                    'change': ['render']
                    ,'destroy': 'destroy'
                    ,'change:id': function(model, key, property){
                        return arguments;
                    }
                }
            },
            attachEvents: function(){
                this.element.addEvent('click', this.bound('click'));
                return this;
            },
            detachEvents: function(){
                this.element.removeEvent('click', this.bound('click'));
                return this;
            },
            click: function(){
                return this;
            },
            render: function(data){
                this.element = new Element('li', {
                    html: '<span>' + data.name + '</span>'
                });
                this.parent(data);
                return this;
            }
        });
    },
    'should return a View instance': function(){
        // buster.assert.hasPrototype(this.view, Neuro.View);
        expect(instanceOf(this.view, Neuro.View)).toBeTruthy();

    }
});