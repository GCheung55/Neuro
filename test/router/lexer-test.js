if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../../');
}

var expect = buster.expect;
var Router = Neuro.Router;
var patternLexer = Neuro.Route.PatternLexer;

buster.testCase('patternLexer', {
    'getParamIds()': {
        'should return an Array with the ids': function(){
            var ids = patternLexer.getParamIds('/lorem/{ipsum}/{dolor}');
            expect( ids[0] ).toEqual( 'ipsum' );
            expect( ids[1] ).toEqual( 'dolor' );
        }
    },

    'compilePattern()': {
        'should create RegExp from string which should match pattern': function(){
            var pattern = '/lorem/{ipsum}/{dolor}',
                regex = patternLexer.compilePattern(pattern);
            expect( regex.test(pattern) ).toEqual( true );
        },

        'should work with special chars': function(){
            var pattern = '/lo[rem](ipsum)/{ipsum}/{dolor}',
                regex = patternLexer.compilePattern(pattern); 
            expect( regex.test(pattern) ).toEqual( true );
        },

        'should work with optional params': function(){
            var pattern = '/lo[rem](ipsum)/{ipsum}/{dolor}:foo::bar:/:blah:/maecennas',
                regex = patternLexer.compilePattern(pattern); 
            expect( regex.test(pattern) ).toEqual( true );
        },

        'should support rest params': function(){
            var pattern = '/lo[rem](ipsum)/{ipsum*}/{dolor}:foo::bar*:/:blah:/maecennas',
                regex = patternLexer.compilePattern(pattern); 
            expect( regex.test(pattern) ).toEqual( true );
        }
    },

    'getParamValues()': {
        'should return pattern params': function(){
            var pattern = '/lorem/{ipsum}/{dolor}',
                regex = patternLexer.compilePattern(pattern),
                params = patternLexer.getParamValues('/lorem/foo/bar', regex);

            expect( params[0] ).toEqual( 'foo' );
            expect( params[1] ).toEqual( 'bar' );
        }
    }
});