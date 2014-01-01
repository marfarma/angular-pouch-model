'use strict';

/* Directives */


angular.module('myApp.directives', []).
        directive('appVersion', ['version', function (version) {
            return function (scope, elm, attrs) {
                elm.text(version);
            };
        }]).
        directive('navbar', ['$location', function ($location) {
            return {
                restrict: 'E',
                transclude: true,
                scope: {heading: '@'},
                controller: 'NavbarCtrl',
                template: '<div xmlns="http://www.w3.org/1999/html">
    <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#">{{heading}}</a>
        </div>
        <div class="collapse navbar-collapse" id="navbar-collapse">
            <ul class="nav navbar-nav">
                <li ng-repeat="item in items" ng-class="{active: item.selected}">
                    <a href="#/{{item.link}}">{{item.title}}</a>
                </li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li><a class="btn btn-lg glyphicon glyphicon-cog" ng-click="configureServerUrl = !configureServerUrl"></a></li>
                <li><p class="navbar-text"><span class="text-{{statusCluster.state}}">{{statusCluster.message}}</span></p></li>
            </ul>
          </div>
    </nav>
    <div class="row" ng-show="configureServerUrl">
        <div class="col-md-11">
            <div class="pull-right">
                <form class="form-horizontal" ng-submit="changeServerUrl()" name="changeServer">
                    <input type="url" ng-model="serverUrl" autofocus="true"/>
                    <button class="btn" type="submit">Change</button>
                </form>
            </div>
        </div>
    </div>
</div>',
                replace: true,
                link: function ($scope, $element, $attrs, navbarCtrl) {
                    $scope.$location = $location;
                    $scope.$watch('$location.path()', function (locationPath) {
                        navbarCtrl.selectByUrl(locationPath)
                    });
                }
            }
        }]).
        directive('ngConfirmClick', [
            function () {
                return {
                    link: function (scope, element, attr) {
                        var msg = attr.ngConfirmClick || "Are you sure?";
                        var clickAction = attr.confirmedClick;
                        element.bind('click', function (event) {
                            if (window.confirm(msg)) {
                                scope.$eval(clickAction)
                            }
                        });
                    }
                }
            }
        ]);

