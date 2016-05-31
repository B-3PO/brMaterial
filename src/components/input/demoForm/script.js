angular
  .module('inputDemo2', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $brDialog) {
    $scope.nameModel = '';
    $scope.emailModel = '';
    $scope.phoneModel = '';

    $scope.clearForm = function () {
      $scope.nameModel = '';
      $scope.emailModel = '';
      $scope.phoneModel = '';
    };

    $scope.saveForm = function () {
      $brDialog.alert('Your data was Saved');
    };
  });
