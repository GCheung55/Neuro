Neuro
======================

A MooTools client-side MVC.

__Version: 0.2.0 (Alpha)__

[![Build Status](https://secure.travis-ci.org/GCheung55/Neuro.png)](http://travis-ci.org/GCheung55/Neuro)

__Influences:__

* [Backbone](http://github.com/documentcloud/backbone)
* [Shipyard](http://github.com/seanmonstar/Shipyard)

__Dependencies:__

* [MooTools-Core 1.x](http://github.com/mootools/mootools-core)
* [Is.js](http://github.com/gcheung55/is.js)

__Focus:__

* uncoupled coding but allow for a coupled organization if necessary
* provide base for applications

__Extensions:__

* [Neuro-Sync](http://github.com/gcheung55/neuro-sync) - Extends Neuro with a CRUD API
* [Neuro-Company](http://github.com/gcheung55/neuro-company) - Extends Neuro with an Observer API

## Neuro Model
The __Model__ is a MooTools Class object that provides a basic API to interact with data. You can use Model by itself or extend other Class objects with it.

__Implements:__
* Connector
* CustomAccessor
* Events
* Options
* Silence

### constructor (initialize)

#### Syntax:
```javascript
var model = new Neuro.Model(data [, options]);
```

#### Arguments:
1. `data` - (Object) An object containing key/value pairs
2. `options` - (Object, optional) The Model options
    * primaryKey - (String) Define to uniquely identify a model in a collection
    * defaults - (Object) Contains the default key/value pair defaults for the Model.

#### Returns: Model instance.

#### Events:
* `change` - Triggered when a change to the model's data has occurred
    `function(model){}`
* `change:key` - Triggered when a specific model data property change has occurred. The `key` refers to the specific property. All `change:key` events will be triggered before `change` is triggered.
    `function(model, key, value, oldValue){}`
* `destroy` - Triggered when the model is destroyed.
    `function(model){}`
* `reset` - Triggered when the model is reset to its default values.
    `function(model){}`

#### Notes:
* Method names prefixed with `_` is considered private and should not be used.

### Method: isSetting
Use to check if data is currently being handled by the model to assign values to properties the model has.

#### Syntax:
```javascript
model.isSetting();
```

#### Returns: Boolean (true/false).

### set
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

### unset
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
Reset data properties to their default values the model had.

#### Syntax:
```javascript
model.reset(property);

model.reset([property1, property2]);
```
#### Arguments:
1. property - (String | Array) The property to be reset that the model has. Multiple properties can be reset if they are encapsulated in an Array.

#### Returns: Model instance.

#### Triggered Events:
* `change:key`
* `change`
* `reset`

### get
Retrieve a property value the model has.

#### Syntax:
```javascript
model.get(property);

model.set(property1, property2);
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

### getData
Retrieve all properties/values the model has. The returned object is a clone (dereferenced) of the data the model has.

#### Syntax:
```javascript
model.getData();
```

#### Returns: Object containing the data the model has.

### getPrevious
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
Retrieve all previous properties/values the model had. THe returned object is a clone (dereferenced) of the previous data the model had.

#### Syntax:
```javascript
model.getPreviousData();
```

#### Returns: Object containing the previous data the model had.

### change
Checks if data is changed before triggering `change` event. Not likely to be called outside of `set`.

```javascript
model.change();
```

#### Returns: Model instance.

#### Triggered Events: (only if there is a change in the model data)
* `change`

### changeProperty
Checks if data is changed before triggering `change:key` event. Not likely to be called outside of `set`.

```javascript
model.changeProperty(property, value);

model.changeProperty(object);
```

#### Arguments:
* Two Arguments (property, value)
    1. property - (String) A key corresponding to the changed property the model has.
    2. value - (String | Array | Number | Object | Function | Class) A value of the corresponding property that was changed.
* One Argument (object)
    1. object (Object) An object containing sets of property/value pairs

#### Returns: Model instance.

#### Triggered Events: (only if there is a change in the model data)
* `change:key`

### Destroy
Triggers the `destroy` event. This should be overriden in a Class that extends from Model to do additional things. If overriden, remember to call `this.parent();` to trigger the `destroy` method, or execute `signalDestroy` manually.

#### Syntax:
```javascript
model.destroy();
```

#### Returns: Model instance.

#### Triggered Events:
* `destroy`

### toJSON
Returns a copy of data the model has. Can be used for persistence, serialization, or augmentation before passing over to another object. `JSON.stringify` uses this to to create a JSON string, though the method itself does not return a String.

#### Syntax:
```javascript
model.toJSON();
```

#### Returns: Object containing the data the model has.

### MooTools-Core Object Methods:
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