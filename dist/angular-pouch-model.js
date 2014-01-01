/* angular-pouch-model - 0.0.1
 * promised based, $digest aware, object persistence layer for angularjs apps using PouchDB
 * http://marfarma.viewdocs.io/angular-pouch-model
 */
(function() {

var module = angular.module('pouch-model', []);

module.provider('PouchModel', function () {
    
    var sleep = function (ms) {
        var unixtime_ms = new Date().getTime();
        while(new Date().getTime() < unixtime_ms + ms) {}
    };
    
    var getNew = {};
    
    validate.validators.simple = function(value, options, key, attributes) {
        if (!validate.isDefined(value)) {return;}
        if (!validate.isString(value) && !validate.isNumber(value)) {return options.message || "is not a simple value";}
    };
    validate.validators.isFunction = function(value, options, key, attributes) {
        if (!validate.isDefined(value)) {return;}
        if (typeof value !== 'function') {return options.message || "is not a function";}
    };
    
    this.$get = ['$q','$db','$rootScope', '$timeout', 
                function($q,$db,$rootScope, $timeout) {
                    
                    var safeApply = function (scope, fn) {
                        if (scope.$$phase || scope.$root.$$phase) { 
                            fn(); 
                        } else {  
                            scope.$apply(fn); 
                        }
                    };
                    
                    validate.asyncValidate = function(attributes, constraints, options, callback) {
                      var attr,
                          error,
                          validator,
                          validatorName,
                          validatorOptions,
                          value,
                          validators,
                          errors = {};
                      var promises = [];

                      options = options || {};

                      // Loops through each constraints, finds the correct validator and run it.
                      for (attr in constraints) {
                        value = attributes[attr];
                        validators = validate.result(constraints[attr], value, attributes, attr);

                        for (validatorName in validators) {
                          validator = validate.validators[validatorName];

                          if (!validator) {
                            error = validate.format("Unknown validator %{name}", {name: validatorName});
                            throw new Error(error);
                          }

                          validatorOptions = validators[validatorName];
                          // This allows the options to be a function. The function will be called
                          // with the value, attribute name and the complete dict of attribues.
                          // This is useful when you want to have different validations depending
                          // on the attribute value.
                          validatorOptions = validate.result(validatorOptions, value, attributes, attr);
                          if (!validatorOptions) {continue;}
                          error = validator.call(validator,
                                                 value,
                                                 validatorOptions,
                                                 attr,
                                                 attributes);

                          if (validate.isDefined(error)) {
                              if (validate.isString(error) || validate.isArray(error)){
                                  promises.push($q.when({attr:attr, error:error}));
                              } else {
                                  promises.push(error);
                              }
                          }
                        }
                      }
                      //$rootScope.$apply();
                      $q.all(promises).then(
                          function(data){
                              //console.log(data);
                              var errors = {};
                              var attr = null;
                              data.forEach(function(result) {
                                  attr = result.attr;
                    
                                  // The validator is allowed to return a string or an array.
                                  if (validate.isString(result.error)) {result.error = [result.error];}
                                  if (result.error && result.error.length > 0) {
                                    errors[attr] = (errors[attr] || []).concat(result.error);
                                  }
                              });
                              errors = validate.fullMessages(errors, options);
                              //console.log(errors);
                
                              // Return the errors if we have any
                              if (Object.keys(errors).length > 0) {
                                  //console.log("error callback");
                                  callback(errors,null);
                              } 
                              else {
                                  //console.log("success callback");
                                  callback(null,null);
                              }
                          },
                          function(error){
                              console.log("asyncValidate error:");
                              console.log(error);
                          }
                      );
                    };
                    
                    // unique : {on: typeName (defaults to current model's type)}
                    validate.validators.unique = function(value, options, property, attributes) {
                        var message;
                        var deferred = $q.defer();
                        var promiseCompleted = false;
                        if (!validate.isDefined(value)) {return;}
                        
                        // default to current model's type
                        if (!validate.isDefined(options.on) && validate.isDefined(attributes.apm_type)) {
                            options.on = attributes.apm_type;
                        }
                        if (validate.isDefined(options.on) && !validate.contains(getNew, options.on)) {
                            message = "^Validation 'unique' error: %{on} is not a PouchModel registered type";
                            message = validate.format(message, {on: options.on});
                            safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                        } else {
                            unique(attributes,property,function(error,isUnique){
                                if (error) { 
                                    if (validate.isDefined(err.message)) {
                                        message =  err.message;                                    
                                    }
                                    else {
                                        message =  err;
                                    }
                                    safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                                }
                                else {
                                    if (!isUnique) { 
                                        message = options.message || "is not unique";
                                        safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                                    } 
                                    safeApply($rootScope, function() { deferred.resolve({attr:property});});
                                }
                            });
                        }
                        return deferred.promise;                            
                    };
                    
                    // exists : (property: property, options: {type:foreign_type,property:foreign_property}) 
                    validate.validators.exists = function(value, options, property, attributes) {
                        var message;
                        var deferred = $q.defer();
                        var promiseCompleted = false;
                        if (!validate.isDefined(value)) {return;}
                        
                        if (validate.isDefined(options.type) && !validate.contains(getNew, options.type)) {
                            message = "^Validation 'exists' error: %{type} is not a PouchModel registered type";
                            message = validate.format(message, {type: options.type});
                            safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                        } else if (!validate.isDefined(options.property) ) {
                                message = "^Validation 'exists' error: %{property} is required";
                                message = validate.format(message, {property: options.property});
                                safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                        } else {
                            findByProperty(options.type, options.property, value, function(err, obj){
                                if (err) { 
                                    if (validate.isDefined(err.message)) {
                                        message =  err.message;                                    
                                    }
                                    else {
                                        message =  err;
                                    }
                                    safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                                } else {
                                    if (obj === null) {
                                        message = options.message || "is not found";
                                        safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                                    }
                                    else {
                                        safeApply($rootScope, function() { deferred.resolve({attr:property});});
                                    }
                                }           
                            });
                        }
                        return deferred.promise;                            
                    };
                    
                    // omits : (property: property, options: {type:foreign_type,property:foreign_property}) 
                    validate.validators.omits = function(value, options, property, attributes) {
                        var message;
                        var deferred = $q.defer();
                        var promiseCompleted = false;
                        if (!validate.isDefined(value)) {return;}
                        
                        if (validate.isDefined(options.type) && !validate.contains(getNew, options.type)) {
                            message = "^Validation 'omits' error: %{type} is not a PouchModel registered type";
                            message = validate.format(message, {type: options.type});
                            safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                        } else if (!validate.isDefined(options.property) ) {
                                message = "^Validation 'omits' error: %{property} is required";
                                message = validate.format(message, {property: options.property});
                                safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                        } else {
                            findByProperty(options.type, options.property, value, function(err, obj){
                                if (err) { 
                                    if (validate.isDefined(err.message)) {
                                        message =  err.message;                                    
                                    }
                                    else {
                                        message =  err;
                                    }
                                    safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                                } else {
                                    if (obj === null) {
                                        safeApply($rootScope, function() { deferred.resolve({attr:property});});
                                    }
                                    else {
                                        message = options.message || "exists";
                                        safeApply($rootScope, function() { deferred.resolve({attr:property,error:message});});
                                    }
                                }           
                            });
                        }
                        return deferred.promise;                            
                    };

                    var fromPrototype = function(Type, obj) {
                        var newObject = new Type();
                        $.extend(true, newObject, obj);
                        return newObject;
                    };
    
                    var returnObj= function(err, obj, res, callback) {
                        if (!err) { 
                            obj._id = res.id;
                            obj._rev = res.rev;
                        }
                        callback(err, obj);
                    };
    
                    var insert = function(obj, callback) {
                        obj._id = uuid();
                        $db.post(obj, function(err, res) {
                            returnObj(err, obj, res, callback);
                        });
                    };
    
                    var update = function(obj, callback) {
                        var err;
                        var constraints = {
                           _id: {presence: true, simple: true},
                          _rev: {presence: true, simple: true},
                          apm_type: {presence: true, simple: true,
                                 inclusion: {
                                      within: getNew
                                   }
                               }
                        };
                        err = validate(obj, constraints);
                        if (typeof err !== 'undefined') {
                            //console.log(err);
                            returnObj(err, obj, null, callback);
                        } else {
                            $db.put(obj, function(err, res) {
                              returnObj(err, obj, res, callback);
                            });
                        }
                    };
                    
                    var unique = function(obj, property, callback){
                        var args = {obj:obj, property:property, callback:callback};
                        var constraints = {
                            obj: {presence: true},
                            property: {presence: true},
                            callback: {presence: true, isFunction: true}
                        };
                        err = validate(args, constraints);
                        if (typeof err !== 'undefined') {
                            callback(err,null);
                        } else {
                            // ensure property is unique within type
                            var where = '';
                            if (obj._id && obj._id.length > 0 ) {
                                where = "apm_type = '" + obj.apm_type + "' and " + property + " = '" + obj[property] + "' and _id != '" + obj._id + "'";
                            } else {
                                where = "apm_type = '" + obj.apm_type + "' and " + property + " = '" + obj[property] + "'";
                            }
                        
                            var query = {select:"1",where:where};
                            $db.gql(query, function(err, result){
                                if (err) {
                                    callback(err,null);
                                } else {
                                    if (result.rows.length > 0) {
                                        callback(null,false);
                                    } else {
                                        callback(null,true);
                                    }
                                }
                            });    
                        }
                    };
    
                    var exists = function(_id, callback){
                        find('',_id,function(err,obj){
                            // obj is null if not found
                            callback(err,obj);
                        });
                    };
                    
                    // if row type matches given type, return object of type with data from row
                    // otherwise return null -- if type is null or empty return row
                    var hydrate = function(row, type){
                        var obj;
                        if (type.length > 0) {
                            if (row.apm_type === type) {
                                obj = fromPrototype(getNew[row.apm_type], row);
                            } 
                        } else {
                            obj = row;
                        }
                        return obj;
                    };
                    
                    // return null if not found, object if found one, array if found many
                    var query = function(type, where, callback){
                        
                        var obj = {select:"*",where:where};
                        $db.gql(obj, function(err, result){
                            var objs;
                            if (err) {
                                callback(err,null);
                            } else {
                                if (result.rows.length === 1) {
                                    objs = hydrate(result.rows[0], type);
                                } else if (result.rows.length > 1) {
                                    objs = [];
                                    result.rows.forEach(function(row) {
                                        obj = hydrate(row, type);
                                        objs.push(obj);
                                    });
                                } else {
                                    objs = null;
                                }
                                callback(null,objs);
                            }
                        });  

                    };
    
                    var find = function(type, _id, callback){
                        // create view with _id, pass type to query
                        var obj;
                        var err = {};
                        var where = "apm_type = '" + type + "' and _id = '" + _id + "'";

                        if (type.length === 0) {
                            where = "_id = '" + _id + "'";
                        } 
                        query(type, where, callback);
                    };
    
                    var findByProperty = function(type, property, value, callback){
                        // create view with type, name 
                        var obj;
                        var err = {};
                        var where = "apm_type = '" + type + "' and " + property + " = '" + value + "'";
                        query(type, where, callback);
                    };
                    
                    var toSerializable = function(obj) {
                        // copy data to savable object      
                        var serializableObj = {};
                        for (var field in obj) {
                            if (obj.hasOwnProperty(field)) {
                                if (typeof obj[field] !== 'function') {
                                    serializableObj[field] = angular.copy(obj[field]);
                                }
                            }
                        }
                        return serializableObj;  
                    };
                    
                    var updatable = function(obj, callback) {
                        find(obj.apm_type, obj._id, function(error,current) {
                            if (error) {
                                callback(error,null);
                            } else {
                                if (current === null) {
                                    // previously deleted or type mismatch
                                    err = {};
                                    err.message = "Existing object with id: " + obj._id + "and  type '" + obj.apm_type + " not found.";
                                    callback(err,null);
                                } else {
                                    callback(null,true);
                                }
                            }
                        });
                    };
                    
                    // save or update object to PouchDB
                    var save = function(obj, callback){
                        var err;
                        var constraints = {
                          apm_type: {presence: true, simple: true,
                                   inclusion: {
                                        within: getNew
                                     }
                                 }
                        };
                        if (typeof obj.apm_validations !== 'undefined' && obj.apm_validations !== null) {
                            for (var field in obj.apm_validations) {
                                if (obj.apm_validations.hasOwnProperty(field)) {
                                    // TODO: ensure merge rather than overwrite
                                    constraints[field] = angular.copy(obj.apm_validations[field]);
                                }
                            }
                        }
                        validate.asyncValidate(obj, constraints, {}, function(err,result){
                            //if (typeof err !== 'undefined') {
                            if (validate.isDefined(err)) {
                                callback(err,obj);
                            } else {
                                var serializableObj = toSerializable(obj);
                            
                                if (obj._rev !== '') {
                                    updatable(obj, function(error, canUpdate){
                                        if (canUpdate) {
                                            update(serializableObj, function(error, obj){
                                                if (error) {
                                                    callback(error,obj);
                                                } else {
                                                    obj._rev = serializableObj._rev;
                                                    callback(null,obj);
                                                }
                                            });
                                        } else {
                                            callback(error,obj);
                                        }
                                    });
                                } else {
                                    insert(serializableObj, function(error, obj){
                                        if (error) {
                                            callback(error,obj);
                                        } else {
                                            obj._id = serializableObj._id;
                                            obj._rev = serializableObj._rev;
                                            callback(null,obj);
                                        }
                                    });
                                }
                            }              
                        }
                    );
                };
            
                    // function that returns a new object of type
                    this.setNew = function(type, value) {
                        var err;
                        var obj = {apm_type:type,value:value};
                        var constraints = {
                          apm_type: {presence: true, simple: true},
                          value: {presence: true, isFunction: true}
                         };
                        err = validate(obj, constraints);
                        if (typeof err !== 'undefined') {
                            return(err);
                        } else {
                            getNew[type]= value;
                        }
                    };
    
                    var ret = {};
                    // get all matching objects, passing in a function(err, response) to process results
                    ret.getAll = function(type) {
                        var deferred = $q.defer();
                        var err;
                        var obj = {apm_type:type};
                        var constraints = {
                          apm_type: {presence: true, simple: true,
                                 inclusion: {
                                        within: getNew
                                 }
                             }
                         };
                        err = validate(obj, constraints);
                        if (typeof err !== 'undefined') {
                            safeApply($rootScope, function() { deferred.reject(err);});
                        } else {
                            var where = "apm_type = '" + type + "'";
                            
                            query(type, where, function(err, response) {
                                var objs = [];
                                if (err) {
                                    safeApply($rootScope, function() { deferred.reject(err);});
                                } else {
                                    safeApply($rootScope, function() { deferred.resolve(response);});
                                }
            
                            }); 
                        }      
                        return deferred.promise;
                    };  
                    // get new object of 'type', passing in callback(err, obj) to process results
                    ret.newObj = function(type) {
                        var deferred = $q.defer();        
                        var err;
                        var constraints = {
                          apm_type: {presence: true, simple: true,
                                 inclusion: {
                                        within: getNew
                                 }
                          }
                        };
                        err = validate({apm_type: type}, constraints);
                        if (typeof err !== 'undefined') {
                            safeApply($rootScope, function() { deferred.reject(err);});
                        } else {
                            var obj = new getNew[type]();
                            obj._id = '';
                            obj.name = '';
                            obj.apm_type = type; 
                            obj._rev = '';
                            safeApply($rootScope, function() { deferred.resolve(obj);});
                        }
                        return deferred.promise;
                    };  
                    // save an object, passing in callback(err, obj) to process results
                    ret.saveObj = function(obj) { 
                        var err;
                          
                        var deferred = $q.defer();
                        if ( typeof obj === 'undefined' ) {
                            err = {};
                            err.message = "saveObj - error object undefined";
                            safeApply($rootScope, function() { deferred.reject(err);});
                        } else {
                            save(obj, function(err, obj){
                                if (err) {                    
                                    safeApply($rootScope, function() { deferred.reject(err); });
                                } else {
                                    safeApply($rootScope, function() { deferred.resolve(obj); });                 
                                }
                            });
                        }
                        return deferred.promise;
                    };  
                    // find an object by id and type, returning a promise
                    ret.getById = function(type, _id) { 
                        var deferred = $q.defer();
                        var err;
                        var obj = {apm_type:type,_id:_id};
                        validate.prettify = function(str) {
                              return str;
                            };
                        var constraints = {
                          apm_type: {presence: true, simple: true,
                                 inclusion: {
                                        within: getNew
                                 }
                          },
                          _id: {presence: true, simple: true}
                        };
                        err = validate(obj, constraints);
                        if (typeof err !== 'undefined') {
                            safeApply($rootScope, function() { deferred.reject(err);});
                        } else {
                            find(type, _id, function(err, obj){
                                if (err) {                    
                                    safeApply($rootScope, function() { deferred.reject(err);});
                                } else {
                                    safeApply($rootScope, function() { deferred.resolve(obj);});                 
                                }           
                            });
                        }
                        return deferred.promise;
                    };  
                    // find an object by name and type, returning a promise
                    ret.getByProperty = function(type, property, value) { 
                        var deferred = $q.defer();
                        var err;
                        var obj = {apm_type:type,value:value,property:property};
                        var constraints = {
                          apm_type: {presence: true, simple: true,
                                 inclusion: {
                                        within: getNew
                                 }
                             },
                           property: {presence: true, simple: true},
                           value: {presence: true, simple: true}
                        };
                        err = validate(obj, constraints);
                        if (typeof err !== 'undefined') {
                            safeApply($rootScope, function() { deferred.reject(err);});
                        } else {
                            findByProperty(type, property, value, function(err, obj){
                                if (err) {                    
                                    safeApply($rootScope, function() { deferred.reject(err);});
                                } else {
                                    safeApply($rootScope, function() { deferred.resolve(obj);});                 
                                }           
                            });
                        }
                        return deferred.promise;
                    }; 
                    // get re-hydrated objects by GQL where clause
                    ret.getByGql = function(where){
                        var deferred = $q.defer();
                        var err;
                        var obj = {select:"*",where:where};
                        var constraints = {
                           where: {presence: true, simple: true}
                        };
                        err = validate(obj, constraints);
                        if (typeof err !== 'undefined') {
                            safeApply($rootScope, function() { deferred.reject(err);});
                        } else {    
                            $db.gql(obj, function(err, result){
                                var objs = [];
                                if (err) {
                                    safeApply($rootScope, function() { deferred.reject(err);});
                                } else {
                                    result.rows.forEach(function(row) {
                                        if (row.apm_type !== '') {
                                            obj = fromPrototype(getNew[row.apm_type], row);
                                        } else {
                                            obj = row;
                                        }
                                        objs.push(obj);
                                    });
                                    safeApply($rootScope, function() { deferred.resolve(objs);});
                                }
                            });  
                        }
                        return deferred.promise;
                    }; 
                    // get anonymous objects by GQL given select and where clauses 
                    ret.Gql = function(select, where){
                        var deferred = $q.defer();
                        var err;
                        var obj = {select:"*",where:where};
                        var constraints = {
                           select: {presence: true, simple: true},
                           where: {presence: true, simple: true}
                        };
                        err = validate(obj, constraints);
                        if (typeof err !== 'undefined') {
                            safeApply($rootScope, function() { deferred.reject(err);});
                        } else {
                            
                            $db.gql(obj, function(err, result){
                                if(err){
                                    safeApply($rootScope, function() { deferred.reject(err);});
                                } else {
                                    safeApply($rootScope, function() { deferred.resolve(result);});                 
                                }
                            });  
                          }
                          return deferred.promise;
                    }; 
                    // delete an object, passing object, returns void
                    ret.deleteObj = function(obj) { 
                        var deferred = $q.defer();
                        var err;
                        var constraints = {
                          _id: {presence: true, simple: true},
                          _rev: {presence: true, simple: true}
                        };
                        err = validate({obj:obj},{obj: {presence: true}});
                        if (typeof err === 'undefined'){
                            err = validate(obj, constraints);
                        }
                        if (typeof err !== 'undefined') {
                            //console.log(err);
                            safeApply($rootScope, function() { deferred.reject(err);});
                        } else {
                            $db.remove(obj, function(err, response) {
                                if (err) {
                                    safeApply($rootScope, function() { deferred.reject(err);});
                                } else {
                                    safeApply($rootScope, function() { deferred.resolve(response);});
                                }
                            });  
                        }
                        return deferred.promise;
                    };  
                    // delete an object by _id, returns void
                    ret.deleteById = function(_id) { 
                        var deferred = $q.defer();
                        exists(_id, function(err,response){
                            if(!err) {
                                if (response !== null) {
                                    var obj = { _id: _id, _rev:'' };
                                    $db.remove(response, function(err, response) { 
                                        if (err) {
                                            safeApply($rootScope, function() { deferred.reject(err);});
                                        } else {
                                            safeApply($rootScope, function() { deferred.resolve(response);});
                                        }
                                    });  
                                } else {
                                    err = { status : 404, error : 'not_found', reason : 'missing' };
                                    safeApply($rootScope, function() { deferred.reject(err);});
                                }
                            } else {
                                safeApply($rootScope, function() { deferred.reject(err);});
                            }
                        });
                        return deferred.promise;
                    }; 
                    ret.setNew = this.setNew; 
                    ret.setInvalid = this.setInvalid; 

                    return ret;
    }];
        
});

})();
