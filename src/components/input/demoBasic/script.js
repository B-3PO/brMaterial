angular
  .module('inputDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope) {
    $scope.withLabelModel = 'Text';
    $scope.withPlaceholderModel = '';
    $scope.errorModel = '';
    $scope.errorModel2 = '';
    $scope.withBothModel = '';
  });
