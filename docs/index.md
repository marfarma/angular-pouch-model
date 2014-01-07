# Angular Pouch Model

A promised based, $digest aware, NoSQL object persistence library for Angularjs applications using PouchDB in the browser.

## Simple Persistence, _Plus_

Inspired by Rail's ActiveModel, Angular Pouch Model provides NoSQL object persistence with a local in-browser PouchDB. In addition to Angularjs $digest aware CRUD methods, the library also supports:

### Declarative Model Validations

- When save validations fail, create and update operations fail.
- When destroy validations fail, delete operations fail.

### Google Query Language

GQL is a SQL-like language for retrieving entities or keys from a datastore.  GQL where conditions can be used as search criteria to return a set of model objects.  It can also be used to return an array of anonymous objects with properties as listed in the query select clause.

### Event Hooks

Assign callbacks to be executed on model create, update or destroy events.  Cascade deletions, eager load related data, enrich a model data with the results of a remote api call, etc.  Note: `around` callbacks (i.e. - `around_create`, `around_update`, `around_destroy`) are not implemented

| Create        | Update        | Destroy          |
| ------------- |---------------| -----------------|
| before_create | before_update | before_destroy   |
| after_create  | after_update  | after_destroy    |


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
