angular
  .module('brMaterialApp')
  .controller('ExampleController', ExampleController);


ExampleController.$inject = ['$scope', '$window', '$brSideContent', '$brMedia', '$$rAF', '$document', 'example', '$brDialog'];
function ExampleController($scope, $window, $brSideContent, $brMedia, $$rAF, $document, example, $brDialog) {
  /* jshint validthis: true */
  var vm = this;
  vm.example = example;

  // this is not proper but is being used to be able to fit the example nav bar inside the ng view
  var adjustMenuSize = $$rAF.throttle(function () {
    $scope.$apply(function () {
      vm.pageHeight.height = ($window.innerHeight - 40) + 'px';
    });
  });
  vm.pageHeight = {
    height: ($window.innerHeight - 40) + 'px'
  };
  angular.element($window).on('resize', adjustMenuSize);



  // DONOT do this, the fixed footer will be turned into a directive. this is a quick fix for a demo
  vm.fixedFooterStyle = {
    left: '0'
  };

  setTimeout(function () {
    var pageContainer = angular.element($document)[0].body.querySelector('.page-container');
    vm.fixedFooterStyle.left = pageContainer.offsetLeft + 'px';
    $scope.$watch(function () { return pageContainer.offsetLeft; }, $$rAF.throttle(function (data) {
      vm.fixedFooterStyle.left = pageContainer.offsetLeft + 'px';
    }));
  }, 0);
  // --




  vm.toggleNav = toggleNav;
  vm.hideNav = $brMedia('md');
  $scope.$watch(function () { return $brMedia('md'); }, function (data) {
    vm.hideNav = data;
  });


  vm.navOpen = false;
  function toggleNav() {
    $brSideContent('navSideContent').toggle();

    vm.navOpen = $brSideContent('navSideContent').isOpen();
  }





  // --- table -----

  vm.tableData = [
    {first: 'Paul', last: 'Allen', phone: 2125556342, age: 38, email: 'paul@pierce&pierce.com'},
    {first: 'Evelyn', last: 'Williams', phone: 2125556342, age: 38, email: 'evelyn@pierce&pierce.com'},
    {first: 'Timothy', last: 'Bryce', phone: 2125556342, age: 38, email: 'timothy@pierce&pierce.com'},
    {first: 'Luis', last: 'Carruthers', phone: 2125556342, age: 38, email: 'luis@pierce&pierce.com'},
    {first: 'David', last: 'Van-Patten', phone: 2125556342, age: 38, email: 'david@pierce&pierce.com'},
    {first: 'Craig', last: 'McDermott', phone: 2125556342, age: 38, email: 'craig@pierce&pierce.com'},
    {first: 'Marcus', last: 'Halberstram', phone: 2125556342, age: 38, email: 'marcus@pierce&pierce.com'},
    {first: 'Donald', last: 'Kimbal', phone: 'unlisted', age: 38, email: 'donald@nypd.com'},
    {first: 'Courtney', last: 'Rawlinson', phone: 2125556342, age: 38, email: 'coutney@pierce&pierce.com'},
    {first: 'Patrick', last: 'Bateman', phone: 2125556342, age: 38, email: 'paul@pierce&pierce.com'}
  ];

  vm.addPerson = function (ev) {
    $brDialog.add({
      maxWidth: 520,
      templateUrl: 'partials/addPerson.html',
      targetEvent: ev,
      scope: {
        person: {
          first: '',
          last: '',
          phone: null,
          age: null,
          email: ''
        },

        complete: function (person) {
          vm.tableData.push(person);
          $brDialog.remove();
        }
      }
    });
  };


  vm.selectPerson = function (person) {
    vm.selectedPerson = person;
    $brSideContent('peopleSideContent').open();
    $brSideContent('peopleSideContent').addBackdrop(function () {
      vm.cancelEdit();
    });
  };

  vm.cancelEdit = function () {
    $brDialog.add({
      message: 'Are you done Editing?',
      controls: true,
      scope: {
        cancel: exitEdit,
        continue: exitEdit
      },
      callback: function (done) {
        console.log(done);
      }
    });
  };

  function exitEdit() {
    $brSideContent('peopleSideContent').removeBackdrop();
    $brSideContent('peopleSideContent').close();
    vm.selectedPerson = undefined;
  }
}
