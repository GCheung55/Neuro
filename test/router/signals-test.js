/*jshint onevar:false */

if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../../');
}

var expect = buster.expect;
var Router = Neuro.Router;

buster.testCase('Router Signals', {

    setUp: function(){
        this.router = new Router;
    },

    tearDown: function(){
        this.router.empty();
    },



    'should dispatch bypassed if don\'t match any route': function(){
        var count = 0, requests = [];
        var a = this.router.add({
            pattern: '/{foo}_{bar}',
            callback: function(route, foo, bar){
                expect(null).toEqual('fail: shouldn\'t match');
            }
        }).get(0);

        this.router.addEvent('default', function(router, request){
            requests.push(request);
            count++;
        });

        this.router.parse('/lorem/ipsum');
        this.router.parse('/foo/bar');

        expect( requests[0] ).toBe( '/lorem/ipsum' );
        expect( requests[1] ).toBe( '/foo/bar' );
        expect( count ).toBe( 2 );
    },


    'should dispatch routed at each match': function(){
        var count = 0,
            requests = [],
            count2 = 0,
            routed,
            first;

        var a = this.router.add({
            pattern: '/{foo}_{bar}',
            callback: function(route, foo, bar){
                count++;
            }
        }).get(0);

        // Equiv to 'bypassed'
        this.router.addEvent('default', function(router, request){
            requests.push(request);
            count2++;
        });

        // Equiv to 'routed'
        this.router.addEvent('match', function(router, request, data){
            requests.push(request);
            count++;

            expect( request ).toBe( '/foo_bar' );
            expect( data.route ).toBe( a );
            expect( data.params[0] ).toEqual( 'foo' );
            expect( data.params[1] ).toEqual( 'bar' );
            routed = true;
            first = data.isFirst;
        });

        this.router.parse('/lorem/ipsum');
        this.router.parse('/foo_bar');

        expect( requests[0] ).toBe( '/lorem/ipsum' );
        expect( requests[1] ).toBe( '/foo_bar' );
        expect( count ).toBe( 2 );
        expect( count2 ).toBe( 1 );
        expect( routed ).toEqual( true );
        expect( first ).toEqual( true );

    },

    'should not dispatch match/default/passed twice for same request multiple times in a row': function(){
        var bypassed = [],
            routed = [],
            matched = [],
            switched = [];

        var a = this.router.add({
            pattern: '/{foo}_{bar}',
            callback: function(route, a, b){
                matched.push(a, b);
            }
        }).get(0);

        // Equiv to 'switched'
        this.router.addEvent('pass', function(router, req){
            switched.push(req);
        });

        // Equiv to 'bypassed'
        this.router.addEvent('default', function(router, req){
            bypassed.push(req);
        });

        // Equiv to 'routed'
        this.router.addEvent('match', function(router, req, data){
            routed.push(req);
            expect( data.route ).toBe( a );
        });

        this.router.parse('/lorem/ipsum'); // bypass
        this.router.parse('/foo_bar'); // match
        this.router.parse('/foo_bar'); // this shouldn't trigger routed/matched
        this.router.parse('/lorem_ipsum'); // match
        this.router.parse('/dolor'); // bypass
        this.router.parse('/dolor'); // this shouldn't trigger bypassed
        this.router.parse('/lorem_ipsum'); // this shouldn't trigger routed/matched
        this.router.parse('/lorem_ipsum'); // this shouldn't trigger routed/matched
        this.router.parse('/lorem_ipsum'); // this shouldn't trigger routed/matched

        // it should skip duplicates
        expect( routed ).toEqual( [
            '/foo_bar',
            '/lorem_ipsum'
        ]);
        expect( bypassed ).toEqual( [
            '/lorem/ipsum',
            '/dolor'
        ]);
        expect( switched ).toEqual( [] );
        expect( matched ).toEqual( [
            'foo',
            'bar',
            'lorem',
            'ipsum'
        ]);

    },


    'isFirst should be false on greedy matches': function(){

        var count = 0,
            firsts = [];

        // Equiv to 'routed'
        this.router.addEvent('match', function(router, req, data){
            count += 1;
            firsts.push(data.isFirst);
        });

        //anti-pattern!
        this.router.add([
            {
                pattern: '/{a}/{b}',
                greedy: true
            },
            {
                pattern: '/{a}/{b}',
                greedy: true
            },
            {
                pattern: '/{a}/{b}',
                greedy: true
            }
        ]);

        this.router.parse('/foo/bar');

        expect( count ).toEqual( 3 );
        expect( firsts[0] ).toEqual( true );
        expect( firsts[1] ).toEqual( false );
        expect( firsts[2] ).toEqual( false );

    },

    'should dispatch `pass` when matching another route': function(){

        var count = 0,
            vals = [],
            req;

        var r1 = this.router.add({
            pattern:'/{a}', 
            callback: function(route, a){
                vals.push(a);
                count += 1;
            }
        }).get(0);

        // Equiv to 'switched'
        r1.addEvent('pass', function(route, r){
            vals.push('SWITCH'); //make sure happened before next matched
            req = r;
            count += 1;
        });

        var r2 = this.router.add({
            pattern: '/foo/{a}', 
            callback: function(route, a){
                vals.push(a);
                count += 1;
            }
        }).get(1);

        // matching same route twice shouldn't trigger a switched signal (#50)
        this.router.parse('/foo');
        this.router.parse('/dolor');

        this.router.parse('/foo/bar');

        expect( count ).toBe( 4 );
        expect( vals ).toEqual( ['foo', 'dolor', 'SWITCH', 'bar'] );
        expect( req ).toEqual( '/foo/bar' );

    }

});