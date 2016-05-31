angular
  .module('spinnerDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $interval) {
    $scope.percent = 0;

    $interval(function() {
      $scope.percent += 1;
    }, 100, 100, true);
  });
