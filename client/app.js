angular
  .module('brMaterialApp',[
    'ngRoute',
    'ngAnimate',
    'brMaterial'
  ])
  .config(configApp);



configApp.$inject = ['$routeProvider', '$brThemeProvider'];
function configApp($routeProvider, $brThemeProvider) {

  // $brThemeProvider.definePalette('default', {
  //   background: '#110010',
  //   overlay: 'rgba(0,0,0,0.4)',
  //   font: '#DDD',
  //   dialogBackground: '#49434F'
  // });

  $routeProvider.
  when('/',{
    templateUrl: 'partials/home.html',
    controller: 'HomeController',
    controllerAs: 'vm'
  }).
  when('/example',{
    templateUrl: 'partials/example.html',
    controller: 'ExampleController',
    controllerAs: 'vm',
    resolve: {
      example: ['$route', function ($route) {
        return $route.current.params.v || '1';
      }]
    }
  }).
  otherwise({
    redirectTo: '/'
  });
}
