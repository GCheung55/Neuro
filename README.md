Neuro
======================

A MooTools client-side MVC.

### Version: 0.1.1 (Alpha)

### Influences:

* [Backbone](documentcloud/backbone)
* [Shipyard](seanmonstar/Shipyard)

### Dependencies:

* [MooTools-Core 1.x](mootools/mootools-core)
* [Company](keeto/company)
* [Is.js](gcheung55/is.js)

### Focus:

* uncoupled coding but allow for a coupled organization if necessary
* provide base for applications

Usage
-----

### Model

Subclass Model with MooTools Class.

```javascript
var HumanModel = new Class({
    Extends: Neuro.Model
    // Set the default data
    _data: {
        firstName: ''
        ,lastName: ''
        ,hp: 10
        ,max: 100
        ,lvl: 1
        // You can set a function as a custom getter. "this" will be _data, not the model itself.
        ,name: function(){
            return this.firstName + ' ' + this.lastName;
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

// Add multiple datasets to the collection
Humans.add({
    firstName: 'Kareem Abdul'
    ,lastName: 'Jabbar'
    ,hp: 1000
    ,lvl: 80
}, {
    firstName: 'Gary'
    ,lastName: 'Elms'
    ,hp: 800
    ,lvl: 81
});

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
* Add a builder
* Add a Router mechanism
* Add a Sync mechanism
