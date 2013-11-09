if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../');
}

var expect = buster.expect;

buster.spec.expose();

describe('Neuro object', function(){
    it('exists', function(){
        expect(Neuro).toBeDefined();
    });
});