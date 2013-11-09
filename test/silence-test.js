if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
    var Neuro = require('../');
}

var testCase = buster.testCase;
var assert = buster.assert;
var refute = buster.refute;

var Silence = Neuro.Mixins.Silence

testCase('Neuro Mixin: Silence', {
	setUp: function(){
		this.silence = new Silence;
	},

	'method isSilent returns a boolean based on _silent property': function(){
		var _silent = this.silence._silent;
		var test = this.silence.isSilent();

		assert.equals(_silent, 0);
		assert.equals(test, false);
	},

	'method silence': {
		'invoke fnc with silence instance as scope': function(){
			var spy = this.spy();
			var silence = this.silence;

			silence.silence(spy);

			assert.calledOnce(spy);
			assert.equals(spy.thisValues[0], silence);
		},

		'will have isSilent return true/false before/after fnc': function(){
			var silence = this.silence;
			var result1 = silence.isSilent();
			var result2, result3;

			var fnc = function(){
				result2 = this.isSilent();
			};

			silence.silence(fnc);
			result3 = silence.isSilent();

			assert.equals(result1, false);
			assert.equals(result2, true);
			assert.equals(result3, false);

		},

		'with nested silence calls will have isSilent return true to signify continued silence, until all nested fnc are completed': function(){
			var silence = this.silence;
			var result1 = silence.isSilent();
			var result2, result3, result4, result5;

			var fnc1 = function(){
				result2 = this.isSilent();
				this.silence(fnc2);
				result3 = this.isSilent();
			};

			var fnc2 = function(){
				result4 = this.isSilent();
			};

			silence.silence(fnc1);
			result5 = silence.isSilent();

			assert.equals(result1, false);
			assert.equals(result2, true);
			assert.equals(result3, true);
			assert.equals(result4, true);
			assert.equals(result5, false);
		}
	}
});