angular
  .module('brMaterial')
  .directive('brSubheader', brSubheaderDirective);



/**
  * @name brSubheader
  * @module brSubheader
  *
  *
  * @description
  * <br-subheader> are sticky headers, they will only be sticky inside of a <br-content> element
  *
  *
  * @example
  * <br-subheader>
  *    // Put stuff here
  * </br-subheader>
  *
  */

brSubheaderDirective.$inject = ['$brTheme', '$compile', '$brSticky'];
function brSubheaderDirective ($brTheme, $compile, $brSticky) {
  var directive = {
    restrict: 'E',
    replace: true,
    transclude: true,
    template:
      '<div class="br-subheader">' +
        '<div class="br-subheader-inner">' +
          '<span class="br-subheader-content"></span>' +
        '</div>' +
      '</div>',
    compile: compile
  };
  return directive;

  function compile (tElement, tAttr, transclude) {
    return function postLink (scope, element, attrs) {
      $brTheme(element);

      var outerHTML = element[0].outerHTML;
      function getContent (el) {
        return angular.element(el[0].querySelector('.br-subheader-content'));
      }

      transclude(scope, function (clone) {
        getContent(element).append(clone);
      });


      scope.$watch(function () { return element.attr('br-no-sticky'); }, function (data) {
        if (data !== undefined) {
          removeSticky();
        } else {
          addSticky();
        }
      });


      function removeSticky() {
        scope.$broadcast('$removeSticky');
      }

      function addSticky() {
        transclude(scope, function(clone) {
          var stickyClone = $compile(angular.element(outerHTML))(scope);
          getContent(stickyClone).append(clone);
          $brSticky(scope, element, stickyClone, attrs.brHorizontalScroll !== undefined);
        });
      }
    };
  }
}
