angular
  .module('listDemo3', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $brToast, $brDialog) {
    $scope.list = [
      {name: 'Donald Kimbal', phone: 'unlisted', age: 38, email: 'donald@nypd.com'},
      {name: 'Courtney Rawlinson', phone: 2125556342, age: 38, email: 'coutney@pierce&pierce.com'},
      {name: 'Patrick Bateman', phone: 2125556342, age: 38, email: 'paul@pierce&pierce.com'}
    ];

    $scope.edit = function (item) {
      $brToast.add({
        message: 'You Edited ' + item.name
      });
    };

    $scope.delete = function (item) {
      $brDialog.add({
        message: 'Delete ' + item.name + '?',
        controls: {
          cancelLabel: 'Cancel',
          continueLabel: 'Delete'
        },
        scope: {
          continue: function () {
            $brDialog.remove();
          }
        }
      });
    };
  });
