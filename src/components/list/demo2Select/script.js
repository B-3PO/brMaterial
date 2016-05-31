angular
  .module('listDemo2', ['brMaterial'])
  .controller('AppCtrl', function ($scope) {
    $scope.toggleSelect = true;
    $scope.list = [
      {name: 'Marcus Halberstram', phone: 2125556342, age: 38, email: 'marcus@pierce&pierce.com'},
      {name: 'Luis Carruthers', phone: 2125556342, age: 38, email: 'luis@pierce&pierce.com'},
      {name: 'David Van-Patten', phone: 2125556342, age: 38, email: 'david@pierce&pierce.com'},
      {name: 'Craig McDermott', phone: 2125556342, age: 38, email: 'craig@pierce&pierce.com'}
    ];

    $scope.selected = [$scope.list[0]];
    $scope.selected2 = undefined;
  });
