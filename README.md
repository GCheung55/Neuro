Neuro
======================

A MooTools client-side MVC.

### Version: 0.1.7 (Alpha)

[![Build Status](https://secure.travis-ci.org/GCheung55/Neuro.png)](http://travis-ci.org/GCheung55/Neuro)

### Influences:

* [Backbone](documentcloud/backbone)
* [Shipyard](seanmonstar/Shipyard)

### Dependencies:

* [MooTools-Core 1.x](mootools/mootools-core)
* [Is.js](gcheung55/is.js)

### Focus:

* uncoupled coding but allow for a coupled organization if necessary
* provide base for applications

Extensions
----
* [Neuro-Sync](gcheung55/neuro-sync) - Extends Neuro with a CRUD API
* [Neuro-Company](gcheung55/neuro-company) - Extends Neuro with an Observer API

Usage
-----

### Model

Subclass Model with MooTools Class.

```javascript
var HumanModel = new Class({
    Extends: Neuro.Model
    // Set the default data
    ,options: {
        defaults: {
            firstName: ''
            ,lastName: ''
            ,hp: 10
            ,max: 100
            ,lvl: 1
            // You can set a function as a custom getter. "this" will be _data, not the model itself.
            ,name:''
        }
        // Custom setters and getters go here.
        // Return a null not trigger change.
        ,accessors: {
            name: {
                // isPrevious is a flag set when using the getPrevious method, to help you know what data to look for
                get: function(isPrevious){
                    // Just an example. You can also go directly to the data because "this" is exposed, which will allow you to bypass other custom getters.
                    var getMethod = 'get';
                    isPrevious && (method += 'Previous');

                    return this[getMethod]('firstName') + ' ' + this[getMethod]('lastName');
                }
            }
        }
    }
});
```
Create a model instance

```javascript
var bruceLee = new HumanModel({
    firstName: 'Bruce'
    ,lastName: 'Lee'
    ,hp: 1000
    ,lvl: 99
});

bruceLee.get('name'); // 'Bruce Lee'
bruceLee.get('lvl'); // 99
bruceLee.set('lvl', 100).get('lvl'); // 100
```

### Collection

Subclass Collection with MooTools Class.

```javascript
var Humans = new Class({
    Extends: Neuro.Collection

    ,Model: HumanModel
});
```
Add data to the collection

```javascript
// Add one dataset to the collection
Humans.add({
    firstName: 'Chuck'
    ,lastName: 'Norris'
    ,hp: 1000
});

// Add multiple datasets to the collection, must be an Array
Humans.add([{
    firstName: 'Kareem Abdul'
    ,lastName: 'Jabbar'
    ,hp: 1000
    ,lvl: 80
}, {
    firstName: 'Gary'
    ,lastName: 'Elms'
    ,hp: 800
    ,lvl: 81
}]);

// Add a model instance
Humans.add(bruceLee);
```
Get a model from the collection by index

```javascript
Humans.get(4); // bruceLee model
```
Remove a model from the collection
```javascript
var garyElms = Humans.get(3); // Gary Elms model
Humans.remove(garyElms);

// Check if the removed model still exists in the collection
Humans.hasModel(garyElms); // false
```

ToDo
----
* Add a Router mechanism
* Add a basic View Class