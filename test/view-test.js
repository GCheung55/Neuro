if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../');
}

var assert = buster.assert;
var refute = buster.refute;

buster.testCase('Neuro View', {
    requiresSupportFor: {
        DOM: typeof document != "undefined"
    },

    setUp: function(){
        this.view = new Neuro.View();

        this.testView = new Class({
            Extends: Neuro.View,
            clickMethod: function(){
                this.fireEvent('clicked', arguments);
                return this;
            },
            relayTestMethod: function(){
                return this.clickMethod('fromRelayTestMethod');
            }
        });

        this.mockElement = new Element('div', {
            id: 'mockElement',
            html:'<a class="button">Words</a>'
        });
    },

    'should return a View instance': function(){
        // buster.assert.hasPrototype(this.view, Neuro.View);
        assert(instanceOf(this.view, Neuro.View));
    },

    'should store the element': function(){
        var view = new Neuro.View({
            element: this.mockElement
        });

        assert(!!view.element);
    },

    'should attach/detach event handlers to the element from the option.events property where the handler is': {
        'a string': function(){
            var spy = this.spy(),
                view = new this.testView({
                    onClicked: spy,
                    element: this.mockElement,
                    events: {
                        'click': 'clickMethod'
                    }
                });

            view.element.fireEvent('click', 'one');

            view.detachEvents();

            view.element.fireEvent('click', 'two');

            assert.calledWith(spy, 'one');
            refute.calledWith(spy, 'two');
        },

        'a function': function(){
            var spy = this.spy(),
                count = 1,
                view = new this.testView({
                    element: this.mockElement,
                    events: {
                        'click': function(){
                            spy(count++);
                        }
                    }
                });

            view.element.fireEvent('click');

            view.detachEvents();

            view.element.fireEvent('click');

            assert.calledWith(spy, 1);
            refute.calledWith(spy, 2);
        },

        'a mixed array of strings and/or functions': function(){
            var spy = this.spy(),
                count = 1,
                view = new this.testView({
                    onClicked: spy,
                    element: this.mockElement,
                    events: {
                        'click': ['clickMethod', function(){spy(count++)}]
                    }
                });

            view.element.fireEvent('click', 'one');

            view.detachEvents();

            view.element.fireEvent('click', 'two');

            assert.calledWith(spy, 'one');
            assert.calledWith(spy, 1);

            refute.calledWith(spy, 'two');
            refute.calledWith(spy, 2);
        }
    },

    'render should trigger render event': function(){
        var spy = this.spy(),
            view = new this.testView({
                onRender: spy
            });

        view.render();

        assert.calledWith(spy, view);
    },

    'inject should place the element above/below/top/bottom of the referenced element and trigger inject event': function(){
        var container = new Element('div', {id: 'container'}),
            reference = new Element('p', {html: '<span></span>'}).inject(container),
            spy = this.spy(),
            view = new this.testView({
                onInject: spy,
                element: this.mockElement
            });

        view.inject(reference, 'top');
        assert.equals(reference.getChildren()[0], view.element);
        assert.calledWith(spy, view, reference, 'top');

        view.inject(reference, 'bottom');
        assert.equals(reference.getChildren()[1], view.element);
        assert.calledWith(spy, view, reference, 'bottom');

        view.inject(reference, 'after');
        assert.equals(container.getChildren()[1], view.element);
        assert.calledWith(spy, view, reference, 'after');

        view.inject(reference, 'before');
        assert.equals(container.getChildren()[0], view.element);
        assert.calledWith(spy, view, reference, 'before');
    },

    'dispose should remove the element from DOM but keep it in memory and trigger the dispose event': function(){
        var container = new Element('div', {id: 'container'}),
            spy = this.spy(),
            eventSpy = this.spy(),
            view = new this.testView({
                onDispose: spy,
                element: this.mockElement,
                events: {
                    'click': eventSpy
                }
            }).inject(container);

        view.dispose();

        // should retain a reference of the element
        assert(view.element);
        view.element.fireEvent('click');
        assert.called(eventSpy);

        // container shouldn't have any child nodes after view dispose
        assert.equals(container.getChildren().length, 0);

        assert.calledWith(spy, view);
    },

    'destroy should remove the element form DOM, detach the events, remove reference to the element, and trigger the destroy event': function(){
        var container = new Element('div', {id: 'container'}),
            spy = this.spy(),
            eventSpy = this.spy(),
            element = this.mockElement,
            view = new this.testView({
                onDestroy: spy,
                element: element,
                events: {
                    'click': eventSpy
                }
            }).inject(container);

        view.destroy();

        // should not have a reference to the element
        refute(view.element);
        element.fireEvent('click');
        refute.called(eventSpy);

        // container shouldn't have any child nodes after view dispose
        assert.equals(container.getChildren().length, 0);
        
        assert.calledWith(spy, view);
    }
});