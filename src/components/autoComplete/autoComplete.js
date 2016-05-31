/**
 * @ngdoc module
 * @name autocomplete
 */
angular
  .module('brMaterial')
  .directive('brAutocomplete', autocompleteDirective);




  /**
   * @ngdoc directive
   * @name brAutocomplete
   * @module autocomplete
   *
   * @description
   * The `<br-autocomplete>` can be placed inside of `<br-input>` and given a data set to displaya autocomplete list
   *
   * @param {array|object} br-data - data used to search through
   * @param {string} br-label - If `[br-data]` is an object you can pass in the property name to use as the display label. Otherwise the entire item will be displayed. If you pass in an array of strings you can ignore this attribute
   * @param {string|object} br-filter - The value used to filter `[br-data]`. See `{@link https://docs.angularjs.org/api/ng/filter/filter Angular Filer}` for how/what you can pass in.
   * @param {model=} ng-model - `{@link https://docs.angularjs.org/api/ng/directive/ngModel Angular ngModel}`
   * @param {function=} ng-change - `{@link https://docs.angularjs.org/api/ng/directive/ngChange Angular ngChange}`
   *
   * @usage
   * ### Controller
   * <hljs lang="js">
   * angular.controller(function ($scope) {
   *  $scope.correspondence = [
   *    {
   *      label: 'Ben',
   *      searchTerms: ['Programer', 'Human', 'Not a Robot']
   *    },
   *    {
   *      label: 'Susan',
   *      searchTerms: ['Service Manager', 'Cat']
   *    },
   *    {
   *      label: 'Steve',
   *      searchTerms: ['Bens are Better', 'Not Ben']
   *    }
   *  ];
   *
   *  $scope.autoSelectChange = function () {
   *    console.log($scope.autoSelected);
   *  };
   * });
   * </hljs>
   *
   * ### HTML
   * <hljs lang="html">
   * <br-input>
   *  <input ng-model="inputText" placeholder="Search..." br-x />
   *  <br-autocomplete br-data="correspondence" br-label="label" br-filter="inputText" ng-model="autoSelected" ng-change="autoSelectChange()"></br-autocomplete>
   * </br-input>
   * </hljs>
   */
autocompleteDirective.$inject = ['$brTheme', '$parse', '$filter', '$timeout', '$brUtil'];
function autocompleteDirective($brTheme, $parse, $filter, $timeout, $brUtil) {
  var directive = {
    restrict: 'E',
    require: '?ngModel',
    scope: {
      brData: '=',
      brFilter: '='
    },
    template: '<div class="br-autocomplete-container" ng-if="_show" layout="column">'+
      '<div class="br-autocomplete-repeater" ng-repeat="item in _data" ng-click="triggerClick(item)">'+
        '{{item.name}}'+
      '</div>'+
    '</div>',
    link: link
  };
  return directive;



  function link (scope, element, attrs, ctrls) {
    $brTheme(element);

    var ngModelCtrl = ctrls || $brUtil.fakeNgModel();
    var input = angular.element(element.parent().find('input')[0]);
    var filterBy = $filter('filter');
    var rawData = [];
    var filterData = '';

    scope._show = false;

    // TODO look into switching ng click to a directive to reduce watchers
    scope.triggerClick = function (item) {
      ngModelCtrl.$setViewValue(item);
      ngModelCtrl.$render();
    };

    scope.$watch(function () {
      return scope.brData;
    }, function (data) {
      rawData = data;
      filterRaw();
    }, true);


    scope.$watch(function () {
      return scope.brFilter;
    }, function (data) {
      filterData = data;
      filterRaw();
    }, true);

    input
      .on('focus', show)
      .on('blur', hide);

    scope.$on('$destroy', function () {
      input
        .off('focus', show)
        .off('blur', hide);
    });


    function show() {
      scope.$apply(function () {
        scope._show = true;
      });
    }

    function hide() {
      $timeout(function () {
        scope._show = false;
      }, 200);
    }

    function filterRaw() {
      scope._data = filterBy(rawData, filterData);
    }
  }
}
