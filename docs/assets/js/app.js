'use strict';

// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', ['myApp.directives', 'ui.bootstrap']);
myApp.config(['$locationProvider', function AppConfig($locationProvider) {

    // enable html5Mode for pushstate ('#'-less URLs)
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

}]);
