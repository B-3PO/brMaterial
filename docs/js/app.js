angular
  .module('docsApp', ['ngRoute', 'ngMessages', 'brMaterial'])
  .config(configApp)
  .controller('ComponentDocCtrl', ComponentDocCtrl)
  .controller('DemoCtrl', DemoCtrl);




configApp.$inject = ['$locationProvider', '$routeProvider', 'DEMOS', 'COMPONENTS'];
function configApp($locationProvider, $routeProvider, DEMOS, COMPONENTS) {
  // $locationProvider.html5Mode(true);

  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.tmpl.html'
    })
    .when('/demo/', {
      redirectTo: DEMOS[0].url
    })
    .when('/api/', {
      redirectTo: COMPONENTS[0].docs[0].url
    });

  COMPONENTS.forEach(function(component) {
    component.docs.forEach(function(doc) {
      $routeProvider.when('/' + doc.url, {
        templateUrl: doc.outputPath,
        resolve: {
          component: function() { return component; },
          doc: function() { return doc; }
        },
        controller: 'ComponentDocCtrl'
      });
    });
  });


  DEMOS.forEach(function(componentDemos) {
    var demoComponent;

    COMPONENTS.forEach(function(component) {
      if (componentDemos.moduleName === component.name) {
        demoComponent = component;
        component.demoUrl = componentDemos.url;
      }
    });

    demoComponent = demoComponent || angular.extend({}, componentDemos);
    $routeProvider.when('/' + componentDemos.url, {
      templateUrl: 'partials/demo.tmpl.html',
      controller: 'DemoCtrl',
      resolve: {
        component: function() { return demoComponent; },
        demos: function() { return componentDemos.demos; }
      }
    });
  });

  $routeProvider.otherwise('/');
}





function DemoCtrl($rootScope, $scope, component, demos, $http, $templateCache) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = null;

  $scope.demos = [];

  angular.forEach(demos, function(demo) {
    // Get displayed contents (un-minified)
    var files = [demo.index]
      .concat(demo.js || [])
      .concat(demo.css || [])
      .concat(demo.html || []);
    files.forEach(function(file) {
      file.httpPromise =$http.get(file.outputPath, {cache: $templateCache})
        .then(function(response) {
          file.contents = response.data
            .replace('<head/>', '');
          return file.contents;
        });
    });
    demo.$files = files;
    $scope.demos.push(demo);
  });

  $scope.demos = $scope.demos.sort(function(a,b) {
    return a.name > b.name ? 1 : -1;
  });
}


function ComponentDocCtrl($scope, doc, component, $rootScope) {
  hljs.initHighlighting.called = false;
  hljs.initHighlighting();
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = doc;
}
