Neuro
======================

A MooTools client-side MVC.

__Version: 0.2.5 (Alpha)__

[![Build Status](https://secure.travis-ci.org/GCheung55/Neuro.png)](http://travis-ci.org/GCheung55/Neuro)

__Influences:__

* [Backbone](/documentcloud/backbone)
* [Shipyard](/seanmonstar/Shipyard)

__Dependencies:__

* [MooTools-Core 1.x](/mootools/mootools-core)
* [Is.js](/gcheung55/is.js)

__Focus:__

* leverage MooTools-Core
* provide base for applications
* provide a clean/clear API

__Extensions:__

* [Neuro-Sync](http://github.com/gcheung55/neuro-sync) - Extends Neuro with a CRUD API
* [Neuro-Company](http://github.com/gcheung55/neuro-company) - Extends Neuro with an Observer API

## Installation
Neuro is written as a CommonJS module and is available as an NPM package.

### Node.js + NPM
---
Install [Node.js + NPM](http://nodejs.org/) and run the following command to install Neuro:
```javascript
$ npm install Neuro
```

Afterwards, all you need to do to use Neuro is the following line in your scripts:
```javascript
var Neuro = require('Neuro');
```

### Script Tags
---

There are pre-built scripts of Neuro at your disposal as well. All you need is the following code to load:
```html
<script type="text/javascript" src="/path/to/neuro.js"></script>
```

Choose between two files:

* neuro.js - Packaged with WrapUp which exposes the `Neuro` object in the window global object

* neuro-min.js - Same as `neuro.js` but Uglified (obfuscated and compressed).

### Build Your Own
---
Don't need everything in the Neuro object? Just want Neuro.Model? No problem! The pre-built files are created with [WrapUp](https://github.com/kamicane/wrapup). So you can easily create your own as well!

Install Wrapup.
```javascript
$ npm install -g wrapup
```

With Neuro installed (either locally or globally with the `-g` flag), create a `main.js` file. This file will be used to generate your own custom version of Neuro. We'll place it in a `js/neuro` folder. For this example, we're just going to have Neuro.Model available. Create the `main.js` file with the following:
```javascript
exports.Model = require('Neuro/src/model/main').Model;
```

Finally, we want to create the built file. Run this command while in the `js/neuro` folder:
```
wrup -r Neuro ./main.js -o ./neuro.js 
```

And voila, a custom `neuro.js` file is created with `Neuro` object containing only the `Model` class.

## Neuro Model
The __Model__ is a Object-like MooTools Class object that provides a basic API to interact with data. You can use Model by itself or extend other Class objects with it. It implements `each`, `filter`, and other convenient methods from `Object`.

#### Implements:
* [Mixin: Connector](#mixin-connector)
* [Mixin: Butler](#mixin-butler)
* [Mixin: Events](#mixin-events)
* [Mixin: Options](#mixin-options)
* [Mixin: Silence](#mixin-silence)
* [Mixin: Snitch](#mixin-snitch)

### constructor (initialize)
---

#### Syntax:
```javascript
var model = new Neuro.Model(data [, options]);
```

#### Arguments:
1. `data` - (Object) An object containing key/value pairs
2. `options` - (Object, optional) The Model options
    * primaryKey - (String) Define to uniquely identify a model in a collection
    * defaults - (Object) Contains the default key/value pair defaults for the Model.
    * connector - (Object) See [Mixin: Connector](#mixin-connector)
    * accessor - (Object) See [Mixin: Butler](#mixin-butler)
    * validators - (Object) See [Mixin: Snitch](#mixin-snitch)

#### Returns: Model instance.

#### Events:
* `change: function(model){}` - Triggered when a change to the model's data has occurred
* `change:key: function(model, key, value, oldValue){}` - Triggered when a specific model data property change has occurred. The `key` refers to the specific property. All `change:key` events will be triggered before `change` is triggered.
* `destroy: function(model){}` - Triggered when the model is destroyed.
* `reset: function(model){}` - Triggered when the model is reset to its default values.
* `error: function(model){}` - Triggered when the model data does not validate during the setting process.
* `error:key: function(model, key, value){}` - Triggered when a specific model data property does not validate during the setting process.

#### Notes:
* Method names and properties prefixed with `_` is considered private and should not be used or directly interacted with.

#### Returns: Model instance.

### set
---
The way to assign values to properties the model has. __Do not__ use direct assignment else events will not be triggered or custom setters will not be used.

#### Syntax:
```javascript
model.set(property, value);

model.set(object);
```

#### Arguments:
* Two Arguments (property, value)
    1. property - (String) A key used to define a property the model has.
    2. value - (String | Array | Number | Object | Function | Class) A value of the corresponding property.
* One Argument (object)
    1. object (Object) An object containing sets of property/value pairs

#### Returns: Model instance.

#### Triggered Events:
* `change:key`
* `change`

#### Examples:
```javascript
// set a property value
model.('hasGlasses', true);

// set the property 'name' as an object.
model.set('name', {
    first: 'Garrick',
    last: 'Cheung'
});

set an object that contains all the property value pairs
model.set({
    name: {
        first: 'Garrick',
        last: 'Cheung'
    }
});
```

### isSetting
---
Use to check if data is currently being handled by the model to assign values to properties the model has.

#### Syntax:
```javascript
model.isSetting();
```

#### Returns: Boolean (true/false).

### get
---
Retrieve a property value the model has.

#### Syntax:
```javascript
model.get(property);

model.get(property1, property2);
```

#### Arguments:
* More than One Consecutive Argument
    1. property1, property2... - (String) The properties used to retrieve corresponding values that the model has.
* One Argument
    1. property - (String) The property used to retrieve the corresponding value that the model has.

#### Returns:
* More than One Consecutive Argument
    * (Object) Key/value pairs of data that the model has. Keys correspond to the arguments.
* One Argument
    * (String) Value corresponding to the property that the model has.

#### Examples:
```javascript
model.get('name'); // returns value of 'name' property.

model.get('name', 'age'); // returns object containing name and age properties
```

### getData
---
Retrieve all properties/values the model has. The returned object is a clone (dereferenced) of the data the model has.

#### Syntax:
```javascript
model.getData();
```

#### Returns: Object containing the data the model has.

### getPrevious
---
Retrieve the previous property value he model had. Model only retains one record of previous data.

#### Syntax:
```javascript
model.getPrevious(property);

model.getPrevious(property1, property2);
```

#### Arguments:
* More than One Consecutive Argument
    1. property1, property2... - (String) The properties used to retrieve corresponding previous values that the model had.
* One Argument
    1. property - (String) The property used to retrieve the corresponding previous value that the model had.

#### Returns:
* More than One Consecutive Argument
    * (Object) Key/value pairs of previous data that the model had. Keys correspond to the arguments.
* One Argument
    * (String) Value corresponding to the previous property that the model had.

### getPreviousData
---
Retrieve all previous properties/values the model had. THe returned object is a clone (dereferenced) of the previous data the model had.

#### Syntax:
```javascript
model.getPreviousData();
```

#### Returns: Object containing the previous data the model had.

### unset
---
Unset data properties the model has. Data properties can not be erased so they will be set to `undefined`.

#### Syntax:
```javascript
model.unset(property);

model.unset([property1, property2]);
```

#### Arguments:
1. property - (String | Array) The property to be unset that the model has. Multiple properties can be unset if they are encapsulated in an Array.

#### Returns: Model instance.

#### Triggered Events:
* `change:key`
* `change`

### reset
---
Reset data properties to their default values the model had.

#### Syntax:
```javascript
model.reset();

model.reset(property);

model.reset([property1, property2]);
```
#### Arguments:
* Zero Arguments
    * all data properties in the model is reset to the defined options.defaults
* One Argument
    * property - (String | Array, optional) The property to be reset that the model has. Multiple properties can be reset if they are encapsulated in an Array.

#### Returns: Model instance.

#### Triggered Events:
* `change:key`
* `change`
* `reset`

### destroy
---
Triggers the `destroy` event. This should be overriden in a Class that extends from Model to do additional things. If overriden, remember to call `this.parent();` to trigger the `destroy` method, or execute `signalDestroy` manually.

#### Syntax:
```javascript
model.destroy();
```

#### Returns: Model instance.

#### Triggered Events:
* `destroy`

### toJSON
---
Returns a copy of data the model has. Can be used for persistence, serialization, or augmentation before passing over to another object. `JSON.stringify` uses this to to create a JSON string, though the method itself does not return a String.

#### Syntax:
```javascript
model.toJSON();
```

#### Returns: Object containing the data the model has.

### spy
---
A convenient method to attach event listeners to `change:key`.

#### Syntax:
```javascript
model.spy(property, function);

model.spy(object);
```

#### Arguments:
* Two Arguments
    1. property - (String) Name of the property to listen to.
    2. function - (Function) Function that is to be executed when event is triggered.
* One Argument
    1. object - (Object) An object encapsulating key/value pairs of properties/functions

#### Returns: Model instance.

### unspy
---
A convenient method to remove event listeners to `change:key`. If a function is not provided, all events attached to a specific `change:key` will be removed.

#### Syntax:
```javascript
model.spy(property, function);
```

#### Arguments:
* Two Arguments
    1. property - (String) Name of the property that is being listend to.
    2. function - (Function, optional) Function that is to be removed when event is triggered.
* One Argument
    1. object - (Object) An object encapsulating key/value pairs of properties/functions

#### Returns: Model instance.

### setupValidators
---
see [Mixin: Snitch](#mixin-snitch)
### setValidator
---
see [Mixin: Snitch](#mixin-snitch)
### getValidator
---
see [Mixin: Snitch](#mixin-snitch)
### validate
---
Validate will test a property in `Model` data against the validators defined in `options.validators`. If a global validator ('*' or `options.validators` is a function) is definined, the then the property is tested against the global validator, even if other validators are defined. A global validator can access other defined validators because the validator method is bound to `this`, the `Model` instance.

#### Synatx:
```javascript
model.validate(property, value);
```

#### Arguments:
1.  property - (String)
    Name of property. Should reference an existing validator. If global validator is defined, the `property` is passed as the first argument to the global validator.
2.  value - (String | Number | Object | Boolean | Array)
    The `value` is what the validators will test against. If a global validator is defined, the `value` is passed as the second argument to the global validator.

#### Returns: Boolean

#### Example:
```javascript
// Test against a property in validators object
var model = new Neuro.Model({}, {
    validators: {
        // Test the 'name' property to make sure it is a string
        name: Type.isString
    }
});

model.validate('name', 123); // returns false

model.validate('name', 'Bruce'); // returns true

// Test against a global validator
var model2 = new Neuro.Model({}, {
    // Test property value to be a string or number
    validators: function(prop, val){
        var type = typeOf(val);
        return type == 'string' || type == 'number';
    }
});

model2.validate('name', 'Bruce'); // returns true
model2.validate('age', undefined); // returns false
model2.validate('age', 32); // returns true

// Define a global validator to test against other defined validators
var model3 = new Neuro.Model({}, {
    validators: {
        '*': function(prop, value){
            // can only be name or age, and has to pass the validator
            return ['name', 'age'].contains(prop) && this.getValidator(prop)(value);
        },
        // Test the 'name' property to make sure it is a string
        name: Type.isString,
        // Test the 'age' property to make sure it is a number
        age: Type.isNumber
    }
});

model3.validate('birthdate', 1234); // returns false
model3.validate('birthdate', '1234'); // returns false

model3.validate('name', 123); // returns false
model3.validate('name', 'Bruce'); // returns true

model3.validate('age', '32'); // returns false
model3.validate('age', 32); // returns true

```

see [Mixin: Snitch](#mixin-snitch)
### proof
---
Method that proofs the model instance.

see [Mixin: Snitch](#mixin-snitch)

#### Syntax:
```javascript
model.proof();
```

#### Returns: (Boolean) Every property in the `_validators` object must exist in the model instances `_data` object and every function in `_validators` must return `true` in order for `proof` to return `true`, otherwise `false`.

#### Note: This overrides the original `proof` method, but makes use of it to "proof" the model instance.

### connect
---
see [Mixin: Connector](#mixin-connector)
### disconnect
---
see [Mixin: Connector](#mixin-connector)
### setupAccessors
---
see [Mixin: Butler](#mixin-butler)
### isAccessing
---
see [Mixin: Butler](#mixin-butler)
### setAccessor
---
see [Mixin: Butler](#mixin-butler)
### getAccessor
---
see [Mixin: Butler](#mixin-butler)
### unsetAccessor
---
see [Mixin: Butler](#mixin-butler)
### addEvent
---
see [Mixin: Events](#mixin-events)
### addEvents
---
see [Mixin: Events](#mixin-events)
### removeEvent
---
see [Mixin: Events](#mixin-events)
### removeEvents
---
see [Mixin: Events](#mixin-events)
### fireEvent
---
see [Mixin: Events](#mixin-events)
### setOptions
---
see [Mixin: Options](#mixin-options)
### isSilent
---
see [Mixin: Silent](#mixin-silent)
### silence
---
see [Mixin: Silent](#mixin-silent)

### MooTools-Core Object Methods
---
The following methods have been implemented from MooTools-Core Object onto Neuro Model. They take the same arguments as their Object counterparts with the exception of having to pass the model as the object to be acted upon.

* `each`
* `subset`
* `map`
* `filter`
* `every`
* `some`
* `keys`
* `values`
* `getLength`
* `keyOf`
* `contains`
* `toQueryString`

```javascript
model.each(function[, bind]);
model.subset(keys);
model.map(function[, bind]);
model.filter(function[, bind]);
model.every(function[, bind]);
model.some(function[, bind]);
model.keys();
model.values();
model.getLength();
model.keyOf(property);
model.contains(value);
model.toQueryString();
```

## Neuro Collection
The __Collection__ is an Array-like MooTools Class object that provides a basic API to interact with multiple __Models__. You can use __Collection__ by itself or extend other Class objects with it. It contains a reference to a __Model__ Class to create a model instance when adding a data `Object`. The reference __Model__ Class can be optionally replaced by a different Class that extends from __Model__. It implements `each`, `filter`, and some other convenient methods from `Array`.

#### Implements:
* [Mixin: Connector](#mixin-connector)
* [Mixin: Events](#mixin-events)
* [Mixin: Options](#mixin-options)
* [Mixin: Silence](#mixin-silence)
* [Mixin: Snitch](#mixin-snitch)

### constructor (initialize)
---

#### Syntax:
```javascript
var collection = new Neuro.Collection(data [, options]);
```

#### Arguments:
1. `data` - (Mixed, optional)
    * Model - A `Model` instance
    * Object - An object of key/value pairs that will be used to create a model instance
    * Array - An array of Model instances or object key/value pairs
2. `options` - (Object, optional)
    * primaryKey - (String) Define to uniquely identify a model in a collection
    * Model - (Model, defaults to undefined) The `Model` Class used to create model instances from when an `Object` is passed to `add`.
    * modelOptions - (Object, defaults to undefined) An `Object` containing options for creating new model instances. See [Neuro Model](#neuro-model)
    * connector - (Object) See [Mixin: Connector](#mixin-connector)
    * validators - (Object) See [Mixin: Snitch](#mixin-snitch)

#### Returns: Class instance.

#### Events:
* `change: function(collection){}` - Triggered when there is a change in the collection (`add`, `remove`, `replace`).
* `change:model: function(collection, model){}` - Triggered when there is a change in a model. Does not trigger the `change` event on the collection.
* `add: function(collection, model){}` - Triggered when a model is added to the collection.
* `remove: function(collection, model){}` - Triggered when a specific model is removed from the collection.
* `empty: function(collection){}` - Triggered when the collection is emptied of all models.
* `sort: function(collection){}` - Triggered when `sort` or `reverse` occurs.
* `error: function(collection, model, at){}` - Triggered when a model is added to the collection that does not pass validation IF validators exist in the collection instance.

#### Notes:
* Method names and properties prefixed with `_` is considered private and should not be used or directly interacted with.
* A default model is defined in the `Collection` Class as the `_Model` property. It can be overriden by `options.Model` or when a Class extends from `Collection` and defines a different `_Model` property.
* Define `options.primaryKey` to better identify model instances, such as checking if the collection `hasModel`.

#### Returns: Model instance.

### hasModel
---
Checks if the collection instance contains a model by checking if the model exists in the `_models` array or using `options.primaryKey` to compare models.

#### Syntax:
```javascript
currentCollection.hasModel(model);
```

#### Arguments:
1. model - (Object | Model) An `Object` or `Model` instance that is used to compare with existing models in the collection. `options.primaryKey` will be used to compare against the models if an initial use of `Array.contains` returns `false`.

#### Returns: Boolean.

### add
---
Adding a model to the collection should always go through this method. It appends the model to the internal `_model` array and triggers the `add` event if the collection does not already contain the model. `change` event is triggered afterwards.

If `_validators` exist, then each model or object added must pass validation in order to be added to the collection instance. Otherwise a `error` event will be triggered. 

If an `Object` is passed in, the `Object` will be converted to a model instance before being appended to `_model`. Adding a model will increase the collections `length` property. 

It is possible to insert a model instance into `_model` at a specific index by passing a second argument to `add`.

A `remove` method is attached to the models `destroy` event so that the model can be properly removed if the model `destroy` event is triggered.

#### Syntax:
```javascript
currentCollection.add(models, at);
```

#### Arguments:
1. models - (Object | Model | Array)
    * Object - An `Object` with key/value pairs of data properties. It will be converted to a `Model` instance before adding to `_model`.
    * Model - A `Model` instance.
    * Array - An `Array` that contain a mix of `Object` and `Model` instances.
2. at - (Number, optional) The index to insert the model in the `_model` array. If the collection is empty, `at` is ignored and and the model is inserted as the first item in the array.

#### Returns: Class instance.

#### Triggered Events:
* `add`
* `error`
* `change`


#### Examples:
```javascript
currentCollection.add({
    id: 1, name: 'Bruce Lee'
}, 2);

currentCollection.add( new Neuro.Model({id: 1, name: 'Bruce Lee'}) );

currentCollection.add(
    [
        {id: 1, name: 'Bruce Lee'}, 
        new Neuro.Model({id: 1, name: 'Chuck Norris'})
    ]
);
```

### get
---
Get the model by index. Multiple indexes can be passed to get to retrieve multiple models.

#### Syntax:
```javascript
currentCollection.get(index);
```

#### Arguments:
1. index - (Number) The index number of the model to return.

#### Returns: A model instance corresponding to the index in `_model`. If multiple indexes are passed to `get`, an `Array` of models is returned, where each model corresponds to the index.

#### Examples:
```javascript
currentCollection.get(0); // returns the model instance that corresponds to the index argument

currentCollection.get(0, 2, 3); // returns an array of model instances where each model corresponds to each index argument
```

### remove
---
Remove a model or models from the collection. It will trigger the `remove` event for each individual model removed. `change` event is triggered afterwards.

The collection should remove the model only if it exists on the collection. Removing the model from the collection will also remove the `remove` method from the models `destroy` event.

#### Syntax:
```javascript
currentCollection.remove(model);
```

#### Arguments:
1. model - (Model | Array) A model or array of models that will be removed from `_model`.

#### Returns: Class instance.

#### Triggered Events:
* `remove`
* `change`

#### Examples:
```javascript
var model = new Neuro.Model({id: 1, name: 'Garrick'});

currentCollection.add(model);

currentCollection.remove(model);

//or

currentCollection.remove([model]); // remove an array of models.
```

### replace
---
Replace an existing model in the collection with a new one if the old model exists and the new model does not exist in the collection `_model` array. This will trigger `add` and `remove` events. `change` event is triggered afterwards.

#### Syntax:
```javascript
currentCollection.replace(oldModel, newModel);
```

#### Arguments:
1. oldModel (Model) - The model that will be replaced in the collection.
2. newModel (Object | Model) - The new model that will be replacing the old one.

#### Returns: Class instance.

#### Triggered Events:
* `add`
* `remove`
* `change`

### sort
---
Sort the collection. Works the same way [Array.sort](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort) would work. Triggers `sort` event.

#### Syntax:
```javascript
currentCollection.sort(function);
```

#### Arguments:
1. function - (Function, optional) The function acts as a comparator. Please see [Array.sort](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort) for more information.

#### Returns: Class instance.

#### Triggered Events:
* `sort`

#### Examples:
```javascript
// Sorts models ordered by id, where id is a number.
// This function sorts the order from smallest to largest number.

currentCollection.sort(function(modelA, modelB){
    return modelA.get('id') - modelB.get('id');
});
```

### reverse
---
Reverses the order of the collection. Works the same way [Array.reverse](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reverse) would work. Triggers `sort` event.

#### Syntax:
```javascript
currentCollection.reverse();
```

#### Returns: Class instance.

#### Triggered Events:
* `sort`

### empty
---
Empty the collection of all models. Triggers the `empty` event and `remove` event for each model removed.

#### Syntax:
```javascript
currentCollection.empty();
```

#### Returns: Class instance.

#### Triggered Events:
* `remove` for each model removed
* `empty`

### toJSON
---
Returns a copy of collection `_model`. Can be used for persistence, serialization, or augmentation before passing over to another object. `JSON.stringify` uses this to to create a JSON string, though the method itself does not return a String.

#### Syntax:
```javascript
currentCollection.toJSON();
```

#### Returns: Object containing the collection `_model`.

### attachModelEvents
---
Attach handlers to the model `destroy` and `change` listeners. The model `destroy` event will trigger the collection `remove` method. The model `change` event will trigger the collection `change:model` event. This is automatically used during `add` to help clean up if the model is destroyed and to notify listeners of the collection that a model changed.

#### Syntax:
```javascript
currentCollection.attachModelEvents(model);
```

#### Arguments:
* model - (Model) A model instance to attach events to.

#### Examples:
```javascript
var model = new Neuro.Model();

currentCollection.add(model); // Events attached to the model

currentCollection.length; // Return 1, meaning there is one model existing

model.destroy(); // currentCollection is notified that to remove the model since `destroy` event was triggered

currentCollection.length // Return 0, the model was removed when it was destroyed.
```

#### Returns: Class instance.

### detachModelEvents
---
Detach handlers to the model `destroy` and `change` listeners. If the model `destroy` event is triggered, the collection is notified and removes the model from the collection. The `destroy` and `change`events are removed from the model during execution of `remove` method.

#### Syntax:
```javascript
currentCollection.detachModelEvents(model);
```

#### Arguments:
* model - (Model) A model instance to attach events to.

#### Examples:
```javascript
var model = new Neuro.Model();

currentCollection.add(model); // Events attached to the model

currentCollection.length; // Return 1, meaning there is one model existing

model.destroy(); // currentCollection is notified that to remove the model since `destroy` event was triggered

currentCollection.length // Return 0, the model was removed when it was destroyed.
```

#### Returns: Class instance.

### setupValidators
---
see [Mixin: Snitch](#mixin-snitch)
### setValidator
---
see [Mixin: Snitch](#mixin-snitch)
### getValidator
---
see [Mixin: Snitch](#mixin-snitch)
### validate
---
Validate every property in a model that is passed into `validate`.

see [Mixin: Snitch](#mixin-snitch)

#### Syntax:
```javascript
collection.validate(models);
```

#### Arguments:
1. models - (Object | Model | Array) An object, a model instance, or an array mix of both to be validated.

#### Returns: (Boolean) True if all properties in the models validate, false otherwise.

### proofModel
---
Proof every property in the models that are passed into `proofModel`. Every validator property needs to exist in the model and every validator function must return `true` in order for `proofModel` to return `true`.

#### Syntax:
```javascript
collection.proofModel(models);
```

#### Arguments:
1. model - (Object | Model | Array) An object, a model instance, or an array mix of both to be proofed.

#### Returns: (Boolean) True if all properties in the models proof, false otherwise.

### proof
---
Method that proofs the models in the collection instance.

see [Mixin: Snitch](#mixin-snitch)

#### Syntax:
```javascript
collection.proof();
```

#### Returns: (Boolean)

#### Note: This overrides the original `proof` method, but makes use of it to "proof" the collections models.
### addEvent
---
see [Mixin: Events](#mixin-events)
### addEvents
---
see [Mixin: Events](#mixin-events)
### removeEvent
---
see [Mixin: Events](#mixin-events)
### removeEvents
---
see [Mixin: Events](#mixin-events)
### fireEvent
---
see [Mixin: Events](#mixin-events)
### setOptions
---
see [Mixin: Options](#mixin-options)
### connect
---
see [Mixin: Connector](#mixin-connector)
### disconnect
---
see [Mixin: Connector](#mixin-connector)
### isSilent
---
see [Mixin: Silent](#mixin-silent)
### silence
---
see [Mixin: Silent](#mixin-silent)

### MooTools-Core Array Methods
---
The following methods have been implemented from MooTools-Core Array onto Neuro Collection. They take the same arguments as their Object counterparts with the exception of having to pass the collection as the object to be acted upon.

* `forEach`
* `each`
* `invoke`
* `every`
* `filter`
* `clean`
* `indexOf`
* `map`
* `some`
* `associate`
* `link`
* `contains`
* `getLast`
* `getRandom`
* `flatten`
* `pick`

```javascript
collection.forEach(function[, bind]);
collection.each(function[, bind]);
collection.invoke(method[, arg, arg, arg ...]);
collection.every(function[, bind]);
collection.filter(function[, bind]);
collection.clean();
collection.indexOf(item[, from]);
collection.map(function[, bind]);
collection.some(function[, bind]);
collection.associate(object);
collection.link(object);
collection.contains(item[, from]);
collection.getLast();
collection.getRandom();
collection.flatten();
collection.pick();
```

## Neuro View
The __View__ is a MooTools Class object. It acts as a layer between an element and everything else. One of the usual conventions of plugins that deals with elements has to attach/detach events to/from the element. The __View__ provides a simple, yet basic, way of binding methods/functions to the element event listeners.

Another convention is that attaching event handlers to classes can be a manual process. __View__ implements the [Connector](#mixin-connector) utility class to provide a powerful and automatic way to attach events between two classes.

The `render` method is the main method that should be used to visualize the element with data. The method is basic, triggering the `render` event on the __View__ class. Other class objects should extend from the __View__ class and override the `render` method, but call `this.parent` in order to trigger the `render` event.

#### Implements:
* [Mixin: Connector](#mixin-connector)
* [Mixin: Events](#mixin-events)
* [Mixin: Options](#mixin-options)
* [Mixin: Silence](#mixin-silence)

### constructor (initialize)
---
Starts out with executing `setup` and then triggering `ready` event.

#### Syntax:
```javascript
var view = new Neuro.View(options);
```

#### Arguments:
1. `options` - (Object, optional) The View options
    * element - (String | Element, defaults to `undefined`) The root/parent element of where the rendered elements should be placed.
    * events - (Object, defaults to `undefined`) An `Object` of key/value pairs
        * `key` - (String) The element event or event-delegate type. `click` or `click:relay(selector)`
        * `value` - (String | Function | Array) The handler that is attached to the event. It can be a `String` (amethod name in the view class instance), `Function`, or an `Array` of containing a mix of `String` or `Function` items.
    * connector - (Object) See [Mixin: Connector](#mixin-connector)

#### Returns: View instance..

#### Events:
* `ready: function(view){}` - Triggered  at the end of the `setup` method.
* `render: function(view){}` - Triggered at the end of the `render` method.
* `inject: function(view){}` - Triggered at the end of the `inject` method.
* `dispose: function(view){}` - Triggered at the end of the `dispose` method.
* `destroy: function(view){}` - Triggered at the end of the `destroy` method.

#### Notes:
* Method names and properties prefixed with `_` is considered private and should not be used or directly interacted with.

### setup
---
Called during `initialize` to `setOptions`, and `setElement`.

#### Arguments:
* Same as `initialize`

#### Returns: View instance.

### toElement
---
A method to retrieve the element stored in the view instance. Any Class instance, with a `toElement` method, passed to MooTools Element `document.id` or `$` method will return the value from the classes `toElement` method. This is a hidden MooTools Core trick.

#### Syntax:
```javascript
view.toElement();

document.id(view);

$(view);
```

#### Returns: `element` property stored in view instance.

### setElement
---
Store the root element for the view instance. If an element exists, it will first execute View `destroy` method to properly detach events and remove references to it. Then it will store a reference to the element and execute View `attachEvents`.

#### Syntax:
```javascript
view.setElement(element);
```

#### Arguments:
1. element - (Element) Element to be set as root element in the view instance. `attachEvents` will refer to `options.events` for the event and method/function to attach.

#### Returns: View instance.

### attachEvents
---
Attach events to the root `element` property in the view instance. It refers to `options.events` to map element events to functions or methods in the view instance. Events can be detached using `detachEvents`. `element` or `options.events` are required to exist.

#### Syntax:
```javascript
view.attachEvents();
```

#### Returns: View instance.

### detachEvents
---
Detach events from the root `element` property in the view instance. It refers to `options.events` to map element events to functions or methods in the view instance. Events can be attached using `attachEvents`. `element` or `options.events` are required to exist.

#### Syntax:
```javascript
view.detachEvents();
```

#### Returns: View instance.

### create
---
It is a no-op method. Override `create` in your Class that extends from __View__. It could be used to create the root `element`, or other child elements that goes into the root `element.

#### Syntax:
```javascript
view.create();
```

#### Returns: View instance.

### render
---
Although `render` is considered a no-op method, it still trggers the `render` event. Override `render` in your Class that extends from __View__.  __Remember__ to call 'this.parent()' at the end of your code to execute the original `render` method that will trigger the `render` event. Pass `data` to the `render` method, such as Neuro Model or Neuro Collection.

If you are passing any Class that implements [Mixin: Connector](#mixin-connector), you should consider using the `connect` method. It will help to automatically attach events between the View instance and the other Classes, in this case it is likely to be a Neuro Model or Neuro Collection instances.

#### Syntax:
```javascript
view.render(data);
```

#### Arguments:
1. data - (Mixed) It can be anything you will use as data to render the view. This also means you can pass in multiple Neuro Model instances, multiple Neuro Collection instances, other View instances. Use your imagination.

#### Returns: View instance.

#### Triggered Events:
* `render`

### inject
---
Inject or inserts the root `element` relative to another element or View instance. `document.id` / `$` will resolve the element from the other View instance.

#### Syntax:
```javascript
view.inject(reference[, where]);
```

#### Arguments:
1. reference - (String | Element | Class) The `element` will be placed relative to the reference element. A `String` should be the id of the reference element, without the "#". A `Class` instance should have a `toElement` method in order to resolve the reference element.
2. where - (String, optional, defaults to "bottom") The place to inject/insert the `element` relative to the reference element. Can be: `top`, `bottom`, `after`, or `before`.

#### Returns: View instance.

#### Triggered Events:
* `inject`

### dispose
---
Removes the Element from the DOM but retains it in memory if the `element` exists.

#### Syntax:
```javascript
view.dispose();
```

#### Returns: View instance.

#### Triggered Events
* `dispose`

### destroy
---
Removes the Element and its children from the DOM and prepares them for garbage collection. Executes `detatchEvents` and removes reference to element in `element` property. Triggers `destroy` event.

#### Syntax:
```javascript
view.destroy();
```

#### Returns: View instance.

## Mixin: Events
---
__From MooTools Documentation:__
A Utility Class. Its methods can be implemented with `Class:implement` into any Class. `Events` in a Class that implements `Events` must be either added as an option or with `addEvent`, not directly through .`options.onEventName`.

#### Syntax:

__For new classes:__
```javascript
var MyClass = new Class({ Implements: Events });
```

__For existing classes:__
```javascript
MyClass.implement(Events);
```

#### Implementing:

* This class can be implemented into other classes to add its functionality to them.
* `Events` has been designed to work well with the `Options` class. When the option property begins with 'on' and is followed by a capital letter it will be added as an event (e.g. `onComplete` will add as `complete` event).

#### Example:
```javascript
var Widget = new Class({
    Implements: Events,
    initialize: function(element){
        // ...
    },
    complete: function(){
        this.fireEvent('complete');
    }
});

var myWidget = new Widget();
myWidget.addEvent('complete', myFunction);
```

#### Notes:
* Events starting with 'on' are still supported in all methods and are converted to their representation without 'on' (e.g. 'onComplete' becomes 'complete').

### addEvent
---
Adds an event to the Class instance's event stack.

#### Syntax:
```javascript
myClass.addEvent(type, fn[, internal]);
```

#### Arguments:
1. type     - (String) The type of event (e.g. `complete`).
2. fn       - (Function) The function to execute.
3. internal - (Boolean, optional) Sets the function property: internal to true. Internal property is used to prevent removal.

#### Returns: This Class instance.

#### Example:
```javascript
var myFx = new Fx.Tween('element', 'opacity');
myFx.addEvent('start', myStartFunction);
```

### addEvents
---
The same as `addEvent`, but accepts an object to add multiple events at once.

#### Syntax:
```javascript
myClass.addEvents(events);
```

#### Arguments:
1. events - (Object) An object with key/value representing: key the event name (e.g. `start`), and value the function that is called when the Event occurs.

#### Returns: This Class instance.

#### Example:
```javascript
var myFx = new Fx.Tween('element', 'opacity');
myFx.addEvents({
    start: myStartFunction,
    complete: function() {
        alert('Done.');
    }
});
```

### fireEvent
---
Fires all events of the specified type in the Class instance.

#### Syntax:
```javascript
myClass.fireEvent(type[, args[, delay]]);
```

#### Arguments:
1. type  - (String) The type of event (e.g. `complete`).
2. args  - (String | Array, optional) The argument(s) to pass to the function. To pass more than one argument, the arguments must be in an array.
3. delay - (Number, optional) Delay in milliseconds to wait before executing the event (defaults to 0).

#### Returns: This Class instance.

#### Example:
```javascript
var Widget = new Class({
    Implements: Events,
    initialize: function(arg1, arg2){
        //...
        this.fireEvent('initialize', [arg1, arg2], 50);
    }
});
```

### removeEvent
---
Removes an event from the stack of events of the Class instance.

#### Syntax:
```javascript
myClass.removeEvent(type, fn);
```
#### Arguments:
1. type - (String) The type of event (e.g. `complete`).
2. fn   - (Function) The function to remove.

#### Returns: This Class instance.

#### Notes:
* If the function has the property internal and is set to true, then the event will not be removed.


### removeEvents
---
Removes all events of the given type from the stack of events of a Class instance. If no type is specified, removes all events of all types.

#### Syntax:
```javascript
myClass.removeEvents([events]);
```

#### Arguments:
1. events - (optional) If not passed removes all events of all types.
    - (String) The event name (e.g. 'success'). Removes all events of that type.
    - (Object) An object of type function pairs. Like the one passed to `addEvents`.

#### Returns: This Class instance.

#### Example:
```javascript
var myFx = new Fx.Tween('myElement', 'opacity');
myFx.removeEvents('complete');
```

#### Notes:
* removeEvents will not remove internal events. See `Events:removeEvent`.

## Mixin: Options
---
__From MooTools Documentation:__
A Utility Class. Its methods can be implemented with `Class:implement` into any Class. Used to automate the setting of a Class instance's options. Will also add Class `Events` when the option property begins with 'on' and is followed by a capital letter (e.g. `onComplete` adds a `complete` event). You will need to call `this.setOptions()` for this to have an effect, however.

#### Syntax:

__For new classes:__
```javascript
var MyClass = new Class({Implements: Options});
```

__For existing classes:__
```javascript
MyClass.implement(Options);
```

### setOptions
---
Merges the default options of the Class with the options passed in. Every value passed in to this method will be deep copied. Therefore other class instances or objects that are not intended for copying must be passed to a class in other ways.

#### Syntax:
```javascript
myClass.setOptions([options]);
```

#### Arguments:
1. options - (Object, optional) The user defined options to merge with the defaults.

#### Returns: This Class instance.

#### Example:
```javascript
var Widget = new Class({
    Implements: Options,
    options: {
        color: '#fff',
        size: {
            width: 100,
            height: 100
        }
    },
    initialize: function(options){
        this.setOptions(options);
    }
});

var myWidget = new Widget({
    color: '#f00',
    size: {
        width: 200
    }
});

//myWidget.options is now: {color: #f00, size: {width: 200, height: 100}}

// Deep copy example
var mySize = {
    width: 50,
    height: 50
};

var myWidget = new Widget({
    size: mySize
});

(mySize == myWidget.options.size) // false! mySize was copied in the setOptions call.
```

#### Notes:
* Relies on the default options of a Class defined in its options property.

#### Options in combination with Events
If a Class has `Events` as well as `Options` implemented, every option beginning with 'on' and followed by a capital letter (e.g. `onComplete`) becomes a Class instance event, assuming the value of the option is a function.

#### Example:
```javascript
var Widget = new Class({
    Implements: [Options, Events],
    options: {
        color: '#fff',
        size: {
            width: 100,
            height: 100
        }
    },
    initialize: function(options){
        this.setOptions(options);
    },
    show: function(){
        // Do some cool stuff

        this.fireEvent('show');
    }

});

var myWidget = new Widget({
    color: '#f00',
    size: {
        width: 200
    },
    onShow: function(){
        alert('Lets show it!');
    }
});

myWidget.show(); // fires the event and alerts 'Lets show it!'
```

## Mixin: Connector
---
A Utility Class. It allows automatic attachment/detachment of event listeners between two classes.

### options.connector
---
A key/value object to map events to functions or method names on the target class that will be connected with. The value can also be an object that contains more key/value pairs. This allows to attach sub-events, such as `change:key`. __Note:__ An asterisk (*) as the sub-event refers to the parent event only.

__Note:__ Using a nested object in `options.connector` as the map is possible via a `name` param when using `connect` or `disconnect`. Doing so means that connecting/disconnecting the class will __ALWAYS__ have to designate the `name` param. If you don't, then issues will occur because then Connector will treat nested objects key/value pairs as sub-events.

#### Implements: [PowerTools! Class.Binds](https://github.com/cpojer/mootools-class-extras/blob/master/Source/Class.Binds.js)

#### Syntax: key/value pairs
```javascript
// Shallow object
{
    event: method
}

// Nested object
{
    name: object
}
```

#### Arguments
* Shallow object
    1. event - (String) The name of the event to be attached. It becomes the parent event if the events corresponding value is an object.
    2. method - (String, Function, Array, Object)
        * String - Refers to a method on the target class. The method will be bound to the target class and attached as the event handler.
        * Function - The function will be bound to the current class and attached as the event handler
        * Array - Can contain a mix of `String` (name of method to retrieve said method from target class) or `Function` to be attached as the event handler
        * Object - Contains key/value pairs where `key` will refer to the sub-event and value refers to `String`, `Function`, or `Array` to attach as event handlers. The sub-event will be prepended by the `event` with a `:`.
* Nested Object
    1. name - (String) Name of the object that would be used as the map during connect/disconnect
    2. object - (Object) The shallow object that is used as the map during connect/disconnect

#### Examples
The following will show what key/value pairs will look like and what they look like when attached manually instead of with connector.

* `value` is a string

```javascript
change: 'doneMethodName'
```

```javascript
currentClass.addEvent('change', targetClass.doneMethodName.bind(targetClass));
```

* `value` is a function

```javascript
change: function(){/*... code here ...*/}
```

```javascript
currentClass.addEvent('change', function(){/*... code here ...*/});
```

* `value` is an array

```javascript
change: ['doneMethodName', function(){/*... code here ...*/}]
```

```javascript
currentClass.addEvent('change', targetClass.doneMethodName.bind(targetClass));

currentClass.addEvent('change', function(){/*... code here ...*/});
```

* `value` is an object with subevents and a mix of string, function, or array.

```javascript
change: {
    '*': 'doneMethodName',
    'name': function(){/*... code here ...*/},
    'age': ['otherDoneMethodName', function(){/*... other code here ...*/}]
}
```

```javascript
currentClass.addEvent('change', targetClass.doneMethodName.bind(this));

currentClass.addEvent('name', function(){/*... code here ...*/});

currentClass.addEvent('age', targetClass.otherDoneMethodName.bind(targetClass));

currentClass.addEvent('age', function(){/*... other code here ...*/});
```

### connect
---
Connects two classes by using `options.connector` as the map to either attach event listeners to functions on `options.connector` or methods on the target class where the method names are retrieved from `options.connector`. Default behavior is to connect one class. Connect both ways by passing a second argument as `true`.

A name of a specific object in `options.connector` can be passed as the second argument and that object will be used as the map. If connecting both ways, the same `name` will be used. Connect both ways by passing a third argument as `true`.

#### Syntax
```javascript
currentClass.connect(targetClass[, twoWay]);

currentClass.connect(targetClass[, name[, twoWay]]);
```

#### Arguments
1. class - (Class) The class containing the methods that will be attached as event handlers to event listeners on the current class.
2. name - (String, optional) Name of a specific object in `options.connector` to be used as the map.
2. oneWay - (Boolean, optional, `false` by default) Set to true will only connect `this` class with the target class and will not have the target class connect with `this` class.

#### Returns: Class instance.

#### Examples:
```javascript
// Using options.connector object by default
currentClass.options.connector = {
    'add': 'doAddStuff'
};

targetClass.options.connector = {
    'remove': 'doRemoveStuff'
};

/**
 * Bind one way.
 *
 * Basically does currentClass.addEvent('add', targetClass.doAddStuf.bind(targetClass));
 */
currentClass.connect(targetClass);

/**
 * Bind both ways.
 * Basically does:
 * 
 * currentClass.addEvent('add', targetClass.doAddStuf.bind(targetClass))
 * and
 *
 * targetClass.addEvent('remove', currentClass.doRemoveStuff.bind(currentClass));
 */
currentclass.connect(targetClass, true);

// Using specific object that is nested in options.connector
currentClass.options.connector = {
    'classSpecific': {
        'add': 'doAddStuff'
    }
};

targetClass.options.connector = {
    'classSpecific': {
        'remove': 'doRemoveStuff'
    }
};

/**
 * Bind one way.
 *
 * Basically does currentClass.addEvent('add', targetClass.doAddStuf.bind(targetClass));
 */
currentClass.connect(targetClass, 'classSpecific');

/**
 * Bind both ways.
 * Basically does:
 * 
 * currentClass.addEvent('add', targetClass.doAddStuf.bind(targetClass))
 * and
 *
 * targetClass.addEvent('remove', currentClass.doRemoveStuff.bind(currentClass));
 */
currentclass.connect(targetClass, 'classSpecific', true);

```

### disconnect
---
Does the opposite of what `connect` does. Takes the same arguments.

### bound
---
A method provided by [PowerTools! Class.Binds](https://github.com/cpojer/mootools-class-extras/blob/master/Source/Class.Binds.js).

> Provides an alternative way to bind class methods. Stores references to bound methods internally without any manual setup and does not modify the original methods.

The retrieved function is bound to the class instance.

#### Syntax:
```javascript
currentClass.bound(methodName);
```

#### Arguments:
1. methodName - (String) Name of the method that has been bound to the class instance and stored.

#### Examples: (Slightly modified from [PowerTools! Class.Binds](https://github.com/cpojer/mootools-class-extras/))
```javascript

var currentClass = new Class({
    Implements: Connector,

    initialize: function(element){
        this.element = document.id(element);

        this.attach();
    },

    attach: function(){
        // Add the click method as event listener
        this.element.addEvent('click', this.bound('click'));
    },

    detach: function(){
        // Retrieves the same reference to the click method and removes the listener
        this.element.removeEvent('click', this.bound('click'));
    },

    click: function(event){
        event.preventDefault();

        // doSomething
        this.refersToTheClassInstance();
    }
});

```


## Mixin: Butler
---
A Utility Class. It provides a way to define custom setters/getters on a Class.

### options.accessors
---
A key/value object where the key is the name of the setter and value is an object containing overriding set/get methods.

#### Syntax: key/value pairs
```javascript
name: {
    set: function,
    get: function
}
```

#### Arguments
1. name - (String) Name of the set/get method that will get overriden
2. object - (Object) Contains set, get method overrides.
    * set - (Function) The overriding set function. The function will be bound to the current class.
    * get - (Function) The overriding get function. The function will be bound to the current class. 

### setupAccessors
---
Existing accessors in `_accessors` are merged with `options.accessors` before being sent to `setAccessor`. This should be called in the `initailize` or `setup` method.

#### Syntax:
```javascript
currentClass.setupAccessors();
```

#### Returns: Class instance.

### isAccessing
---
Check whether an accessor is being used by checking if `_accessorName` has been defined. This will allow a class to bypass recursive calls to the same custom setter/getter.

#### Syntax:
```javascript
currentClass.isAccessing();
```

#### Returns: Boolean

### setAccessor
---
A method to decorate custom setters/getters that will allow the use of `isAccessing` to prevent recursive calls to the same custom setter/getter. The decorated custom setters/getters is an object of name/function pairs that is stored in `_accessors` by name.

#### Syntax:
```javascript
currentClass.setAccessor(name, obj);

currentClass.setAccessor(obj);
```

#### Arguments:
* Two Arguments
    1. name - (String) Name of the accessor setter/getter object.
    2. obj - (Object) Key/value pairs where the `key` is `set` or `get` and `value` is the function. Any key/value pair is optional. A `set` can exists without a `get`, and a `get` can exist without a `set`.

#### Returns: Class instance.

#### Note: The original undecorated function is stored on the decorated function in the `_orig` attribute.

#### Example:
```javascript
var klass = new Class({
    Implements: CustomAccessor,

    options: {
        accessors: {
            fullName: {
                set: function(){}
            }
        }
    }
});

var currentClass = new klass();

// manually executed because klass doesn't have an initialize or setup method to execute setupAccessors.
currentClass.setupAccessors();

var fullNameAccessor = currentClass.getAccessor('fullName');

fullNameAccessor.set; // returns the decorated set function.

fullNameAccessor.set._orig // is the undecorated original set function.
```

### getAccessor
---
A method to retrieve stored accessors by name or by name and type.

#### Syntax:
```javascript
currentClass.getAccessor(name[, type]);
```

#### Arguments:
1. name - (String) The name of the accessor object to return.
2. type - (String, optional) The name of the method that exists in the accessor object.

#### Returns:
1. Object - The object of decoerated key/value pairs containing the accessors that was stored with the name.
2. Function - The decorated function that is associated with the `type` in the accessor object. The accessor object is retrieved with the `name`.

#### Examples:

__Return an accessor object__

```javascript
currentClass.setAccessor('fullName', {
    set: function(){}
});

var fullNameAccessors =  currentClass.getAccessor('fullName');
/*
fullNameAccessors returns and object where the set function is the decorated function
{
    set: function(){}
}
 */
```

__Return the decorated function in the accessor object__

```javascript
// Returns the decorated function that is stored with the set key, in the fullName accessor object.
var fullNameSetAccessor = currentClass.getAccessor('fullName', 'set');
```

### unsetAccessor
---
Remove an accessor object or decorated function from the accessor object.

#### Syntax:
```javascript
currentClass.unsetAccessor(name[, type]);
```

#### Arguments:
1. name - (String) The name of the accessor object to remove.
2. type - (String, optional) The `key` of the function that should be removed from the accessor object.

#### Returns: Class instance.

#### Example

__Remove an accessor object__

```javascript
currentClass.unsetAccessor('fullName');
```

__Remove a function from the accessor object__

```javascript
currentClass.unsetAccessor('fullName', 'set');
```

## Mixin: Silent
A Utility Class. It provides a solution to disable before a function executes, and re-enabling afterwards.

### isSilent
---
Checks if the Class is currently silent.

#### Syntax:
```javascript
currentClass.isSilent();
```

#### Returns: Boolean

### silence
---
Any method that can trigger an event can be temporarily disabled by passing the function through silence. Once the function has been triggered, events will be re-enabled.

#### Syntax:
```javascript
currentClass.silence(function);
```

#### Arguments:
1. function - (Function) The function that will be executed once events have been prevented. The function is bound to the model instance before execution.

#### Returns: Class instance.

## Mixin: Snitch
---
A Utility Class. Use this class to set/get validator functions. A `validate` method offers a way to easily retrieve a validator to test a value. A `proof` method is a simple object spec test that tests an object for existence of keys and runs validation tests on the values of those keys.

### options.validators
---
A key/value object where the key is the property name and value is a function. The function will be passed an argument to test against and should return a boolean.

### Syntax: key/value pairs
```javascript
{
    name: function,
    name: function
}
```

#### Arguments
1. name - (String) Name of the validator function
2. function - (Function) The function will be passed an argument to test against and should return a `Boolean`

### setupValidators
---
Existing validators in `_validators` are merged with `options.validators` to be attached by `setValidator`. This should be called in the `initailize` or `setup` method.

#### Syntax:
```javascript
currentClass.setupValidators();
```

#### Returns: Class instance.

### setValidator
---
Set functions by property. The function will be decorated to be bound to the class instance. 

#### Syntax:
```javascript
currentClass.setValidator(name, function)

currentClass.setValidator(obj);
```

#### Arguments:
* Two Arugments:
    1. name - (String) Name of the validator.
    2. function - (Function) The validation function to test against a passed parameter.
* One Argument:
    1. obj - (Object) Name/function object.

#### Returns: Class instance.

#### Note: The original undecorated function is stored on the decorated function in the `_orig` attribute.

#### Example:
```javascript
var klass = new Class({
    Implements: Snitch,

    options: {
        validators: {
            fullName: Type.isString // Type.isString is a method in MooTools-Core that tests arguments whether they are strings or not by returning a boolean
        }
    }
});

var currentClass = new klass();

// manually executed because klass doesn't have an initialize or setup method to execute setupValidators.
currentClass.setupValidators();

// returns the validation function
var fullNameValidator = currentClass.getValidator('fullName');

// the undecorated original function
fullNameValidator._orig;
```

### getValidator
---
Retrieve a stored validation function by property name.

#### Syntax:
```javascript
currentClass.getValidator(name[, name]);
```

#### Arguments
1. name - (String) The name of the validator to return. Consecutive names will return an object of name/function matches.

#### Returns:
* More than One Consecutive Argument
    * (Object) Name/function pairs containing matches validator functions and their corresponding names. An unexisting validator will return `undefined` in place of the function.
* One argument
    * (Function) Validation function corresponding to the name.

#### Example:
```javascript
currentClass.getValidator('fullName'); // returns function or undefined

currentClass.getValidator('age', 'fullName'); // returns an object containing age and fullName properties
```

### validate
---
Convenient method to retrieve a validator by property to test the value against. By default it always returns true. If a validator exists, it returns the results of validation.

#### Syntax:
```javascript
currentClass.validate(property, value);
```

#### Arguments:
1. property - (String) Name of the validator to retrieve.
2. value - (Mixed) Value to validate by the retrieved validator.

#### Returns:
* (Boolean) Value of whether validation has passed or not.

### proof
---
"Proof" an object where every item that exists in `_validators` exists in the object and every validation function returns a `true` value. This causes `_validators` to act like a spec. By default, `proof` returns true in case there are no defined validators. It is a convenient method that utilizes `Snitch Function: proof`;

#### Syntax:
```javascript
currentClass.proof(obj);
```

#### Arguments:
1. obj - (Object) The object that will be tested against every validator in `_validators`. Every property in `_validators` just exist in obj and every function must pass in order for proof to return true.

#### Returns:
* (Boolean) Value of whether the object has passed validation and item existence.

### Snitch Function: proof
---
Generic method to proof an object with validators.

#### Syntax:
```javascript
Snitch.proof(obj, validators);
```

#### Arguments:
1. obj - (Object) Object of key/value pairs that will be compared against`validators`
2. validators - (Object) Object of key/function pairs that will be used to compare against `obj` where each key has to exist in the `obj` and the `obj` property value passes the validator function.

#### Returns:
* (Boolean) Value of whether the object has passed validation and item existence.