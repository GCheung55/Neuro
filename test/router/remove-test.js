/*jshint onevar:false */

if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../../');
}

var expect = buster.expect;
var Router = Neuro.Router;

buster.testCase('Router.toString() and route.toString()', {

    setUp: function(){
        this.router = new Router
    },

    tearDown: function(){
        this.router.empty();
    },



    'Router.removeRoute()': {

        'should remove by reference': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: '/{foo}_{bar}',
                callback: function(route, foo, bar){
                    t1 = foo;
                    t2 = bar;
                }
            }).get(0);

            this.router.parse('/lorem_ipsum');
            this.router.remove(a);
            this.router.parse('/foo_bar');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 'ipsum' );
        }

    },



    'Router.removeAll()': {

        'should removeAll': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: '/{foo}/{bar}',
                callback: function(route, foo, bar){
                    t1 = foo;
                    t2 = bar;
                }
            }).get(0);
            

            var b = this.router.add({
                pattern: '/{foo}_{bar}',
                callback: function(route, foo, bar){
                    t1 = foo;
                    t2 = bar;
                }
            }).get(1);

            expect( this.router.length ).toBe( 2 );
            this.router.empty();
            expect( this.router.length ).toBe( 0 );

            this.router.parse('/lorem/ipsum');
            this.router.parse('/foo_bar');

            expect( t1 ).not.toBeDefined();
            expect( t2 ).not.toBeDefined();
            expect( t3 ).not.toBeDefined();
            expect( t4 ).not.toBeDefined();
        }

    }


});