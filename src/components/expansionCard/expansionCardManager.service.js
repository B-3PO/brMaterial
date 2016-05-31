angular
  .module('brMaterial')
  .factory('$brExpansionCardManager', expansionCardManagerService);




expansionCardManagerService.$inject = ['$rootScope', '$q', '$brComponentRegistry', '$brExpansionCard'];
function expansionCardManagerService($rootScope, $q, $brComponentRegistry, $brExpansionCard) {
  var registries = {};
  var pick = ['add', 'remove', 'removeAll', 'register'];

  var handler = function (handle, wait) {
    var instance = $brComponentRegistry.get(handle, pick);

    if (handle === undefined) {
      return {
        waitFor: waitForInstance
      };
    } else if(!instance && wait !== true) {
      $brComponentRegistry.notFoundError(handle);
    }

    return !instance && wait ? waitForInstance() : getInstance(instance);


    function waitForInstance(handle) {
      return $brComponentRegistry
        .when(handle, pick)
        .then(function (it) {
          instance = getInstance(it);
          return instance;
        });
    }


    function getInstance(instance) {
      var i = 0;
      var length = pick.length;
      var picked = {};
      while (i < length) {
        picked[pick[i]] = instance[pick[i]];
        i++;
      }
      return picked;
    }
  };


  return handler;
}
