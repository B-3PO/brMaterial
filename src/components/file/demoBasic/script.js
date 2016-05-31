angular
  .module('fileDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $brDialog) {
    $scope.filename = undefined;
    $scope.selectedFile = undefined;

    $scope.onFileSelect = function () {
      $brDialog.alert('You selected file "' + $scope.filename + '"');
    }


    $scope.onImageSelect = function () {
      readFile();
    }


    function readFile() {
      var reader = new FileReader();
      reader.onload = function (event) {
        $scope.loadedImage = event.target.result;
        $scope.$apply();
      };
      reader.readAsDataURL($scope.selectedFile[0]);
    }
  });
