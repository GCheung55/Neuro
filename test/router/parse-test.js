/*jshint onevar:false */

if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../../');
}

var assert = buster.assert;
var refute = buster.refute;
var expect = buster.expect;

//for node
var Router = Neuro.Router;
//end node


buster.testCase('this.router.parse()', {

    setUp: function(){
        this.router = new Router;
    },

    tearDown: function(){
        this.router.empty();
    },



    'simple string route': {

        'shold route basic strings': function(){
            var t1 = 0;

            this.router.add({
                pattern: '/foo',
                callback: function(route, a){
                    t1++;
                }
            });

            this.router.parse('/bar');
            this.router.parse('/foo');
            this.router.parse('foo');

            expect( t1 ).toBe( 2 );
        },

        'should pass params and allow multiple routes': function(){
            var t1, t2, t3;

            this.router.add({
                pattern: '/{foo}', 
                callback: function(route, foo){
                    t1 = foo;
                }
            });

            this.router.add({
                pattern: '/{foo}/{bar}', 
                callback: function(route, foo, bar){
                    t2 = foo;
                    t3 = bar;
                }
            });

            this.router.parse('/lorem_ipsum');
            this.router.parse('/maecennas/ullamcor');

            expect( t1 ).toBe( 'lorem_ipsum' );
            expect( t2 ).toBe( 'maecennas' );
            expect( t3 ).toBe( 'ullamcor' );
        },

        'should dispatch matched signal': function(){
            var t1, t2, t3;

            var a = this.router.add({
                pattern: '/{foo}'
            }).get(0);
            a.addEvent('match', function(route, foo){
                t1 = foo;
            });

            var b = this.router.add({
                pattern: '/{foo}/{bar}'
            }).get(0);
            b.addEvent('match', function(route, foo, bar){
                t2 = foo;
                t3 = bar;
            });

            this.router.parse('/lorem_ipsum');
            this.router.parse('/maecennas/ullamcor');

            expect( t1 ).toBe( 'lorem_ipsum' );
            expect( t2 ).toBe( 'maecennas' );
            expect( t3 ).toBe( 'ullamcor' );
        },

        'should handle a word separator that isn\'t necessarily /': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: '/{foo}_{bar}'
            }).get(0);
            a.addEvent('match', function(route, foo, bar){
                t1 = foo;
                t2 = bar;
            });

            var b = this.router.add({
                pattern: '/{foo}-{bar}'
            }).get(0);
            b.addEvent('match', function(route, foo, bar){
                t3 = foo;
                t4 = bar;
            });

            this.router.parse('/lorem_ipsum');
            this.router.parse('/maecennas-ullamcor');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 'ipsum' );
            expect( t3 ).toBe( 'maecennas' );
            expect( t4 ).toBe( 'ullamcor' );
        },

        'should handle empty routes': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({}).get(0);
            a.addEvent('match', function(route, foo, bar){
                t1 = 'lorem';
                t2 = 'ipsum';
            });

            this.router.parse('/123/456');
            this.router.parse('/maecennas/ullamcor');
            this.router.parse('');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 'ipsum' );
        },

        'should handle empty strings': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: ''
            }).get(0);
            a.addEvent('match', function(route, foo, bar){
                t1 = 'lorem';
                t2 = 'ipsum';
            });

            this.router.parse('/123/456');
            this.router.parse('/maecennas/ullamcor');
            this.router.parse('');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 'ipsum' );
        },

        'should route `null` as empty string': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: ''
            }).get(0);
            a.addEvent('match', function(route, foo, bar){
                t1 = 'lorem';
                t2 = 'ipsum';
            });

            this.router.parse('/123/456');
            this.router.parse('/maecennas/ullamcor');
            this.router.parse();

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 'ipsum' );
        }
    },



    'optional params': {

        'should capture optional params': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: 'foo/:lorem:/:ipsum:/:dolor:/:sit:'
            }).get(0);
            a.addEvent('match', function(route, a, b, c, d){
                t1 = a;
                t2 = b;
                t3 = c;
                t4 = d;
            });

            this.router.parse('foo/lorem/123/true/false');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( '123' );
            expect( t3 ).toBe( 'true' );
            expect( t4 ).toBe( 'false' );
        },

        'should only pass matched params': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: 'foo/:lorem:/:ipsum:/:dolor:/:sit:'
            }).get(0);
            a.addEvent('match', function(route, a, b, c, d){
                t1 = a;
                t2 = b;
                t3 = c;
                t4 = d;
            });

            this.router.parse('foo/lorem/123');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( '123' );
            expect( t3 ).not.toBeDefined();
            expect( t4 ).not.toBeDefined();
        }

    },



    'regex route': {

        'should capture groups': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: /^\/[0-9]+\/([0-9]+)$/
            }).get(0); //capturing groups becomes params
            a.addEvent('match', function(route, foo, bar){
                t1 = foo;
                t2 = bar;
            });

            this.router.parse('/123/456');
            this.router.parse('/maecennas/ullamcor');

            expect( t1 ).toBe( '456' );
            expect( t2 ).not.toBeDefined();
        },

        'should capture even empty groups': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: /^\/()\/([0-9]+)$/
            }).get(0); //capturing groups becomes params
            a.addEvent('match', function(route, foo, bar){
                t1 = foo;
                t2 = bar;
            });

            this.router.parse('//456');

            expect( t1 ).toBe( '' );
            expect( t2 ).toBe( '456' );
        }
    },



    'typecast values': {

        'should typecast values if shouldTypecast is set to true': function(){
            // var prevTypecast = this.router.shouldTypecast;
            // this.router.shouldTypecast = true;
            var prevTypecast = this.router.options.Model.options.defaults.typecast;
            this.router.options.Model.options.defaults.typecast = true;

            var t1, t2, t3, t4, t5, t6;

            var a = this.router.add({
                pattern: '{a}/{b}/{c}/{d}/{e}/{f}'
            }).get(0);
            a.addEvent('match',function(route, a, b, c, d, e, f){
                t1 = a;
                t2 = b;
                t3 = c;
                t4 = d;
                t5 = e;
                t6 = f;
            });

            this.router.parse('lorem/123/true/false/null/undefined');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( 123 );
            expect( t3 ).toBe( true );
            expect( t4 ).toBe( false );
            expect( t5 ).toBe( null );
            expect( t6 ).toBe( undefined );

            this.router.options.Model.options.defaults.typecast = prevTypecast; //restore
        },

        'should not typecast if shouldTypecast is set to false': function(){
            // var prevTypecast = this.router.shouldTypecast;
            // this.router.shouldTypecast = false;
            var prevTypecast = this.router.options.Model.options.defaults.typecast;
            this.router.options.Model.options.defaults.typecast = false;

            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: '{lorem}/{ipsum}/{dolor}/{sit}'
            }).get(0);
            a.addEvent('match', function(route, a, b, c, d){
                t1 = a;
                t2 = b;
                t3 = c;
                t4 = d;
            });

            this.router.parse('lorem/123/true/false');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( '123' );
            expect( t3 ).toBe( 'true' );
            expect( t4 ).toBe( 'false' );

            this.router.options.Model.options.defaults.typecast = prevTypecast; //restore
        }

    },


    'rules.normalize_': {

        'should normalize params before dispatching signal': function(){

            var t1, t2, t3, t4, t5, t6, t7, t8,
                f1, f2, f3, f3;

            //based on: https://github.com/millermedeiros/this.router.js/issues/21

            var myRoute = this.router.add({
                pattern: '{a}/{b}/:c:/:d:'
            }).get(0);
            myRoute.set('rules', {
                a : ['news', 'article'],
                b : /[\-0-9a-zA-Z]+/,
                request_ : /\/[0-9]+\/|$/,
                normalize_ : function(request, vals){
                    var id;
                    var idRegex = /^[0-9]+$/;
                    if(vals.a === 'article'){
                        id = vals.c;
                    } else {
                        if( idRegex.test(vals.b) ){
                            id = vals.b;
                        } else if ( idRegex.test(vals.c) ) {
                            id = vals.c;
                        }
                    }
                    return ['news', id]; //return params
                }
            });

            // Event Psuedo's from MooTools-More can add :once psuedo
            f1 = function(route, a, b){
                t1 = a;
                t2 = b;
                this.removeEvent('match', f1);
            };
            myRoute.addEvent('match', f1);
            this.router.parse('news/111/lorem-ipsum');

            f2 = function(route, a, b){
                t3 = a;
                t4 = b;
                this.removeEvent('match', f2);
            };
            myRoute.addEvent('match', f2);
            this.router.parse('news/foo/222/lorem-ipsum');

            f3 = function(route, a, b){
                t5 = a;
                t6 = b;
                this.removeEvent('match', f3);
            };
            myRoute.addEvent('match', f3);
            this.router.parse('news/333');

            f4 = function(route, a, b){
                t7 = a;
                t8 = b;
                this.removeEvent('match', f4);
            };
            myRoute.addEvent('match', f4);
            this.router.parse('article/news/444');

            // myRoute.matched.addOnce(function(a, b){
            //     t1 = a;
            //     t2 = b;
            // });
            // this.router.parse('news/111/lorem-ipsum');

            // myRoute.matched.addOnce(function(a, b){
            //     t3 = a;
            //     t4 = b;
            // });
            // this.router.parse('news/foo/222/lorem-ipsum');

            // myRoute.matched.addOnce(function(a, b){
            //     t5 = a;
            //     t6 = b;
            // });
            // this.router.parse('news/333');

            // myRoute.matched.addOnce(function(a, b){
            //     t7 = a;
            //     t8 = b;
            // });
            // this.router.parse('article/news/444');

            expect( t1 ).toBe( 'news' );
            expect( t2 ).toBe( '111' );
            expect( t3 ).toBe( 'news' );
            expect( t4 ).toBe( '222' );
            expect( t5 ).toBe( 'news' );
            expect( t6 ).toBe( '333' );
            expect( t7 ).toBe( 'news' );
            expect( t8 ).toBe( '444' );

        }

    },


    'this.router.normalizeFn': {

        setUp: function(){
            this.prevNorm = this.router.options.Model.options.defaults.normalizer;
        },

        tearDown: function(){
            this.router.options.Model.options.defaults.normalizer = this.prevNorm;
        },


        'should work as a default normalize_': function(){

            var t1, t2, t3, t4, t5, t6, t7, t8,
                f1, f2;


            this.router.options.Model.options.defaults.normalizer = function(request, vals){
                var id;
                var idRegex = /^[0-9]+$/;
                if(vals.a === 'article'){
                    id = vals.c;
                } else {
                if( idRegex.test(vals.b) ){
                    id = vals.b;
                } else if ( idRegex.test(vals.c) ) {
                    id = vals.c;
                }
                }
                return ['news', id]; //return params
            };

            var route1 = this.router.add({
                pattern: 'news/{b}/:c:/:d:'
            }).get(0);

            f1 = function(route, a, b){
                t1 = a;
                t2 = b;
                this.removeEvent('match', f1);
            };
            route1.addEvent('match', f1);
            this.router.parse('news/111/lorem-ipsum');

            var route2 = this.router.add({
                pattern: '{a}/{b}/:c:/:d:'
            }).get(0);
            route2.set('rules', {
                a : ['news', 'article'],
                b : /[\-0-9a-zA-Z]+/,
                request_ : /\/[0-9]+\/|$/,
                normalize_ : function (req, vals) {
                    return ['foo', vals.b];
                }
            });
            f2 = function(route, a, b){
                t3 = a;
                t4 = b;
                this.removeEvent('match', f2);
            };
            route2.addEvent('match', f2);
            this.router.parse('article/333');

            expect( t1 ).toBe( 'news' );
            expect( t2 ).toBe( '111' );
            expect( t3 ).toBe( 'foo' );
            expect( t4 ).toBe( '333' );

        },


        'should receive all values as an array on the special property `vals_`': function(){

            var t1, t2;

            this.router.options.Model.options.defaults.normalizer = function(request, vals){
                //convert params into an array..
                return [vals.vals_];
            };

            this.router.add({
                pattern: '/{a}/{b}',
                callback: function(route, params){
                    t1 = params;
                }
            });

            this.router.add({
                pattern: '/{a}', 
                callback: function(route, params){
                    t2 = params;
                }
            });

            this.router.parse('/foo/bar');
            this.router.parse('/foo');

            expect( t1.join(';') ).toEqual( ['foo', 'bar'].join(';') );
            expect( t2.join(';') ).toEqual( ['foo'].join(';') );

        },

        'NORM_AS_ARRAY': {

            'should pass array': function(){
                var arg;

                this.router.options.Model.options.defaults.normalizer = Router.NORM_AS_ARRAY;
                this.router.add({
                    pattern: '/{a}/{b}', 
                    callback: function (route, a) {
                        arg = a;
                    }
                });
                this.router.parse('/foo/bar');

                expect( {}.toString.call(arg) ).toEqual( '[object Array]' );
                expect( arg[0] ).toEqual( 'foo' );
                expect( arg[1] ).toEqual( 'bar' );
            }

        },

        'NORM_AS_OBJECT': {

            'should pass object': function(){
                var arg;

                this.router.options.Model.options.defaults.normalizer = Router.NORM_AS_OBJECT;
                this.router.add({
                    pattern: '/{a}/{b}', 
                    callback: function (route, a) {
                        arg = a;
                    }
                });
                this.router.parse('/foo/bar');

                expect( arg.a ).toEqual( 'foo' );
                expect( arg.b ).toEqual( 'bar' );
            }

        },

        'normalizeFn = null': {

            'should pass multiple args': function (){
                var arg1, arg2;

                this.router.options.Model.options.defaults.normalizer = null;
                this.router.add({
                    pattern: '/{a}/{b}', 
                    callback: function (route, a, b) {
                        arg1 = a;
                        arg2 = b;
                    }
                });
                this.router.parse('/foo/bar');

                expect( arg1 ).toEqual( 'foo' );
                expect( arg2 ).toEqual( 'bar' );
            }

        }

    },


    'priority': {

        'should enforce match order': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: '/{foo}/{bar}'
            }).get(0);
            a.addEvent('match', function(route, foo, bar){
                expect(null).toEqual('fail: shouldn\'t match');
            });

            var b = this.router.add({
                pattern: '/{foo}/{bar}', 
                priority: 1
            }).get(1);
            b.addEvent('match', function(route, foo, bar){
                t3 = 'foo';
                t4 = 'bar';
            });

            this.router.parse('/123/456');
            this.router.parse('/maecennas/ullamcor');

            expect( t3 ).toBe( 'foo' );
            expect( t4 ).toBe( 'bar' );
        },

        'shouldnt matter if there is a gap between priorities': function(){
            var t1, t2, t3, t4;

            var a = this.router.add({
                pattern: '/{foo}/{bar}', 
                callback: function(route, foo, bar){
                    expect(null).toEqual('fail: shouldn\'t match');
                }, 
                priority: 4
            }).get(0);

            var b = this.router.add({
                pattern: '/{foo}/{bar}', 
                callback: function(route, foo, bar){
                    t3 = 'foo';
                    t4 = 'bar';
                }, 
                priority: 999
            }).get(1);

            this.router.parse('/123/456');
            this.router.parse('/maecennas/ullamcor');

            expect( t3 ).toBe( 'foo' );
            expect( t4 ).toBe( 'bar' );
        }

    },


    'validate params before dispatch': {

        'should ignore routes that don\'t validate': function(){
            var t1, t2, t3, t4;

            var pattern = '{foo}-{bar}';

            var a = this.router.add({
                pattern: pattern
            }).get(0);
            a.addEvent('match', function(route, foo, bar){
                t1 = foo;
                t2 = bar;
            });
            a.set('rules', {
                foo : /\w+/,
                bar : function(value, request, matches){
                    return request === 'lorem-123';
                }
            });

            var b = this.router.add({
                pattern: pattern
            }).get(0);
            b.addEvent('match', function(route, foo, bar){
                t3 = foo;
                t4 = bar;
            });
            b.set('rules', {
                foo : ['123', '456', '567', '2'],
                bar : /ullamcor/
            });

            this.router.parse('45-ullamcor'); //first so we make sure it bypassed route `a`
            this.router.parse('123-ullamcor');
            this.router.parse('lorem-123');
            this.router.parse('lorem-555');

            expect( t1 ).toBe( 'lorem' );
            expect( t2 ).toBe( '123' );
            expect( t3 ).toBe( '123' );
            expect( t4 ).toBe( 'ullamcor' );
        },

        'should consider invalid rules as as not matching': function(){
            var t1, t2, t3, t4;

            var pattern = '{foo}-{bar}';

            var a = this.router.add({
                pattern: pattern
            }).get(0);
            a.addEvent('match', function(route, foo, bar){
                t1 = foo;
                t2 = bar;
            });
            a.set('rules', {
                foo : 'lorem',
                bar : 123
            });

            var b = this.router.add({
                pattern: pattern
            }).get(1);
            b.addEvent('match', function(route, foo, bar){
                t3 = foo;
                t4 = bar;
            });
            b.set('rules', {
                foo : false,
                bar : void(0)
            });

            this.router.parse('45-ullamcor');
            this.router.parse('lorem-123');

            expect( t1 ).not.toBeDefined();
            expect( t2 ).not.toBeDefined();
            expect( t3 ).not.toBeDefined();
            expect( t4 ).not.toBeDefined();
        }

    },


    'greedy routes': {

        'should match multiple greedy routes': function(){

            var t1, t2, t3, t4, t5, t6, t7, t8;

            var r1 = this.router.add({
                pattern:'/{a}/{b}/', 
                callback: function(route, a,b){
                    t1 = a;
                    t2 = b;
                },
                greedy: false
            }).get(0);

            var r2 = this.router.add({
                pattern: '/bar/{b}/', 
                callback: function(route, a,b){
                    t3 = a;
                    t4 = b;
                },
                greedy: true
            }).get(0);

            var r3 = this.router.add({
                pattern: '/foo/{b}/', 
                callback: function(route, a,b){
                    t5 = a;
                    t6 = b;
                },
                greedy: true
            }).get(0);

            var r4 = this.router.add({
                pattern: '/{a}/:b:/', 
                callback: function(route, a,b){
                    t7 = a;
                    t8 = b;
                },
                greedy: true
            }).get(0);

            this.router.parse('/foo/lorem');

            expect( t1 ).toEqual( 'foo' );
            expect( t2 ).toEqual( 'lorem' );
            expect( t3 ).not.toBeDefined();
            expect( t4 ).not.toBeDefined();
            expect( t5 ).toEqual( 'lorem' );
            expect( t6 ).not.toBeDefined();
            expect( t7 ).toEqual( 'foo' );
            expect( t8 ).toEqual( 'lorem' );

        },

        'should allow global greedy setting': function(){

            var t1, t2, t3, t4, t5, t6, t7, t8;

            this.router.options.greedy = true;

            var r1 = this.router.add({
                pattern: '/{a}/{b}/', 
                callback: function(route, a,b){
                    t1 = a;
                    t2 = b;
                }
            });

            var r2 = this.router.add({
                pattern: '/bar/{b}/', 
                callback: function(route, a,b){
                    t3 = a;
                    t4 = b;
                }
            });

            var r3 = this.router.add({
                pattern: '/foo/{b}/', 
                callback: function(route, a,b){
                    t5 = a;
                    t6 = b;
                }
            });

            var r4 = this.router.add({
                pattern: '/{a}/:b:/', 
                callback: function(route, a,b){
                    t7 = a;
                    t8 = b;
                }
            });

            this.router.parse('/foo/lorem');

            expect( t1 ).toEqual( 'foo' );
            expect( t2 ).toEqual( 'lorem' );
            expect( t3 ).not.toBeDefined();
            expect( t4 ).not.toBeDefined();
            expect( t5 ).toEqual( 'lorem' );
            expect( t6 ).not.toBeDefined();
            expect( t7 ).toEqual( 'foo' );
            expect( t8 ).toEqual( 'lorem' );

            this.router.options.greedy = false;

        },

        'greedyEnabled': {

            tearDown: function(){
                this.router.options.greedyEnabled = true;
            },

            'should toggle greedy behavior': function(){
                this.router.options.greedyEnabled = false;

                var t1, t2, t3, t4, t5, t6, t7, t8;

                var r1 = this.router.add({
                    pattern: '/{a}/{b}/', 
                    callback: function(route, a,b){
                        t1 = a;
                        t2 = b;
                    },
                    greedy: false
                });

                var r2 = this.router.add({
                    pattern: '/bar/{b}/', 
                    callback: function(route, a,b){
                        t3 = a;
                        t4 = b;
                    },
                    greedy: true
                });

                var r3 = this.router.add({
                    pattern: '/foo/{b}/', 
                    callback: function(route, a,b){
                        t5 = a;
                        t6 = b;
                    },
                    greedy: true
                });

                var r4 = this.router.add({
                    pattern: '/{a}/:b:/', 
                    callback: function(route, a,b){
                        t7 = a;
                        t8 = b;
                    },
                    greedy: true
                });

                this.router.parse('/foo/lorem');

                expect( t1 ).toEqual( 'foo' );
                expect( t2 ).toEqual( 'lorem' );
                expect( t3 ).not.toBeDefined();
                expect( t4 ).not.toBeDefined();
                expect( t5 ).not.toBeDefined();
                expect( t6 ).not.toBeDefined();
                expect( t7 ).not.toBeDefined();
                expect( t8 ).not.toBeDefined();
            }

        }

    },

    'default arguments': {

        'should pass default arguments to all signals': function(){

            var t1, t2, t3, t4, t5, t6, t7, t8;

            this.router.add({
                pattern: 'foo', 
                callback: function(route, a, b){
                    t1 = a;
                    t2 = b;
                }
            });

            this.router.addEvent('default', function(router, a, b, c){
                t3 = a;
                t4 = b;
                t5 = c;
            });

            this.router.addEvent('match', function(router, a, b, c){
                t6 = a;
                t7 = b;
                t8 = c;
            });

            this.router.parse('foo', [123, 'dolor']);
            this.router.parse('bar', ['ipsum', 123]);

            expect( t1 ).toEqual( 123 );
            expect( t2 ).toEqual( 'dolor' );
            expect( t3 ).toEqual( 'ipsum' );
            expect( t4 ).toEqual( 123 );
            expect( t5 ).toEqual( 'bar' );
            expect( t6 ).toEqual( 123 );
            expect( t7 ).toEqual( 'dolor' );
            expect( t8 ).toEqual( 'foo' );

        }

    },


    'rest params': {

        'should pass rest as a single argument': function(){
            var t1, t2, t3, t4, t5, t6, t7, t8, t9,
                f1, f2, f3;

            var r = this.router.add({
                pattern: '{a}/{b}/:c*:'
            }).get(0);
            r.set('rules', {
                a : ['news', 'article'],
                b : /[\-0-9a-zA-Z]+/,
                'c*' : ['foo/bar', 'edit', '123/456/789']
            });

            f1 = function(route, a, b, c){
                t1 = a;
                t2 = b;
                t3 = c;
                this.removeEvent('match', f1);
            };
            r.addEvent('match', f1);
            this.router.parse('article/333');

            expect( t1 ).toBe( 'article' );
            expect( t2 ).toBe( '333' );
            expect( t3 ).not.toBeDefined();

            f2 = function(route, a, b, c){
                t4 = a;
                t5 = b;
                t6 = c;
                this.removeEvent('match', f2);
            };
            r.addEvent('match', f2);
            this.router.parse('news/456/foo/bar');

            expect( t4 ).toBe( 'news' );
            expect( t5 ).toBe( '456' );
            expect( t6 ).toBe( 'foo/bar' );

            f3 = function(route, a, b, c){
                t7 = a;
                t8 = b;
                t9 = c;
                this.removeEvent('match', f3);
            };
            r.addEvent('match', f3);
            this.router.parse('news/456/123/aaa/bbb');

            expect( t7 ).not.toBeDefined();
            expect( t8 ).not.toBeDefined();
            expect( t9 ).not.toBeDefined();
        },

        'should work in the middle of segment as well': function(){
            var t1, t2, t3, t4, t5, t6, t7, t8, t9,
                f1, f2, f3;

            // since rest segment is greedy the last segment can't be optional
            var r = this.router.add({
                pattern: '{a}/{b*}/{c}'
            }).get(0);
            r.set('rules', {
                a : ['news', 'article'],
                c : ['add', 'edit']
            });

            f1 = function(route, a, b, c){
                t1 = a;
                t2 = b;
                t3 = c;
                this.removeEvent('match', f1);
            };
            r.addEvent('match', f1);
            this.router.parse('article/333/add');

            expect( t1 ).toBe( 'article' );
            expect( t2 ).toBe( '333' );
            expect( t3 ).toBe( 'add' );

            f2 = function(route, a, b, c){
                t4 = a;
                t5 = b;
                t6 = c;
                this.removeEvent('match', f2);
            };
            r.addEvent('match', f2);
            this.router.parse('news/456/foo/bar/edit');

            expect( t4 ).toBe( 'news' );
            expect( t5 ).toBe( '456/foo/bar' );
            expect( t6 ).toBe( 'edit' );

            f3 = function(route, a, b, c){
                t7 = a;
                t8 = b;
                t9 = c;
                this.removeEvent('match', f3);
            };
            r.addEvent('match', f3);
            this.router.parse('news/456/123/aaa/bbb');

            expect( t7 ).not.toBeDefined();
            expect( t8 ).not.toBeDefined();
            expect( t9 ).not.toBeDefined();
        }

    },

    'query string': {

        'old syntax': {
            'should only parse query string if using special capturing group': function(){
                var r = this.router.add({
                    pattern: '{a}?{q}#{hash}'
                }).get(0);

                var t1, t2, t3, 
                    f1;

                f1 = function(route, a, b, c){
                    t1 = a;
                    t2 = b;
                    t3 = c;
                    this.removeEvent('match', f1);
                };
                r.addEvent('match', f1);
                this.router.parse('foo.php?foo=bar&lorem=123#bar');

                expect( t1 ).toEqual( 'foo.php' );
                expect( t2 ).toEqual( 'foo=bar&lorem=123' );
                expect( t3 ).toEqual( 'bar' );
            }
        },

        'required query string after required segment': {
            'should parse query string into an object and typecast vals': function(){
                var r = this.router.add({
                    pattern: '{a}{?b}'
                }).get(0);

                var t1, t2, 
                    f1;

                f1 = function(route, a, b){
                    t1 = a;
                    t2 = b;
                    this.removeEvent('match', f1);
                };
                r.addEvent('match', f1);
                this.router.parse('foo.php?lorem=ipsum&asd=123&bar=false');

                expect( t1 ).toEqual( 'foo.php' );
                expect( t2 ).toEqual( {lorem : 'ipsum', asd : 123, bar : false} );
            }
        },

        'required query string after optional segment': {
            'should parse query string into an object and typecast vals': function(){
                var r = this.router.add({
                    pattern: ':a:{?b}'
                }).get(0);

                var t1, t2,
                    f1;

                f1 = function(route, a, b){
                    t1 = a;
                    t2 = b;
                    this.removeEvent('match', f1);
                };
                r.addEvent('match', f1);
                this.router.parse('foo.php?lorem=ipsum&asd=123&bar=false');

                expect( t1 ).toEqual( 'foo.php' );
                expect( t2 ).toEqual( {lorem : 'ipsum', asd : 123, bar : false} );

                var t3, t4,
                    f2;

                f2 = function(route, a, b){
                    t3 = a;
                    t4 = b;
                    this.removeEvent('match', f2);
                };
                r.addEvent('match', f2);
                this.router.parse('?lorem=ipsum&asd=123');

                expect( t3 ).not.toBeDefined();
                expect( t4 ).toEqual( {lorem : 'ipsum', asd : 123} );
            }
        },

        'optional query string after required segment': {
            'should parse query string into an object and typecast vals': function(){
                var r = this.router.add({
                    pattern: '{a}:?b:'
                }).get(0);

                var t1, t2,
                    f1;

                f1 = function(route, a, b){
                    t1 = a;
                    t2 = b;
                    this.removeEvent('match', f1);
                };
                r.addEvent('match', f1);
                this.router.parse('foo.php?lorem=ipsum&asd=123&bar=false');

                expect( t1 ).toEqual( 'foo.php' );
                expect( t2 ).toEqual( {lorem : 'ipsum', asd : 123, bar : false} );

                var t3, t4,
                    f2;

                f2 = function(route, a, b){
                    t3 = a;
                    t4 = b;
                    this.removeEvent('match', f2);
                };
                r.addEvent('match', f2);
                this.router.parse('bar.php');

                expect( t3 ).toEqual( 'bar.php' );
                expect( t4 ).not.toBeDefined();
            }
        },

        'optional query string after optional segment': {
            'should parse query string into an object and typecast vals': function(){
                var r = this.router.add({
                    pattern: ':a::?b:'
                }).get(0);

                var t1, t2,
                    f1;

                f1 = function(route, a, b){
                    t1 = a;
                    t2 = b;
                    this.removeEvent('match', f1);
                };
                r.addEvent('match', f1);
                this.router.parse('foo.php?lorem=ipsum&asd=123&bar=false');

                expect( t1 ).toEqual( 'foo.php' );
                expect( t2 ).toEqual( {lorem : 'ipsum', asd : 123, bar : false} );

                var t3, t4,
                    f2;

                f2 = function(route, a, b){
                    t3 = a;
                    t4 = b;
                    this.removeEvent('match', f2);
                };
                r.addEvent('match', f2);
                this.router.parse('bar.php');

                expect( t3 ).toEqual( 'bar.php' );
                expect( t4 ).not.toBeDefined();
            }
        }

    }


});