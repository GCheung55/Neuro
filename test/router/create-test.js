/*jshint onevar:false */

if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../../');
}

var expect = buster.expect;
var Router = Neuro.Router;

buster.testCase('new Router()', {

    setUp: function(){
        this.router = new Router;
    },
    
    tearDown: function(){
        this.router.empty();
    },


    'new Router instance': {

        'should work in new instances': function(){
            var t1;
            var cr = new Router;

            cr.add({
                pattern:'/{foo}',
                callback: function(route, foo){
                    t1 = foo;
                }
            });

            cr.parse('/lorem_ipsum');

            expect( t1 ).toBe( 'lorem_ipsum' );
        },

        'shouldn\'t affect static instance': function(){
            var t1;
            var cr = new Router;

            cr.add({
                pattern: '/{foo}', 
                callback: function(route, foo){
                    t1 = foo;
                }
            });

            this.router.add({
                pattern: '/{foo}', 
                callback: function(route, foo){
                    t1 = 'error!';
                }
            });

            cr.parse('/lorem_ipsum');

            expect( t1 ).toBe( 'lorem_ipsum' );
        },

        'shouldn\'t be affected by static instance': function(){
            var t1;
            var cr = new Router;

            this.router.add({
                pattern: '/{foo}', 
                callback: function(route, foo){
                    t1 = foo;
                }
            });

            cr.add({
                pattern:'/{foo}', 
                callback: function(route, foo){
                    t1 = 'error!';
                }
            });
            
            this.router.parse('/lorem_ipsum');

            expect( t1 ).toBe( 'lorem_ipsum' );
        }

    }

});