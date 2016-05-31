angular
  .module('brMaterial')
  .factory('iconService', iconService);


iconService.$inject = ['$document'];
function iconService ($document) {
  var service = {
    getClassName: getClassName
  };
  return service;


  function getClassName (name) {
    return 'br-icon-' + name.toLowerCase();
  }
}
