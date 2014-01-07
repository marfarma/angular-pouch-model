'use strict';

//Adjust body and .anchortarget so that navbar doesn't cover up anchor
//http://stackoverflow.com/questions/20691063/jquery-set-height-of-variable-height-navbar-for-body-and-class-used-on-anchors-s
$(window).on('resize load', function() {
    $('body').css({
        "padding-top": $(".navbar").height() + "px"
    });

    $('.anchortarget').css({
        "padding-top": $(".navbar").height() + "px"
    }, {
        "margin-top": $(".navbar").height() - "px"
    });

});
/*
 * DOMParser HTML extension
 * 2012-09-04
 * 
 * By Eli Grey, http://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*! @source https://gist.github.com/1129031 */
/*global document, DOMParser*/

(function(DOMParser) {
	"use strict";

	var
	  DOMParser_proto = DOMParser.prototype
	, real_parseFromString = DOMParser_proto.parseFromString
	;

	// Firefox/Opera/IE throw errors on unsupported types
	try {
		// WebKit returns null on unsupported types
		if ((new DOMParser).parseFromString("", "text/html")) {
			// text/html parsing is natively supported
			return;
		}
	} catch (ex) {}

	DOMParser_proto.parseFromString = function(markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			var
			  doc = document.implementation.createHTMLDocument("")
			;
	      		if (markup.toLowerCase().indexOf('<!doctype') > -1) {
        			doc.documentElement.innerHTML = markup;
      			}
      			else {
        			doc.body.innerHTML = markup;
      			}
			return doc;
		} else {
			return real_parseFromString.apply(this, arguments);
		}
	};
}(DOMParser));

var getElementByXpath = function (dom, path) {
    return dom.evaluate(path, dom, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};
angular.module('scrollto', []);

angular.module("ngScrollTo",[])
  .directive("scrollTo", ["$window", function($window){
    return {
      restrict : "AC",
      compile : function(){

        var document = $window.document;

        function scrollInto(idOrName) {
            //find element with the give id of name and scroll to the first element it finds
          if(!idOrName)
            $window.scrollTo(0, 0);
          //check if an element can be found with id attribute
          var el = document.getElementById(idOrName);
          if(!el) {//check if an element can be found with name attribute if there is no such id
            el = document.getElementsByName(idOrName);

            if(el && el.length)
              el = el[0];
            else
              el = null;
          }

          if(el) //if an element is found, scroll to the element
            el.scrollIntoView();
          //otherwise, ignore
        }

        return function(scope, element, attr) {
          element.bind("click", function(event){
            scrollInto(attr.scrollTo);
          });
        };
      }
    };
  }]);
 
var myApp = angular.module('myApp', ['ui.bootstrap','ngScrollTo']).
directive('navbar', ['$location', '$http',  function ($location, $http) {
    return {
        restrict: 'E',
        transclude: true,
        scope: { heading: '@'},
        controller: 'NavbarCtrl',
        templateUrl: 'navbar.html',
        replace: true,
        link: function ($scope, $element, $attrs, navbarCtrl) {
            
            var items = $scope.items = [];
            $scope.name = $scope.name || $attrs.name;
            $scope.user = $scope.user || $attrs.user;
            $scope.heading = $scope.heading || $attrs.heading;
            
            var itemsXpath = '//*[@id="global"]/div/div';
            var itemsUrl = 'http://'+ $scope.user + '.viewdocs.io/' + $scope.name + '/nav';
            $http.get(itemsUrl).success(function(data) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(data, "text/html");

                $scope.items = angular.fromJson(getElementByXpath(doc,itemsXpath).innerText);
                navbarCtrl.selectByUrl($location.absUrl());
            });
            
            $scope.$watch('$location.absUrl()', function (locationPath) {
                navbarCtrl.selectByUrl(locationPath)
            });
        }
    }
}]).
directive('sidebarNav', function($compile) {
  return {
    restrict: 'A',
    controller: 'SidebarnavCtrl',
    link: function ($scope, element) {
        var headers = element.find('h2');
        var index = 1;
        $scope.items = [];
        
        // create 'go to top' fragment
        var frag = document.createDocumentFragment();
        var html = '<small><a scroll-to="">(return to top)</a></small>';
        var holder = document.createElement("small")
        holder.innerHTML = html
        frag.appendChild(holder)
        
        angular.forEach(headers, function (header) {
            // add id and go to top link to each section header element
            header.id = "section" + index++;
            header.append(element.clone(frag));
            //$compile(header)($scope);
            
            var item = new Object();
            item.id = header.id;
            item.text = header.innerText;
            $scope.items.push(item);
        });
    }
  };
}).
directive('pageHeading', function($compile) {
  return {
    restrict: 'A',
    link: function ($scope, element) {

        var header = angular.element(document.querySelector('#global h1:first-of-type')); 
        var paragraph = angular.element(document.querySelector('#global p:first-of-type'));

        // copy elements & add to heading
        element.append(header);
        element.append(paragraph);
        
    }
  };
});

function SidebarnavCtrl($scope) {
    var items = $scope.items = $scope.$parent.items;
}
SidebarnavCtrl.$inject = ['$scope'];

function NavbarCtrl($scope, $timeout, $http, $location, $attrs) {
    $scope.items = $scope.items || [];
    
    this.select = $scope.select = function (item) {
        angular.forEach($scope.items, function (item) {
            item.selected = false;
        });
        item.selected = true;
    };

    this.selectByUrl = function (url) {
        angular.forEach($scope.items, function (item) {
            if ('http://'+ $scope.user + '.viewdocs.io/' + $scope.name + '/' + item.link === url) {
                $scope.select(item);
            }
        });
    };
}
NavbarCtrl.$inject = ['$scope', '$timeout','$http','$location','$attrs'];
