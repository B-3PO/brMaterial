angular
  .module('switchDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope) {
    $scope.switch1 = true;
    $scope.switch2 = false;
    $scope.switch3 = true;
    $scope.switch4 = false;
  });
