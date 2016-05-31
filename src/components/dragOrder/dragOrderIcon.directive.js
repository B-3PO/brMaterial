angular
  .module('brMaterial')
  .directive('brDragIcon', brDragIconDirective);


/**
 * @ngdoc directive
 * @name brDragIcon
 * @module dragOrder
 *
 * @description
 * The `<br-drag-icon>` is an element that goes in the repeated element, that will instantly initiate drag reorder on click and hold
 *
 * @usage
 * ### Controller
 * <hljs lang="js">
 * angular.controller('MyCtrl', function($scope) {
 *   $scope.users = [
 *     { ordinal: 1, name: 'Bob' },
 *     { ordinal: 2, name: 'Alice' },
 *     { ordinal: 3, name: 'Steve' }
 *   ];
 * });
 * </hljs>
 *
 * ### HTML
 * Append `<br-drag-icon>` to an element with `[br-drag-order]` to have a place to click
 * that will instantaneously trigger the dragging
 * <hljs lang="html">
 *  <div ng-repeat="item in list | orderBy:'item.ordinal'" br-drag-order="">
 *    <br-drag-icon></br-drag-icon>
 *    {{item}}
 *  </div>
 * </hljs>
 */
brDragIconDirective.$inject = ['$brGesture'];
function brDragIconDirective($brGesture) {
  var directive = {
    restrict: 'E',
    require: '^brDragOrder',
    replace: true,
    template: '<br-icon br-color="#999" class="br-drag-icon" br-font-icon="swap_vert" br-size="32"></br-icon>',
    link: link
  };
  return directive;


  function link(scope, element, attrs, ctrl) {
    $brGesture.register(element, 'press');
    element
      .on('$br.pressdown', onPressDown);

    function onPressDown (e) {
      ctrl.triggerHold();
    }
  }
}
