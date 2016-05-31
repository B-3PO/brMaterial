angular
  .module('listDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope) {
    $scope.list = [
      {name: 'Paul Allen', phone: 2125556342, age: 38, email: 'paul@pierce&pierce.com'},
      {name: 'Evelyn Williams', phone: 2125556342, age: 38, email: 'evelyn@pierce&pierce.com'},
      {name: 'Timothy Bryce', phone: 2125556342, age: 38, email: 'timothy@pierce&pierce.com'}
    ];
  });
