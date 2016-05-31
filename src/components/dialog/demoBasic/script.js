angular
  .module('dialogDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $brDialog) {

    $scope.openBasic = function () {
      $brDialog.add({
        message: 'This is a basic dialog',
        controls: true,
        scope: {
          continue: function () {
            $brDialog.remove();
          }
        }
      });
    };

    $scope.openMobile = function () {
      $brDialog.add({
        message: 'This is a basic dialog with mobile fill',
        mobileFill: true,
        controls: {
          continueLabel: 'OK',
          cancelLabel: 'Close'
        },
        scope: {
          continue: function () {
            $brDialog.remove();
          }
        }
      });
    };

    $scope.openTemplated = function () {
      $brDialog.add({
        templateUrl: 'demo-partials/dialog/demoBasic/template.html',
        mobileFill: true,
        locals: {inputText: 'The text you inputed'},
        controller: 'DialogController',
        controllerAs: 'vm'
      });
    };

    $scope.openAlert = function () {
      $brDialog.alert('This is an alert');
    };
  })
  .controller('DialogController', function (inputText, $brDialog) {
    var vm = this;

    vm.text = inputText;
    vm.list = [
      {label: 'One'},
      {label: 'Two'},
      {label: 'Three'},
      {label: 'Fuur'}
    ];

    vm.cancel = cancel;
    vm.continue = continueFun;

    function cancel() {
      $brDialog.remove();
    }

    function continueFun() {
      $brDialog.remove();
    }
  });
