# Angular Pouch Model

A promised based, $digest aware, object persistence layer for Angularjs applications using PouchDB in the browser.

## Simple Persistence, _Plus_

### Plain Old JavaScript Object

Angular Pouch Model is a simple JavaScript object persistence layer that attempts to follow a Data Mapper pattern, allowing you to use plain-old JavaScript objects decoupled from the document data store. There is no need for your objects to inherit from another class. The library acts as an Object Document Mapper and currently supports in-browser PouchDB.  

APM works with the POJOs you already have. It's primary focus is on serializing and rehydrating potentially complex object graphs.  
With APM, given an existing Prototype, adding PouchDB persistence requires two lines of code.

    var Cat = function() {
        var cat = {};
        cat.name = '';
        
        // may have functions
        cat.toString = function(){ 
            return "I'm a cat and my name is " + name;
        };
        
        // may have complex object or array properties
        cat.description = {color:"black",
                           size:"fat"}; 
        
        cat.apm_type = 'Cat';                          // 1. add property apm_type
        return cat; 
    };
    apmDb.setType('Cat',Cat);                          // 2. register Prototype with the module
 
create and persist your objects, in the context of an Angular controller, for example:
    
    $scope.kitty = apmDb.new('Cat',{ name: 'Zildjian' });
    
    $scope.saveClickCB = function() {                  // save returns an angular.$q promise
        $scope.kitty = apmDb.save($scope.kitty)        // and is angular.$digest aware                                                       
        .then(function(reason){          
            $scope.kitty.errors = reason;              // application defined
            return $scope.kitty;
        },function(result){     
            if (result.errors) {                       // application defined 
                Object.delete(result.errors); 
            }
            return result;
        });
    };
    
Other document object mapping solutions force you to extend on their object model. 
Using Mongoose, for example, you'd define and save a Cat as follows:

    var Cat = mongoose.model('Cat', { name: String }); // instead of your existing POJO

    var kitty = new Cat({ name: 'Zildjian' });
    kitty.save(function (err) {                        // async save method
      if (err) // ...
      console.log('meow');
    });
    
Note: Mongoose's save method neither returns a promise nor is Angular.$digest aware. Recommended 
practice for Angular applications is to wrap Mongoose method calls with a service.

### Declarative Validations

- When save validations fail, create and update operations fail.
- When destroy validations fail, delete operations fail.

### Query Language

GQL is a SQL-like language for retrieving entities or keys from a datastore.  GQL where conditions can be used as search criteria to return a set of model objects.  It can also be used to return an array of anonymous objects with properties as listed in the query select clause.

### Supports Model Event Hooks

Assign callbacks to be executed on model create, update or destroy events.  Cascade deletions, eager load related data, enrich a model data with the results of a remote api call, etc.

| Create        | Update        | Destroy          |
| ------------- |---------------| -----------------|
| before_create | before_update | before_destroy   |
| after_create  | after_update  | after_destroy    |

### Identity Map

In modern single-page applications JavaScript objects tend to be retained in the browser indefinitely, compounding the risk of object identity issues creating difficult to diagnose bugs.  With an identity map, all retrieved objects are cached in memory, and all requests return a reference to the cached object, if it exists.  

## Versioning

Angular Pouch Model follows [semver-ftw](http://semver-ftw.org/). 

## Release History

- 1.0.0: (Targeted) Initial (Beta) Release
- prior 1.0: Alpha & early Beta versions

## License

Copyright (c) 2014 Pauli Price
Licensed under the MIT license.

## Contributing

... TBD ...
