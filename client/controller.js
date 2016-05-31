angular
  .module('brMaterialApp')
  .controller('HomeController', HomeController);


HomeController.$inject = ['$scope', '$brDialog', '$timeout', '$brToast', '$brExpansionCard', '$brExpansionCardManager'];
function HomeController($scope, $brDialog, $timeout, $brToast, $brExpansionCard, $brExpansionCardManager) {
  var vm = this;
  var registry

  vm.autocomplete = '';
  vm.correspondence = [
    {
      name: "Geoff's Fun Time Land Inc.",
      card: 'organizationEdit',
      locals: {organizationId: "994c89a2-73cd-4b5a-9850-de497d3dcb97"}
    },
    {
      name: "Two Two",
      card: 'organizationEdit',
      locals: {organizationId: "3df5e1c9-c52b-4502-8d2a-4a19d37067a7"}
    },
    {
      name: "Knoxville Civic Coliseum",
      card: 'organizationEdit',
      locals: {organizationId: "615ff2f7-00b4-48be-be38-4a6bebec3fa6"}
    },
    {
      name: "KJ Coliseum",
      card: 'organizationEdit',
      locals: {organizationId: "4f8324b2-b84a-4e57-a770-e0059fa710dd"}
    },
    {
      name: "Xfinity Arena - Everett",
      card: 'organizationEdit',
      locals: {organizationId: "c9d55755-5514-4bb8-9073-472e160980fc"}
    },
    {
      name: "Bojangles' Coliseum ",
      card: 'organizationEdit',
      locals: {organizationId: "29347930-6e84-40e2-8b1e-6f44c8bdba4e"}
    },
    {
      name: "BancorpSouth Arena",
      card: 'organizationEdit',
      locals: {organizationId: "1bb74cc2-fe2f-4d40-ba62-361e546df7a1"}
    },
    {
      name: "Ben's Palace of Love",
      card: 'organizationEdit',
      locals: {organizationId: "5f97b489-a91b-4211-a8ae-d2c82cf2fa34"}
    },
    {
      name: "Venue: Venue: sdfjlsdkf",
      card: 'venueEdit',
      locals: {venueId: "528d6657-6c7d-4b41-908b-a20776ed0606"}
    },
    {
      name: "Venue: Creation Swap 2",
      card: 'venueEdit',
      locals: {venueId: "c5042955-2300-4053-ad3e-152f57aa9318"}
    },
    {
      name: "Venue: Geoffs Venue",
      card: 'venueEdit',
      locals: {venueId: "b0a21614-7a6c-4eb6-9b03-20ac90f2994e"}
    },
    {
      name: "Venue: card add 2",
      card: 'venueEdit',
      locals: {venueId: "119c078a-0970-457e-8ece-94fa13bdefc8"}
    },
    {
      name: "Venue: Xfinity Arena - Everett",
      card: 'venueEdit',
      locals: {venueId: "29897d31-d2d5-4134-b89f-e20b3497e352"}
    },
    {
      name: "Venue: Web Ven",
      card: 'venueEdit',
      locals: {venueId: "3f73ed7a-89e5-41ce-a615-7e2348cecf4f"}
    },
    {
      name: "Venue: Bojangles' Coliseum",
      card: 'venueEdit',
      locals: {venueId: "471c7744-bc77-43cb-81bb-b36aa7da8ca9"}
    },
    {
      name: "Venue: BancorpSouth Arena",
      card: 'venueEdit',
      locals: {venueId: "7d065aac-5870-40dd-b712-f9ead8f7a64c"}
    }
  ];

  vm.autoSelected = undefined;
  vm.autoSelectChange = function () {
    console.log(vm.autoSelected);
  };

  vm.autoSelect = function (data) {
    console.log(data);
  };

  $timeout(function () {
    // $brExpansionCardManager('cardmanager').removeAll();
    // console.log($brExpansionCardManager('cardmanager').registry());
  }, 3000);

  $brExpansionCardManager().waitFor('cardmanager').then(function (instance) {
    console.log(instance);
    instance.register({
      componentId: 'testcard',
      templateUrl: 'partials/expansion.html',
      controller: function ($scope, id) {
        var vm = this;
        console.log('id', id);

        $scope.$on('$destroy', function () {
          console.log('ok')
        });

        vm.loadingLocation = loadingLocation;
        $timeout(function () {
          loadingLocation = false;
          vm.loadingLocation = false;
        }, 500);

        vm.location = location;
        vm.openMenu = function (menu) {
          $brExpansionCard.add({
            templateUrl: 'partials/menuExp.html',
            parent: document.body.querySelector('[br-component-id=cardmanager]'),
            controller: function () {
              var vm = this;

              vm.menu = menu;
            },
            controllerAs: 'vm'
          }).then(function (componet) {

          });
        };
      },
      controllerAs: 'vm'
    });

    // $timeout(function () {
    //   instance.add('testcard', {id: '1'}).then(function (card) {
    //     console.log(card);
    //   });
    //
    //   $timeout(function () {
    //     instance.remove('testcard');
    //   }, 2000);
    // }, 1500);
  });

  vm.venue = {
    name: 'Bypass World Headquaters',
    city: 'Austin',
    state: 'Tx',
    phone: '215-333-444',
    email: 'bypass@bypassmobile.com',
    active: true,

    locations: [
      {
        name: 'Smash Burger 1',
        city: 'Philadelphia',
        state: 'Pa',
        phone: '215-333-444',
        email: 'smash@buger.com',
        active: true,

        menus: [
          {
            name: 'Main Menu',
            items: [
              {
                name: 'Burger',
                price: '11.00'
              },
              {
                name: 'Fries',
                price: '4.00'
              },
              {
                name: 'Shake',
                price: '6.00'
              }
            ]
          },
          {
            name: 'Friday Menu',
            items: [
              {
                name: 'Burger',
                price: '11.00'
              },
              {
                name: 'Fries',
                price: '4.00'
              },
              {
                name: 'Shake',
                price: '6.00'
              }
            ]
          }
        ]
      },
      {
        name: 'Smash Burger 2',
        city: 'San Francisco',
        state: 'Ca',
        phone: '215-333-444',
        email: 'smash@buger.com',
        active: true,
        menus: [
          {
            name: 'Main Menu',
            items: [
              {
                name: 'Burger',
                price: '11.00'
              },
              {
                name: 'Fries',
                price: '4.00'
              },
              {
                name: 'Shake',
                price: '6.00'
              }
            ]
          },
          {
            name: 'Friday Menu',
            items: [
              {
                name: 'Burger',
                price: '11.00'
              },
              {
                name: 'Fries',
                price: '4.00'
              },
              {
                name: 'Shake',
                price: '6.00'
              }
            ]
          }
        ]
      }
    ]
  }

  var loadingLocation = true;
  vm.loadingVenue = true;
  $timeout(function () {
    vm.loadingVenue = false;
  }, 500);

  vm.openLocation = function (location) {
    $brExpansionCard.add({
      templateUrl: 'partials/expansion.html',
      parent: document.body.querySelector('[br-component-id=cardmanager]'),
      controller: function ($scope) {
        var vm = this;

        $scope.$on('$destroy', function () {
          console.log('ok')
        });

        vm.loadingLocation = loadingLocation;
        $timeout(function () {
          loadingLocation = false;
          vm.loadingLocation = false;
        }, 2500);

        vm.location = location;
        vm.openMenu = function (menu) {
          $brExpansionCard.add({
            templateUrl: 'partials/menuExp.html',
            parent: document.body.querySelector('[br-component-id=cardmanager]'),
            controller: function () {
              var vm = this;

              vm.menu = menu;
            },
            controllerAs: 'vm'
          }).then(function (componet) {

          });
        };
      },
      controllerAs: 'vm'
    }).then(function (componet) {
    });
  };


  // $brToast.add({
  //   message: 'Hello World',
  //   accent: true
  //   // positionMode: 'right bottom'
  // });
  //
  // $brToast.add({
  //   message: 'Hello World number 2',
  //   primary: true
  //   // positionMode: 'right bottom'
  // });


  vm.tableData = [
    {name: 'Ben Rubin', email: 'ben@ben.com', phone: '2152345678', order:10, jobs: ['Paper Boy', 'Human', 'Turtle Surfer', 'The Dude']},
    {name: 'Number Longer One', email: 'one@one.com', phone: '2152345678', order:1, test: [{name: 'ben'}]},
    {name: 'Number Longer One', email: 'one@one.com', phone: '2152345678', order:1, test: [{name: 'tt'},{name: 'ben'}]},
    {name: 'Number Two', email: 'two@two.com', phone: '2152345678', order:2},
    {name: 'Number three', email: 'three@three.com', phone: '2152345678', order:3},
    {name: 'Number four', email: 'four@four.com', phone: '2152345678', order:4},
    {name: 'Number five', email: 'five@five.com', phone: '2152345678', order:5},
    {name: 'Ben Rubin', email: 'ben@ben.com', phone: '2152345678', order:10},
    {name: 'Number Longer One', email: 'one@one.com', phone: '2152345678', order:1},
    {name: 'Number Two', email: 'two@two.com', phone: '2152345678', order:2},
    {name: 'Number three', email: 'three@three.com', phone: '2152345678', order:3},
    {name: 'Number four', email: 'four@four.com', phone: '2152345678', order:4},
    {name: 'Number five', email: 'five@five.com', phone: '2152345678', order:5}
  ];

  vm.tableFilter = {
    name: '',
    // jobs: 'Human',
    // test: {
    //   name: 'ben'
    // }
  };




  vm.listList = [
    {name: 'Ben Rubin', email: 'ben@ben.com', phone: '2152345678', order:10},
    {name: 'Number Longer One', email: 'one@one.com', phone: '2152345678', order:1},
    {name: 'Number Two', email: 'two@two.com', phone: '2152345678', order:2},
    {name: 'Number three', email: 'three@three.com', phone: '2152345678', order:3},
    {name: 'Number four', email: 'four@four.com', phone: '2152345678', order:4},
    {name: 'Number five', email: 'five@five.com', phone: '2152345678', order:5}
  ];
  vm.listSelected = [1,10];

  vm.advancedSelected = undefined;
  vm.advancedSeletChange = function (data) {
    console.log(vm.advancedSelected);
    // vm.advancedSelected = undefined;
  };

  vm.selectButtonTest = function () {
    console.log('ok');
  };


  vm.toggleSelect = false;
  $timeout(function () {
    vm.toggleSelect = true;
  }, 2000);


  vm.expanderList = [0,1,2,3];
  $timeout(function () {
    $scope.$apply(function () {
      vm.expanderList.push(5);
    });
  }, 5000);

  vm.spinnerPercentage = 0;
  vm.selectOptions = [
    {id: 0, name: 'Ben'},
    {id: 1, name: 'Geoff'},
    {id: 2, name: 'Jonathan'},
    {id: 3, name: 'Wyatt'},
    {id: 4, name: 'Nate'},
    {id: 5, name: 'Tori'},
    {id: 6, name: 'Zaphod'}
  ];

  $timeout(function () {
    vm.selectOptions.push({id: 7, name: 'what'});
  }, 1000);

  // vm.selectModel = vm.selectOptions[0].id;

  vm.popDialog = popDialog;
  vm.popAlert = popAlert;
  vm.popTemplatedDialog = popTemplatedDialog;
  vm.menuClick = menuClick;

  percentTimer();


  function percentTimer() {
    $timeout(function () {
      vm.spinnerPercentage++;
      if (vm.spinnerPercentage < 100) { percentTimer(); }
    }, 120);
  }


  function popDialog(ev) {
    $brDialog.add({
      message: 'Hey Hey, you chould close this',
      targetEvent: ev,
      controls: {
        continueLabel: 'Continue',
        cancelLabel: 'Close'
      },
      scope: {
        cancel: function () {
          $brDialog.alert({message: 'You cancelled'});
        },
        continue: function () {
          $brDialog.lock();

          $timeout(function () {
            $brDialog.unlock();
          }, 3000);
        }
      }
    });
  }

  function popAlert() {
    $brDialog.alert({message: 'This is an alert!'});
  }



  function popTemplatedDialog() {
    $brDialog.add({
      // width: '100%',
      // maxWidth: 600,
      mobileFill: true,
      template: '<div style="padding: 20px; margin-bottom: 1100px;"> Hello Hello world world test test </div>',
      controller: controller
    }).then(function () {
      console.log('dialog Added');
    });


    function controller() {
      /*jshint validthis:true */
      var vm = this;

      vm.title = 'Template Dialog';
      vm.closeDialog = closeDialog;


      function closeDialog () {
        $brDialog
          .remove()
          .then(function () {
            console.log('dialog removed');
          });
      }
    }
  }


  function menuClick () {
    console.log('Menu Click');
  }

}
