angular
  .module('expanderDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $brExpander) {
    $scope.list = [
      {label: 'one'},
      {label: 'two'},
      {label: 'three'},
      {label: 'four'},
      {label: 'five'}
    ];


    $scope.isOpen = false;

    $scope.openFromService = function () {
      $brExpander('expanderConponentId').toggle()
    };
  });
