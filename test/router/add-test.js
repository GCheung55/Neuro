/*jshint onevar:false */

//for node
var Router = Neuro.Router || require('Neuro').Router;
//end node


buster.testCase('Router.add()', {

    setUp: function(){
        this.router = new Router;
    },

    tearDown: function(){
        this.router.empty();
    },


    'should return a route and attach it to crossroads': function(){

        var s = this.router.add({
            pattern: '/{foo}'
        }).get(0);

        expect( s ).toBeDefined();
        expect( s.get('rules').getLength() ).toBe( 0 );
        expect( this.router.length ).toBe( 1 );
        expect( s.$events.match ).not.toBeDefined();

    },

    'should add listener to matched if provided': function(){

        var s = this.router.add({
            pattern: '/{foo}',
            callback: function(){
                expect().toBe('shouldnt be called');
            }
        }).get(0);

        expect( s ).toBeDefined();
        expect( s.get('rules').getLength() ).toBe( 0 );
        expect( this.router.length ).toBe( 1 );
        expect( s.$events.match.length ).toBe( 1 );

    },

    'should accept RegExp': function(){

        var s = this.router.add({
            pattern: /^foo\/([a-z]+)$/,
            callback: function(){
                expect().toBe('shouldnt be called');
            }
        }).get(0);

        expect( s ).toBeDefined();
        expect( s.get('rules').getLength() ).toBe( 0 );
        expect( this.router.length ).toBe( 1 );
        expect( s.$events.match.length ).toBe( 1 );

    },

    'should increment num routes': function(){

        var s1, s2;

        this.router.add([
            {
                pattern: /^foo\/([a-z]+)$/,
                callback: function(){
                    expect().toBe('shouldnt be called');
                }
            },

            {
                pattern: '/{foo}',
                callback: function(){
                    expect().toBe('shouldnt be called');
                }
            }
        ]);

        s1 = this.router.get(0);
        s2 = this.router.get(1);

        expect( s1 ).toBeDefined();
        expect( s2 ).toBeDefined();
        expect( s1.get('rules').getLength() ).toBe( 0 );
        expect( s2.get('rules').getLength() ).toBe( 0 );
        expect( this.router.length ).toBe( 2 );
        expect( s1.$events.match.length ).toBe( 1 );
        expect( s2.$events.match.length ).toBe( 1 );

    },

    'should work on multiple instances': function(){
        var cr = new Router;

        var s1 = this.router.add({
            pattern: '/bar'
        }).get(0);

        var s2 = cr.add({
            pattern: '/ipsum'
        }).get(0)

        expect( s1 ).toBeDefined();
        expect( s2 ).toBeDefined();
        expect( s1.get('rules').getLength() ).toBe( 0 );
        expect( s2.get('rules').getLength() ).toBe( 0 );
        expect( this.router.length ).toBe( 1 );
        expect( cr.length ).toBe( 1 );
        expect( s1.$events.match ).not.toBeDefined();
        expect( s2.$events.match ).not.toBeDefined();

    }

});