/*jshint onevar:false */

if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../../');
}

var expect = buster.expect;
var Router = Neuro.Router;

buster.testCase('Route.interpolate()', {

    setUp: function(){
        this.router = new Router;
    },

    tearDown: function(){
        this.router.empty();
    },


    'should replace regular segments': function(){
        var a = this.router.add({
            pattern: '/{foo}/:bar:'
        }).get(0);

        expect( a.interpolate({foo: 'lorem', bar: 'ipsum'}) ).toEqual( '/lorem/ipsum' );
        expect( a.interpolate({foo: 'dolor-sit'}) ).toEqual( '/dolor-sit' );
    },

    'should allow number as segment (#gh-54)': function(){
        var a = this.router.add({
            pattern: '/{foo}/:bar:'
        }).get(0);

        expect( a.interpolate({foo: 123, bar: 456}) ).toEqual( '/123/456' );
        expect( a.interpolate({foo: 123}) ).toEqual( '/123' );
    },

    'should replace rest segments': function(){
        var a = this.router.add({
            pattern: 'lorem/{foo*}:bar*:'
        }).get(0);

        expect( a.interpolate({'foo*': 'ipsum/dolor', 'bar*': 'sit/amet'}) ).toEqual( 'lorem/ipsum/dolor/sit/amet' );
        expect( a.interpolate({'foo*': 'dolor-sit'}) ).toEqual( 'lorem/dolor-sit' );
    },

    'should replace multiple optional segments': function(){
        var a = this.router.add({
            pattern: 'lorem/:a::b::c:'
        }).get(0);

        expect( a.interpolate({a: 'ipsum', b: 'dolor'}) ).toEqual( 'lorem/ipsum/dolor' );
        expect( a.interpolate({a: 'ipsum', b: 'dolor', c : 'sit'}) ).toEqual( 'lorem/ipsum/dolor/sit' );
        expect( a.interpolate({a: 'dolor-sit'}) ).toEqual( 'lorem/dolor-sit' );
        expect( a.interpolate({}) ).toEqual( 'lorem' );
    },

    'should throw an error if missing required argument': function () {
        var a = this.router.add({
            pattern: '/{foo}/:bar:'
        }).get(0);

        expect( function(){
            a.interpolate({bar: 'ipsum'});
        }).toThrow( 'Error' /*'The segment {foo} is required.'*/ );
    },

    'should throw an error if string doesn\'t match pattern': function(){
        var a = this.router.add({
            pattern: '/{foo}/:bar:'
        }).get(0);

        expect( function(){
            a.interpolate({foo: 'lorem/ipsum', bar: 'dolor'});
        }).toThrow( 'Error' /*'Invalid value "lorem/ipsum" for segment "{foo}".'*/ );
    },

    'should throw an error if route was created by an RegExp pattern': function () {
        var a = this.router.add({
            pattern: /^\w+\/\d+$/
        }).get(0);

        expect( function(){
            a.interpolate({bar: 'ipsum'});
        }).toThrow( 'Error' /*'Route pattern should be a string.'*/ );
    },

    'should throw an error if generated string doesn\'t validate against rules': function () {
        var a = this.router.add({
            pattern: '/{foo}/:bar:',
            rules: {
                foo : ['lorem', 'news'],
                bar : /^\d+$/
            }
        }).get(0);

        expect( function(){
            a.interpolate({foo: 'lorem', bar: 'ipsum'});
        }).toThrow( 'Error' /*'Generated string doesn\'t validate against `Route.rules`.'*/ );
    }

});