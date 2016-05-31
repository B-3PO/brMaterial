angular
  .module('selectDemo1', ['brMaterial'])
  .controller('AppCtrl', function ($scope, $brDialog) {
    $scope.selected = undefined;
    $scope.groupSelected = undefined;
    $scope.menuSelected = undefined;
    $scope.menuGroupSelected = undefined;

    $scope.seletChange = function () {
      $brDialog.alert('You Selected "' + $scope.selected.name + '"');
    };

    $scope.menuSeletChange = function () {
      $brDialog.alert('You Selected "' + $scope.menuSelected.name + '"');
    };

    $scope.selectList = [
      {name: 'Paul Allen', phone: 2125556342, age: 38, email: 'paul@pierce&pierce.com'},
      {name: 'Evelyn Williams', phone: 2125556342, age: 38, email: 'evelyn@pierce&pierce.com'},
      {name: 'Timothy Bryce', phone: 2125556342, age: 32, email: 'timothy@pierce&pierce.com'},
      {name: 'Luis Carruthers', phone: 2125556342, age: 32, email: 'luis@pierce&pierce.com'},
      {name: 'David Van-Patten', phone: 2125556342, age: 42, email: 'david@pierce&pierce.com'},
      {name: 'Craig McDermott', phone: 2125556342, age: 42, email: 'craig@pierce&pierce.com'},
      {name: 'Marcus Halberstram', phone: 2125556342, age: 27, email: 'marcus@pierce&pierce.com'},
      {name: 'Donald Kimbal', phone: 'unlisted', age: 327, email: 'donald@nypd.com'},
      {name: 'Courtney Rawlinson', phone: 2125556342, age: 42, email: 'coutney@pierce&pierce.com'},
      {name: 'Patrick Bateman', phone: 2125556342, age: 42, email: 'paul@pierce&pierce.com'}
    ];

    $scope.selectListGrouped = [
      {
        label: 'Executives',
        people: [
          {name: 'Paul Allen', phone: 2125556342, age: 38, email: 'paul@pierce&pierce.com'},
          {name: 'Evelyn Williams', phone: 2125556342, age: 38, email: 'evelyn@pierce&pierce.com'}
        ]
      },
      {
        label: 'Associates',
        people: [
          {name: 'Timothy Bryce', phone: 2125556342, age: 32, email: 'timothy@pierce&pierce.com'},
          {name: 'Luis Carruthers', phone: 2125556342, age: 32, email: 'luis@pierce&pierce.com'},
          {name: 'David Van-Patten', phone: 2125556342, age: 42, email: 'david@pierce&pierce.com'}
        ]
      },
      {
        label: 'Pawns',
        people: [
          {name: 'Craig McDermott', phone: 2125556342, age: 42, email: 'craig@pierce&pierce.com'},
          {name: 'Marcus Halberstram', phone: 2125556342, age: 27, email: 'marcus@pierce&pierce.com'},
          {name: 'Donald Kimbal', phone: 'unlisted', age: 327, email: 'donald@nypd.com'}
        ]
      },
      {
        label: 'Other',
        people: [
          {name: 'Courtney Rawlinson', phone: 2125556342, age: 42, email: 'coutney@pierce&pierce.com'},
          {name: 'Patrick Bateman', phone: 2125556342, age: 42, email: 'paul@pierce&pierce.com'}
        ]
      }
    ];
  });
