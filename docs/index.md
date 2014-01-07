# Angular Pouch Model

A promised based, $digest aware, object persistence library for Angularjs web applications using PouchDB in the browser.

## Opinionated, PouchDB POJO Persistence for Angularjs

Inspired by Rail's ActiveModel, the library provides NoSQL model abstraction for in browser PouchDB persistence.

## Simple Persistence API

Provides basic CRUD and find methods to persist plain old JavaScript objects in PouchDB database, with support for the Angularjs $digest cycle.

## Save and Destroy Validations

- When save validations fail, create and update operations will fail.
- When destroy validations fail, delete operations will fail.

## Hooks

Supports callbacks to be executed on model create, update or destroy events.  These callbacks allow you to cascade deletions, eager load related data, enrich a model data with the results of a remote api call, etc.

- before_create 
- after_create

- before_update 
- after_update

- before_destroy 
- after_destroy

Support for `around` callbacks (i.e. - around_create, around_update, around_destroy) is not implemented

## Google Query Language

GQL is a SQL-like language for retrieving entities or keys from a datastore.  GQL where conditions can be used as search criteria to return a set of model objects.  It can also be used to return an array of anonymous objects with properties as listed in the query select clause.

## Versioning

angular-pouch-model follows [semver-ftw](http://semver-ftw.org/). 

Release History

1.0.0: (Targeted) Initial Beta Release
prior 1.0: Alpha & early Beta versions

## License

Copyright (c) 2014 Pauli Price
Licensed under the MIT license.

## Contributing

... TBD ...
