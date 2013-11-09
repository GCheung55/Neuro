/*jshint onevar:false */

if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../../');
}

var expect = buster.expect;
var Router = Neuro.Router;

buster.testCase('Route.dispose()', {

    setUp: function(){
        this.router = new Router;
    },

    tearDown: function(){
        this.router.empty();
    },


    'should dispose route': function(){
        var t1, t2, t3, t4;

        var a = this.router.add({
            pattern: '/{foo}_{bar}',
            callback: function(route, foo, bar){
                t1 = foo;
                t2 = bar;
            }
        }).get(0);

        this.router.parse('/lorem_ipsum');

        a.destroy();

        this.router.parse('/foo_bar');

        expect( t1 ).toBe( 'lorem' );
        expect( t2 ).toBe( 'ipsum' );
    }

});