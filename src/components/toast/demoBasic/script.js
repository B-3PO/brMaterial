angular
  .module('toastDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $brToast) {

    $scope.open = function () {
      $brToast.add({
        message: 'This is Toast, Hello :)',
        primary: true
      });
    };

    $scope.openTL = function () {
      $brToast.add({
        message: 'Top left toast',
        positionMode: 'left top',
        accent: true
      });
    };

    $scope.openTR = function () {
      $brToast.add({
        message: 'Top right toast',
        positionMode: 'right top'
      });
    };

    $scope.openBR = function () {
      $brToast.add({
        message: 'Bottom right toast',
        positionMode: 'right bottom',
        warn: true,
        delay: 4000
      });
    };
  });
