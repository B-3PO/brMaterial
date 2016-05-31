angular
  .module('docsApp')
  .directive('topBar', topBarDirective);



/**
 * @ngdoc directive
 * @name topBar
 *
 * @description
 * Top bar directive.
 * This goes outsisde of the view
 *
 * @example
 * <top-bar></top-bar>
 */
function topBarDirective() {
  var directive = {
    restrict: 'E',
    templateUrl: 'js/topBar/topBar.html',
    controller: ['$scope', '$brMedia', '$brSideContent', Controller],
    controllerAs: 'vm'
  };
  return directive;


  function Controller($scope, $brMedia, $brSideContent) {
    /* jshint validthis: true */
    var vm = this;

    vm.navOpen = false;
    vm.toggleNav = toggleNav;

    vm.hideNav = $brMedia('md');
    $scope.$watch(function () { return $brMedia('md'); }, function (data) {
      vm.hideNav = data;
    });

    vm.hideButtons = $brMedia('sm');
    $scope.$watch(function () { return $brMedia('sm'); }, function (data) {
      vm.hideButtons = data;
    });

    // this property is being watched to change the internal state when another controller/service toggles the side nav
    $scope.$watch(function () { return $brSideContent('navMenuSideContent').isOpen(); }, function (data) {
      vm.navOpen = data;
      if (data === true) {
        $brSideContent('navMenuSideContent').addBackdrop(function () {
          toggleNav();
        });
      } else {
        $brSideContent('navMenuSideContent').removeBackdrop();
      }
    });


    function toggleNav() {
      $brSideContent('navMenuSideContent').toggle();
    }
  }
}
