angular
  .module('docsApp')
  .factory('navMenuService', navMenuService);


function navMenuService(DEMOS, $rootScope, $location, COMPONENTS) {
  var service = {
    get: get,
    openedSection: undefined,
    currentSection: undefined,
    currentPage: undefined
  };
  return service;


  function get() {
    return [
      {
        label: 'Demos',
        sub: DEMOS
      },
      {
        label: 'Components',
        sub: filterDirectives(COMPONENTS)
      },
      {
        label: 'Services',
        sub: filterServices(COMPONENTS)
      }
    ];
  }


  function filterDirectives(arr) {
    arr = angular.copy(arr);
    arr.forEach(function (component) {
      component.docs = component.docs.filter(function (doc) {
        return doc.type === 'directive';
      });
    });

    return arr;
  }

  function filterServices(arr) {
    arr = angular.copy(arr);
    arr.forEach(function (component) {
      component.docs = component.docs.filter(function (doc) {
        return doc.type === 'service';
      });
    });

    return arr;
  }
}
