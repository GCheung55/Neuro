/*jshint onevar:false */

if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../../');
}

var expect = buster.expect;
var Router = Neuro.Router;
var patternLexer = Neuro.Route.PatternLexer || require('Neuro').Route.PatternLexer;
//end node


buster.testCase('Match', {

    setUp: function(){
        this.router = new Router;
    },

    tearDown: function(){
        this.router.empty();
    },


    'should match simple string': function(){
        var r1 = this.router.add({
            pattern: '/lorem-ipsum'
        }).get(0);

        expect( r1.match('/lorem-ipsum') ).toBe( true );
        expect( r1.match('/lorem-ipsum/') ).toBe( true );
        expect( r1.match('/lorem-ipsum/dolor') ).toBe( false );
    },

    'should ignore trailing slash on pattern': function(){
        var r1 = this.router.add({
            pattern: '/lorem-ipsum/'
        }).get(0);

        expect( r1.match('/lorem-ipsum') ).toBe( true );
        expect( r1.match('/lorem-ipsum/') ).toBe( true );
        expect( r1.match('/lorem-ipsum/dolor') ).toBe( false );
    },

    'should match params': function(){
        var s = this.router.add({
            pattern: '/{foo}'
        }).get(0);

        expect( s.match('/lorem-ipsum') ).toBe( true );
        expect( s.match('/lorem-ipsum/') ).toBe( true );
        expect( s.match('/lorem-ipsum/dolor') ).toBe( false );
        expect( s.match('lorem-ipsum') ).toBe( true );
        expect( s.match('/123') ).toBe( true );
        expect( s.match('/123/') ).toBe( true );
        expect( s.match('123') ).toBe( true );
        expect( s.match('123/45') ).toBe( false );
    },

    'should match optional params': function(){
        var s = this.router.add({
            pattern: ':bar:'
        }).get(0);

        expect( s.match('lorem-ipsum') ).toBe( true );
        expect( s.match('') ).toBe( true );
        expect( s.match('lorem-ipsum/dolor') ).toBe( false );
        expect( s.match('/lorem-ipsum/') ).toBe( true );
    },

    'should match normal params and optional params': function(){
        var s = this.router.add({
            pattern: '/{foo}/:bar:'
        }).get(0);

        expect( s.match('/lorem-ipsum') ).toBe( true );
        expect( s.match('/lorem-ipsum/') ).toBe( true );
        expect( s.match('/lorem-ipsum/dolor') ).toBe( true );
        expect( s.match('123/45') ).toBe( true );
    },

    'should work even with optional params on the middle of pattern': function(){
        var a = this.router.add({
            pattern: '/{foo}/:bar:/{ipsum}'
        }).get(0); //bad use!
        expect( a.match('/123/45/asd') ).toBe( true );
        expect( a.match('/123/asd') ).toBe( true );

        var b = this.router.add({
            pattern: '/{foo}:bar:{ipsum}'
        }).get(0); //bad use!
        expect( b.match('/123/45/asd') ).toBe( true );
        expect( b.match('/123/45') ).toBe( true );

        var c = this.router.add({
            pattern: '/{foo}:bar:/ipsum'
        }).get(0);
        expect( c.match('/123/45/ipsum') ).toBe( true );
        expect( c.match('/123/ipsum') ).toBe( true );

        var d = this.router.add({
            pattern: '/{foo}:bar:ipsum'
        }).get(0); //weird use!
        expect( d.match('/123/ipsum') ).toBe( true );
        expect( d.match('/123/45/ipsum') ).toBe( true );
    },

    'should support multiple consecutive optional params': function(){
        var s = this.router.add({
            pattern: '/123/:bar:/:ipsum:'
        }).get(0);

        expect( s.match('/123') ).toBe( true );
        expect( s.match('/123/') ).toBe( true );
        expect( s.match('/123/asd') ).toBe( true );
        expect( s.match('/123/asd/45') ).toBe( true );
        expect( s.match('/123/asd/45/') ).toBe( true );
        expect( s.match('/123/asd/45/qwe') ).toBe( false );
    },

    'rest params': {
        'should support rest params': function () {
            var s = this.router.add({
                pattern: '/123/{bar}/:ipsum*:'
            }).get(0);

            expect( s.match('/123') ).toBe( false );
            expect( s.match('/123/') ).toBe( false );
            expect( s.match('/123/asd') ).toBe( true );
            expect( s.match('/123/asd/45') ).toBe( true );
            expect( s.match('/123/asd/45/') ).toBe( true );
            expect( s.match('/123/asd/45/qwe') ).toBe( true );
            expect( s.match('/456/asd/45/qwe') ).toBe( false );
        },

        'should work even in the middle of pattern': function () {
            var s = this.router.add({
                pattern: '/foo/:bar*:/edit'
            }).get(0);

            expect( s.match('/foo') ).toBe( false );
            expect( s.match('/foo/') ).toBe( false );
            expect( s.match('/foo/edit') ).toBe( true );
            expect( s.match('/foo/asd') ).toBe( false );
            expect( s.match('/foo/asd/edit') ).toBe( true );
            expect( s.match('/foo/asd/edit/') ).toBe( true );
            expect( s.match('/foo/asd/123/edit') ).toBe( true );
            expect( s.match('/foo/asd/edit/qwe') ).toBe( false );
        }
    },

    'query string': {
        'should match query string as first segment': function () {
            var r = this.router.add({
                pattern: '{?q}'
            }).get(0);

            expect( r.match('') ).toBe( false );
            expect( r.match('foo') ).toBe( false );
            expect( r.match('/foo') ).toBe( false );
            expect( r.match('foo/') ).toBe( false );
            expect( r.match('/foo/') ).toBe( false );
            expect( r.match('?foo') ).toBe( true );
            expect( r.match('?foo=bar') ).toBe( true );
            expect( r.match('?foo=bar&lorem=123') ).toBe( true );
        },

        'should match optional query string as first segment': function () {
            var r = this.router.add({
                pattern: ':?q:'
            }).get(0);

            expect( r.match('') ).toBe( true );
            expect( r.match('foo') ).toBe( false );
            expect( r.match('/foo') ).toBe( false );
            expect( r.match('foo/') ).toBe( false );
            expect( r.match('/foo/') ).toBe( false );
            expect( r.match('?foo') ).toBe( true );
            expect( r.match('?foo=bar') ).toBe( true );
            expect( r.match('?foo=bar&lorem=123') ).toBe( true );
        },

        'should match query string as 2nd segment': function () {
            var r = this.router.add({
                pattern: '{a}{?q}'
            }).get(0);

            expect( r.match('') ).toBe( false );
            expect( r.match('foo') ).toBe( false );
            expect( r.match('/foo') ).toBe( false );
            expect( r.match('foo/') ).toBe( false );
            expect( r.match('/foo/') ).toBe( false );
            expect( r.match('foo?foo') ).toBe( true );
            expect( r.match('foo?foo=bar') ).toBe( true );
            expect( r.match('foo?foo=bar&lorem=123') ).toBe( true );
        },

        'should match optional query string as 2nd segment': function () {
            var r = this.router.add({
                pattern: '{a}:?q:'
            }).get(0);

            expect( r.match('') ).toBe( false );
            expect( r.match('foo') ).toBe( true );
            expect( r.match('/foo') ).toBe( true );
            expect( r.match('foo/') ).toBe( true );
            expect( r.match('/foo/') ).toBe( true );
            expect( r.match('foo?foo') ).toBe( true );
            expect( r.match('foo?foo=bar') ).toBe( true );
            expect( r.match('foo?foo=bar&lorem=123') ).toBe( true );
        },

        'should match query string as middle segment': function () {
            //if hash is required should use the literal "#" to avoid matching
            //the last char of string as a string "foo?foo" shouldn't match
            var r = this.router.add({
                pattern: '{a}{?q}#{hash}'
            }).get(0);

            expect( r.match('') ).toBe( false );
            expect( r.match('foo') ).toBe( false );
            expect( r.match('/foo') ).toBe( false );
            expect( r.match('foo/') ).toBe( false );
            expect( r.match('/foo/') ).toBe( false );
            expect( r.match('foo?foo') ).toBe( false );
            expect( r.match('foo?foo#bar') ).toBe( true );
            expect( r.match('foo?foo=bar#bar') ).toBe( true );
            expect( r.match('foo?foo=bar&lorem=123#bar') ).toBe( true );
        },

        'should match optional query string as middle segment': function () {
            var r = this.router.add({
                pattern: '{a}:?q::hash:'
            }).get(0);

            expect( r.match('') ).toBe( false );
            expect( r.match('foo') ).toBe( true );
            expect( r.match('/foo') ).toBe( true );
            expect( r.match('foo/') ).toBe( true );
            expect( r.match('/foo/') ).toBe( true );
            expect( r.match('foo?foo') ).toBe( true );
            expect( r.match('foo?foo=bar') ).toBe( true );
            expect( r.match('foo?foo=bar#bar') ).toBe( true );
            expect( r.match('foo?foo=bar&lorem=123') ).toBe( true );
            expect( r.match('foo?foo=bar&lorem=123#bar') ).toBe( true );
        },

        'should match query string even if not using the special query syntax': function () {
            var r = this.router.add({
                pattern: '{a}?{q}#{hash}'
            }).get(0);

            expect( r.match('') ).toBe( false );
            expect( r.match('foo') ).toBe( false );
            expect( r.match('/foo') ).toBe( false );
            expect( r.match('foo/') ).toBe( false );
            expect( r.match('/foo/') ).toBe( false );
            expect( r.match('foo?foo') ).toBe( false );
            expect( r.match('foo?foo#bar') ).toBe( true );
            expect( r.match('foo?foo=bar#bar') ).toBe( true );
            expect( r.match('foo?foo=bar&lorem=123#bar') ).toBe( true );
        }
    },


    'slash between params are optional': {

        'between required params': {
            'after other param': function(){
                var a = this.router.add({
                    pattern: '{bar}{ipsum}'
                }).get(0);

                expect( a.match('123') ).toBe( false );
                expect( a.match('123/') ).toBe( false );
                expect( a.match('123/asd') ).toBe( true );
                expect( a.match('123/asd/') ).toBe( true );
                expect( a.match('123/asd/45') ).toBe( false );
                expect( a.match('123/asd/45/') ).toBe( false );
                expect( a.match('123/asd/45/qwe') ).toBe( false );
            }
        },

        'between optional params': {
            'optional after other optional param': function(){
                var a = this.router.add({
                    pattern: ':bar::ipsum:'
                }).get(0);

                expect( a.match('123') ).toBe( true );
                expect( a.match('123/') ).toBe( true );
                expect( a.match('123/asd') ).toBe( true );
                expect( a.match('123/asd/') ).toBe( true );
                expect( a.match('123/asd/45') ).toBe( false );
                expect( a.match('123/asd/45/') ).toBe( false );
                expect( a.match('123/asd/45/qwe') ).toBe( false );
            }
        },

        'mixed': {

            'between normal + optional': function(){
                var a = this.router.add({
                    pattern: '/{foo}:bar:'
                }).get(0);

                expect( a.match('/lorem-ipsum/dolor') ).toBe( true );
            },

            'between normal + optional*2': function(){
                var b = this.router.add({
                    pattern: '/{foo}:bar::ipsum:'
                }).get(0);

                expect( b.match('/123') ).toBe( true );
                expect( b.match('/123/asd') ).toBe( true );
                expect( b.match('/123/asd/') ).toBe( true );
                expect( b.match('/123/asd/qwe') ).toBe( true );
                expect( b.match('/123/asd/qwe/') ).toBe( true );
                expect( b.match('/123/asd/qwe/asd') ).toBe( false );
                expect( b.match('/123/asd/qwe/asd/') ).toBe( false );
            },

            'with slashes all': function(){
                var c = this.router.add({
                    pattern: 'bar/{foo}/:bar:/:ipsum:'
                }).get(0);

                expect( c.match('bar/123') ).toBe( true );
                expect( c.match('bar/123/') ).toBe( true );
                expect( c.match('bar/123/asd') ).toBe( true );
                expect( c.match('bar/123/asd/') ).toBe( true );
                expect( c.match('bar/123/asd/45') ).toBe( true );
                expect( c.match('bar/123/asd/45/') ).toBe( true );
                expect( c.match('bar/123/asd/45/qwe') ).toBe( false );
            },

            'required param after \\w/': function(){
                var a = this.router.add({
                    pattern: '/123/{bar}{ipsum}'
                }).get(0);

                expect( a.match('/123') ).toBe( false );
                expect( a.match('/123/') ).toBe( false );
                expect( a.match('/123/asd') ).toBe( false );
                expect( a.match('/123/asd/') ).toBe( false );
                expect( a.match('/123/asd/45') ).toBe( true );
                expect( a.match('/123/asd/45/') ).toBe( true );
                expect( a.match('/123/asd/45/qwe') ).toBe( false );
            },

            'optional params after \\w/': function(){
                var a = this.router.add({
                    pattern: '/123/:bar::ipsum:'
                }).get(0);

                expect( a.match('/123') ).toBe( true );
                expect( a.match('/123/') ).toBe( true );
                expect( a.match('/123/asd') ).toBe( true );
                expect( a.match('/123/asd/') ).toBe( true );
                expect( a.match('/123/asd/45') ).toBe( true );
                expect( a.match('/123/asd/45/') ).toBe( true );
                expect( a.match('/123/asd/45/qwe') ).toBe( false );
            }

        }

    },


    'slash is required between word and param': {

        'required param after \\w': function(){
            var a = this.router.add({
                pattern: '/123{bar}{ipsum}'
            }).get(0);

            expect( a.match('/123') ).toBe( false );
            expect( a.match('/123/') ).toBe( false );
            expect( a.match('/123/asd') ).toBe( false );
            expect( a.match('/123/asd/') ).toBe( false );
            expect( a.match('/123/asd/45') ).toBe( false );
            expect( a.match('/123/asd/45/') ).toBe( false );
            expect( a.match('/123/asd/45/qwe') ).toBe( false );

            expect( a.match('/123asd') ).toBe( false );
            expect( a.match('/123asd/') ).toBe( false );
            expect( a.match('/123asd/45') ).toBe( true );
            expect( a.match('/123asd/45/') ).toBe( true );
            expect( a.match('/123asd/45/qwe') ).toBe( false );
        },

        'optional param after \\w': function(){
            var a = this.router.add({
                pattern: '/123:bar::ipsum:'
            }).get(0);

            expect( a.match('/123') ).toBe( true );
            expect( a.match('/123/') ).toBe( true );
            expect( a.match('/123/asd') ).toBe( true );
            expect( a.match('/123/asd/') ).toBe( true );
            expect( a.match('/123/asd/45') ).toBe( false );
            expect( a.match('/123/asd/45/') ).toBe( false );
            expect( a.match('/123/asd/45/qwe') ).toBe( false );

            expect( a.match('/123asd') ).toBe( true );
            expect( a.match('/123asd/') ).toBe( true );
            expect( a.match('/123asd/45') ).toBe( true );
            expect( a.match('/123asd/45/') ).toBe( true );
            expect( a.match('/123asd/45/qwe') ).toBe( false );
        }

    },


    'strict slash rules': {

        tearDown: function(){
            patternLexer.loose();
        },

        'should only match if trailing slashes match the original pattern': function () {
            patternLexer.strict();

            var a = this.router.add({
                pattern: '{foo}'
            }).get(0);
            expect( a.match('foo') ).toBe( true );
            expect( a.match('/foo') ).toBe( false );
            expect( a.match('foo/') ).toBe( false );
            expect( a.match('/foo/') ).toBe( false );

            var b = this.router.add({
                pattern: '/{foo}'
            }).get(0);
            expect( b.match('foo') ).toBe( false );
            expect( b.match('/foo') ).toBe( true );
            expect( b.match('foo/') ).toBe( false );
            expect( b.match('/foo/') ).toBe( false );

            var c = this.router.add({
                pattern: ''
            }).get(0);
            expect( c.match() ).toBe( true );
            expect( c.match('') ).toBe( true );
            expect( c.match('/') ).toBe( false );
            expect( c.match('foo') ).toBe( false );

            var d = this.router.add({
                pattern: '/'
            }).get(0);
            expect( d.match() ).toBe( false );
            expect( d.match('') ).toBe( false );
            expect( d.match('/') ).toBe( true );
            expect( d.match('foo') ).toBe( false );
        }

    },


    'loose slash rules': {

        setUp: function(){
            patternLexer.loose();
        },

        'should treat single slash and empty string as same': function () {
            var c = this.router.add({
                pattern: ''
            }).get(0);
            expect( c.match() ).toBe( true );
            expect( c.match('') ).toBe( true );
            expect( c.match('/') ).toBe( true );
            expect( c.match('foo') ).toBe( false );

            var d = this.router.add({
                pattern: '/'
            }).get(1);
            expect( d.match() ).toBe( true );
            expect( d.match('') ).toBe( true );
            expect( d.match('/') ).toBe( true );
            expect( d.match('foo') ).toBe( false );
        }

    },

    'legacy slash rules': {

        setUp: function(){
            patternLexer.legacy();
        },

        tearDown: function(){
            patternLexer.loose();
        },

        'should treat single slash and empty string as same': function () {
            var c = this.router.add({
                pattern: ''
            }).get(0);
            expect( c.match() ).toBe( true );
            expect( c.match('') ).toBe( true );
            expect( c.match('/') ).toBe( true );
            expect( c.match('foo') ).toBe( false );

            var d = this.router.add({
                pattern: '/'
            }).get(1);
            expect( d.match() ).toBe( true );
            expect( d.match('') ).toBe( true );
            expect( d.match('/') ).toBe( true );
            expect( d.match('foo') ).toBe( false );
        },

        'slash at end of string is optional': function () {
            var a = this.router.add({
                pattern: '/foo'
            }).get(0);

            expect( a.match('/foo') ).toEqual( true );
            expect( a.match('/foo/') ).toEqual( true );
            expect( a.match('/foo/bar') ).toEqual( false );
        },

        'slash at begin of string is required': function () {
            var a = this.router.add({
                pattern: '/foo'
            }).get(0);

            expect( a.match('/foo') ).toEqual( true );
            expect( a.match('/foo/') ).toEqual( true );
            expect( a.match('foo') ).toEqual( false );
            expect( a.match('foo/') ).toEqual( false );
            expect( a.match('/foo/bar') ).toEqual( false );
        }

    },


    'rules': {

        'basic rules': {

            'should allow array options': function(){

                var s = this.router.add({
                    pattern: '/{foo}/{bar}'
                }).get(0);

                s.set('rules', {
                    foo : ['lorem-ipsum', '123'],
                    bar : ['dolor', '45']
                });

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/123') ).toBe( false );
                expect( s.match('/123/45') ).toBe( true );

            },

            'should allow RegExp options': function(){
                var s = this.router.add({
                    pattern: '/{foo}/{bar}'
                }).get(0);

                s.set('rules', {
                    foo : /(^[a-z0-9\-]+$)/,
                    bar : /(.+)/
                });

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/45') ).toBe( true );
            },

            'should allow function rule': function(){
                var s = this.router.add({
                    pattern: '/{foo}/{bar}/{ipsum}'
                }).get(0);

                s.set('rules', {
                    foo : function(val, request, params){
                        return (val === 'lorem-ipsum' || val === '123');
                    },
                    bar : function(val, request, params){
                        return (request !== '/lorem-ipsum');
                    },
                    ipsum : function(val, request, params){
                        return (params.bar === 'dolor' && params.ipsum === 'sit-amet') || (params.bar === '45' && params.ipsum === '67');
                    }
                });

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/44/55') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );
            },

            'should work with mixed rules': function(){
                var s = this.router.add({
                    pattern: '/{foo}/{bar}/{ipsum}'
                }).get(0);

                s.set('rules', {
                    foo : function(val, request, params){
                        return (val === 'lorem-ipsum' || val === '123');
                    },
                    bar : ['dolor', '45'],
                    ipsum : /(sit-amet|67)/
                });

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );
            },

            'should only check rules of optional segments if param exists': function(){

                var a = this.router.add({
                    pattern: '/123/:a:/:b:/:c:'
                }).get(0);

                a.set('rules', {
                    a : /^\w+$/,
                    b : function(val){
                        return val === 'ipsum';
                    },
                    c : ['lorem', 'bar']
                });

                expect( a.match('/123') ).toBe( true );
                expect( a.match('/123/') ).toBe( true );
                expect( a.match('/123/asd') ).toBe( true );
                expect( a.match('/123/asd/') ).toBe( true );
                expect( a.match('/123/asd/ipsum/') ).toBe( true );
                expect( a.match('/123/asd/ipsum/bar') ).toBe( true );

                expect( a.match('/123/asd/45') ).toBe( false );
                expect( a.match('/123/asd/45/qwe') ).toBe( false );
                expect( a.match('/123/as#%d&/ipsum') ).toBe( false );
                expect( a.match('/123/asd/ipsum/nope') ).toBe( false );

            },


            'should work with shouldTypecast=false': function(){
                // var prevTypecast = this.router.options.shouldTypecast;
                var s = this.router.add({
                    pattern: '/{foo}/{bar}/{ipsum}',
                    typecast: false
                }).get(0);

                // this.router.options.shouldTypecast = false;

                s.set('rules', {
                    foo : function(val, request, params){
                        return (val === 'lorem-ipsum' || val === '123');  //only string validates
                    },
                    bar : ['dolor', '45'], //only string validates
                    ipsum : /(sit-amet|67)/
                });

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );

                // this.router.shouldTypecast = prevTypecast; //restore
            },

            'should work with shouldTypecast=true': function(){
                // var prevTypecast = this.router.options.shouldTypecast;
                var s = this.router.add({
                    pattern: '/{foo}/{bar}/{ipsum}',
                    typecast: true
                }).get(0);

                // this.router.options.shouldTypecast = false;

                s.set('rules', {
                    foo : function(val, request, params){
                        return (val === 'lorem-ipsum' || val === 123);  //only string validates
                    },
                    bar : ['dolor', 45], //only string validates
                    ipsum : /(sit-amet|67)/
                });

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );

                // this.router.shouldTypecast = prevTypecast; //restore
            }

        },


        'query string': {

            'should validate with array': function () {
                var r = this.router.add({
                    pattern: '/foo.php{?query}',
                    rules: {
                        '?query' : ['lorem=ipsum&dolor=456', 'amet=789']
                    }
                }).get(0);
                
                expect( r.match('foo.php?bar=123&ipsum=dolor') ).toBe( false );
                expect( r.match('foo.php?lorem=ipsum&dolor=456') ).toBe( true );
                expect( r.match('foo.php?amet=789') ).toBe( true );
            },

            'should validate with RegExp': function () {
                var r = this.router.add({
                    pattern: '/foo.php{?query}',
                    rules: {
                        '?query' : /^lorem=\w+&dolor=\d+$/
                    }
                }).get(0);
                
                expect( r.match('foo.php?bar=123&ipsum=dolor') ).toBe( false );
                expect( r.match('foo.php?lorem=ipsum&dolor=12345') ).toBe( true );
                expect( r.match('foo.php?lorem=ipsum&dolor=amet') ).toBe( false );
            },

            'should validate with Function': function () {
                var r = this.router.add({
                    pattern: '/foo.php{?query}',
                    rules: {
                        '?query' : function(val, req, vals){
                            return (val.lorem === 'ipsum' && typeof val.dolor === 'number');
                        }
                    }
                }).get(0);
                
                expect( r.match('foo.php?bar=123&ipsum=dolor') ).toBe( false );
                expect( r.match('foo.php?lorem=ipsum&dolor=12345') ).toBe( true );
                expect( r.match('foo.php?lorem=ipsum&dolor=amet') ).toBe( false );
            }

        },


        'path alias': {

            'should work with string pattern': function(){

                var s = this.router.add({
                    pattern: '/{foo}/{bar}/{ipsum}',
                    rules: {
                        0 : ['lorem-ipsum', '123'],
                        1 : function(val, request, params){
                            return (request !== '/lorem-ipsum');
                        },
                        2 : /^(sit-amet|67)$/
                    }
                }).get(0);

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                // expect( s.match('lorem-ipsum') ).toBe( false );
                // expect( s.match('/123') ).toBe( false );
                // expect( s.match('123') ).toBe( false );
                // expect( s.match('/123/44/55') ).toBe( false );
                // expect( s.match('/123/45/67') ).toBe( true );

            },

            'should work with RegExp pattern': function(){

                var s = this.router.add({
                    pattern: /([\-\w]+)\/([\-\w]+)\/([\-\w]+)/,
                    rules: {
                        0 : ['lorem-ipsum', '123'],
                        1 : function(val, request, params){
                            return (request !== '/lorem-ipsum');
                        },
                        2 : /^(sit-amet|67)$/
                    }
                }).get(0);

                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/44/55') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );

            }

        },


        'request_': {

            'should validate whole request': function(){
                var s = this.router.add({
                    pattern: /^([a-z0-9]+)$/,
                    rules: {
                        request_ : function(request){ //this gets executed after all other validations
                            return request !== '555';
                        }
                    }
                }).get(0);

                expect( s.match('lorem') ).toBe( true );
                expect( s.match('lorem/dolor/sit-amet') ).toBe( false );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('123') ).toBe( true );
                expect( s.match('555') ).toBe( false );
            },

            'should execute after other rules': function(){
                var s = this.router.add({
                    pattern: '/{foo}/{bar}/{ipsum}',
                    rules: {
                        foo : function(val, request, params){
                            return (val === 'lorem-ipsum' || val === '123');
                        },
                        bar : ['dolor', '45'],
                        ipsum : /(sit-amet|67|555)/,
                        request_ : function(request){ //this gets executed after all other validations
                            return request !== '/123/45/555';
                        }
                    }
                }).get(0);
                
                expect( s.match('/lorem-ipsum') ).toBe( false );
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('/123') ).toBe( false );
                expect( s.match('123') ).toBe( false );
                expect( s.match('/123/45/67') ).toBe( true );
                expect( s.match('/123/45/555') ).toBe( false );
            },

            'can be an array': function(){
                var s = this.router.add({
                    pattern: /^([a-z0-9]+)$/,
                    rules: {
                        request_ : ['lorem', '123']
                    }
                }).get(0);

                expect( s.match('lorem') ).toBe( true );
                expect( s.match('lorem/dolor/sit-amet') ).toBe( false );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('123') ).toBe( true );
                expect( s.match('555') ).toBe( false );
            },

            'can be a RegExp': function(){
                var s = this.router.add({
                    pattern: /^([a-z0-9]+)$/,
                    rules: {
                        request_ : /^(lorem|123)$/
                    }
                }).get(0);

                expect( s.match('lorem') ).toBe( true );
                expect( s.match('lorem/dolor/sit-amet') ).toBe( false );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('123') ).toBe( true );
                expect( s.match('555') ).toBe( false );
            },

            'should work with optional params': function(){
                var s = this.router.add({
                    pattern: ':foo:',
                    rules: {
                        request_ : /^(lorem|123|)$/ //empty also matches!
                    }
                }).get(0);

                expect( s.match('lorem') ).toBe( true );
                expect( s.match('lorem/dolor/sit-amet') ).toBe( false );
                expect( s.match('lorem-ipsum') ).toBe( false );
                expect( s.match('123') ).toBe( true );
                expect( s.match('555') ).toBe( false );
                expect( s.match('') ).toBe( true );
            }

        },



        'normalize_': {

            'should ignore normalize_ since it isn\'t a validation rule': function () {

                var calledNormalize = false;
                var s = this.router.add({
                    pattern: '/{foo}/{bar}/{ipsum}',
                    rules: {
                         foo : function(val, request, params){
                             return (val === 'lorem-ipsum' || val === '123');
                         },
                         bar : ['dolor', '45'],
                         ipsum : /(sit-amet|67)/,
                         normalize_ : function(){
                             calledNormalize = true;
                             return [true];
                         }
                     }
                }).get(0);

                 expect( calledNormalize ).toBe( false );
                 expect( s.match('/lorem-ipsum') ).toBe( false );
                 expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe( true );
                 expect( s.match('lorem-ipsum') ).toBe( false );
                 expect( s.match('/123') ).toBe( false );
                 expect( s.match('123') ).toBe( false );
                 expect( s.match('/123/45/67') ).toBe( true );
            }

        }

    }
});