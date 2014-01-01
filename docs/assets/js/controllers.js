'use strict';

function NavbarCtrl($scope, $timeout) {
    $scope.statusCluster = {};
    $scope.configureServerUrl = false;

    var items = $scope.items = [
        {title: 'Dashboard', link: 'dashboard'},
        {title: 'Search', link: 'search'},
        {title: 'Queries', link: 'query'},
        {title: 'Graphs', link: 'graph'},
        {title: 'About', link: 'about'}
    ];

    this.select = $scope.select = function (item) {
        angular.forEach(items, function (item) {
            item.selected = false;
        });
        item.selected = true;
    };

    this.selectByUrl = function (url) {
        angular.forEach(items, function (item) {
            if ('/' + item.link === url) {
                $scope.select(item);
            }
        });
    };

    $scope.changeServerUrl = function () {
        return false;
    };

}
NavbarCtrl.$inject = ['$scope', '$timeout'];

