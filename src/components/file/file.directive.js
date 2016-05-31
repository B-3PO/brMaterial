/**
 * @ngdoc module
 * @name file
 */
angular
  .module('brMaterial')
  .directive('brFile', brFileDirective);


/**
 * @ngdoc directive
 * @name brFile
 * @module file
 *
 *
 * @description
 * The `<br-file>` is a button with a model that will set based on a picked file.
 * you can use the styling classes as a button
 *
 * @param {boolean=} br-show-label - show file name next to button
 * @param {string=} br-file-types - a comma deliminated string containg allowd extensions
 * @param {string=} br-file-name - Bound value that returns the filename
 * @param {model=} ng-model - `{@link https://docs.angularjs.org/api/ng/directive/ngModel Angular ngModel}`
 * @param {function=} ng-change - `{@link https://docs.angularjs.org/api/ng/directive/ngChange Angular ngChange}`
 * @param {boolean=} ng-disabled - `{@link https://docs.angularjs.org/api/ng/directive/ngChange Angular ngDisabled}`
 *
 * @usage
 * The `<br-file>` component can be treated the same as `<br-button>`
 *
 * #### Class Names
 * files can have all the main theme classes applied to them
 *  - `br-raised` - Adds backround to button
 *  - `br-primary` - Themes primary color
 *  - `br-accent` - Themes accent color
 *  - `br-warn` - Themes warn color
 *  - `br-circle` - Makes button a circle
 *  - `br-small` - Makes button a smaller circle
 *  - `br-fill` - Makes button stretch to the full width of its container
 *  - `br-shadow` - Add drop shadow to button
 *  - `br-no-radius` - Remove border radius
 *  - `br-no-padding` - Remove padding
 *  - `br-no-margin` - Remove margin
 *
 * <hljs lang="js">
 *   angular.controller('MyCtrl', function ($scope) {
 *     $scope.fileName = undefined;
 *     $scope.fileName = file;
 *     $scope.onFileSelect = function () {
 *      // file selected
 *     });
 *   });
 * </hljs>
 *
 * <hljs lang="html">
 * <br-file ng-model="file" ng-change="onFileSelect" br-file-types=".jpg,.png,.gif" br-file-name="fileName">
 *    Upload File
 *  </br-file>
 * </hljs>
 */
brFileDirective.$inject = ['$brUtil'];
function brFileDirective ($brUtil) {
  var directive = {
    restrict: 'E',
    require: '?ngModel',
    transclude: true,
    scope: {
      brFileName: '=',
      brShowLabel: '=',
      brFileTypes: '@',
      ngDisabled: '=?'
    },
    template: getTemplate,
    link: link
  };
  return directive;



  function getTemplate (tElement, tAttr) {
    return '<input type="file" class="ng-hide" accept="{{brFileTypes}}"/>'+
          '<br-button type="button" class="' + tAttr.class + '" ng-click="getImage()" ng-disabled="ngDisabled"><div ng-transclude></div></br-button>'+
          '<div flex class="br-file-label" ng-if="brShowLabel">{{fileName}}</div>';
  }


  function link (scope, element, attr, ngModelCtrl) {
    ngModelCtrl = ngModelCtrl || $brUtil.fakeNgModel();
    var input = angular.element(element.children()[0]);
    var theButton = angular.element(element.children()[1]);

    scope.getImage = function () {
      setTimeout(function(){
        // reset value or file change will not trigger after the first time
				input[0].value = '';
        input[0].click();
      }, 0);
    };

    input.on('change', function (event) {
      scope.brFileName = input.val().split('/').pop().split('\\').pop();
      scope.$apply();
      ngModelCtrl.$setViewValue(event.target.files, event && event.type);
    });


    scope.$on('destroy', function () {
      input.off('change');
    });
  }
}
