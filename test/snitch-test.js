buster.testCase('Neuro Mixin: Snitch', {
    'setUp': function(){
        this.snitch = Neuro.Mixins.Snitch;

        this.mockSnitch = new Class({
            Extends: this.snitch,
            _validators: {
                a: Type.isString,
                b: Type.isNumber,
                c: Type.isArray
            }
        });
    },

    'setupSnitch should merge options.validators with _validators': function(){
        var snitch = new this.mockSnitch();
        
        snitch.setupSnitch();

        assert.equals(Object.getLength(snitch._validators), 3);

        snitch.options.validators.d = Type.isFunction;

        snitch.setupSnitch();

        assert.equals(Object.getLength(snitch._validators), 4);
    },

    'setValidator should set the function bound to "this" in _validators': {
        'when passed an object': function(){
            var _this,
                snitch = new this.mockSnitch().setupSnitch();

            snitch.setValidator({
                d: function(){_this = this;}
            });

            snitch._validators.d();

            assert.equals(snitch, _this);
        },

        'when passed a property and function': function(){
            var _this,
                snitch = new this.mockSnitch().setupSnitch();

            snitch.setValidator('d', function(){_this = this;});

            snitch._validators.d();

            assert.equals(snitch, _this);
        }
    },

    'getValidator should': {
        'return a function corresponding to a key in _validators': function(){
            var snitch = new this.mockSnitch().setupSnitch(),
                result;

            result = snitch.getValidator('a');

            assert.equals(result, snitch._validators.a);
        },

        'return undefined if a corresponding key is not found in _valiators': function(){
            var snitch = new this.mockSnitch().setupSnitch(),
                result;

            result = snitch.getValidator('d');

            assert.equals(result, undefined);
        },

        'return an object': {
            'containing key/value pairs where keys correspond to each key passed and value is a function (if found) or undefined (if not found)': function(){
                var snitch = new this.mockSnitch().setupSnitch(),
                    result;

                result = snitch.getValidator('a', 'd');

                assert.equals(result, {a: snitch._validators.a, d: undefined});
            },
        }
    },

    'validate': {
        'should return a boolean result when value is tested against a validator': function(){
            var snitch = new this.mockSnitch().setupSnitch();

            assert.equals(snitch.validate('a', 'str'), true);

            assert.equals(snitch.validate('b', '1'), false);
        },

        'should return a boolean true result when a validator does not exist': function(){
            var snitch = new this.mockSnitch().setupSnitch();

            assert.equals(snitch.validate('d', {}), true);
        }
    },

    'proof': {
        'function should test an object param against a validator param': function(){
            var snitch = new this.mockSnitch().setupSnitch(),
                obj = {a: 'str', b: 1};

            // False because the object doesn't pass the validators.
            // obj is missing a property
            assert.equals(this.snitch.proof(obj, snitch._validators), false);

            // Add missing property
            obj.c = [];

            // Passes because the obj has the missing property
            assert.equals(this.snitch.proof(obj, snitch._validators), true);
        },

        'method should test an object param against the internal _validators': function(){
            var snitch = new this.mockSnitch().setupSnitch(),
                obj = {a: 'str', b: 1};

            // False because the object doesn't pass the validators.
            // obj is missing a property
            assert.equals(snitch.proof(obj), false);

            // Add missing property
            obj.c = [];

            // Passes because the obj has the missing property
            assert.equals(snitch.proof(obj), true);
        }
    }
});