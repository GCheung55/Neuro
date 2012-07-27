Neuro
======================

A MooTools client-side MVC.

__Version: 0.2.0 (Alpha)__

[![Build Status](https://secure.travis-ci.org/GCheung55/Neuro.png)](http://travis-ci.org/GCheung55/Neuro)

__Influences:__

* [Backbone](/documentcloud/backbone)
* [Shipyard](/seanmonstar/Shipyard)

__Dependencies:__

* [MooTools-Core 1.x](/mootools/mootools-core)
* [Is.js](/gcheung55/is.js)

__Focus:__

* uncoupled coding but allow for a coupled organization if necessary
* provide base for applications

__Extensions:__

* [Neuro-Sync](http://github.com/gcheung55/neuro-sync) - Extends Neuro with a CRUD API
* [Neuro-Company](http://github.com/gcheung55/neuro-company) - Extends Neuro with an Observer API

## Neuro Model
The __Model__ is a MooTools Class object that provides a basic API to interact with data. You can use Model by itself or extend other Class objects with it.

__Implements:__
* [Mixin: Connector](#mixin-connector)
* [Mixin: CustomAccessor](#mixin-customaccessor)
* [Mixin: Events](#mixin-events)
* [Mixin: Options](#mixin-options)
* [Mixin: Silence](#mixin-silence)

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
    * accessor - (Object) See [Mixin: CustomAccessor](#mixin-customaccessor)

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

### change
---
Checks if data is changed before triggering `change` event. Not likely to be called outside of `set`.

```javascript
model.change();
```

#### Returns: Model instance.

#### Triggered Events: (only if there is a change in the model data)
* `change`

### changeProperty
---
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

### connect
---
see [Mixin: Connector](#mixin-connector)
### disconnect
---
see [Mixin: Connector](#mixin-connector)
### setupAccessors
---
see [Mixin: CustomAccessor](#mixin-customaccessor)
### isAccessing
---
see [Mixin: CustomAccessor](#mixin-customaccessor)
### setAccessor
---
see [Mixin: CustomAccessor](#mixin-customaccessor)
### getAccessor
---
see [Mixin: CustomAccessor](#mixin-customaccessor)
### unsetAccessor
---
see [Mixin: CustomAccessor](#mixin-customaccessor)
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

### Returns: This Class instance.

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

#### Syntax: key/value pairs
```javascript
event: method
```

#### Arguments
1. event - (String) The name of the event to be attached. It becomes the parent event if the events corresponding value is an object.
2. method - (String, Function, Array, Object)
    * String - Refers to a method on the target class. The method will be bound to the target class and attached as the event handler.
    * Function - The function will be bound to the current class and attached as the event handler
    * Array - Can contain a mix of `String` (name of method to retrieve said method from target class) or `Function` to be attached as the event handler
    * Object - Contains key/value pairs where `key` will refer to the sub-event and value refers to `String`, `Function`, or `Array` to attach as event handlers. The sub-event will be prepended by the `event` with a `:`.

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
Connects two classes by using `options.connector` as the map to either attach event listeners to functions on `options.connector` or methods on the target class where the method names are retrieved from `options.connector`. Default behavior is to connect two classes. Connect one way by passing a second argument as `true`.

#### Syntax
```javascript
currentClass.connect(targetClass[, oneWay]);
```

#### Arguments
1. class - (Class) The class containing the methods that will be attached as event handlers to event listeners on the current class.
2. oneWay - (Boolean, optional, `false` by default) Set to true will only connect `this` class with the target class and will not have the target class connect with `this` class.

### disconnect
---

## Mixin: CustomAccessor
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
Existing accessors in `_accessors` need to be decorated so they are merged with `options.accessors` before being sent to `setAccessor`.

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
A method to decorate custom setters/getters that will allow the use of `isAccessing` to prevent recursive calls to the same custom setter/getter.

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
__Silent__ is a MooTools Class object without a constructor. It is used as a mixin for other Class objects, providing a solution to disable before a function executes, and re-enabling afterwards.

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
