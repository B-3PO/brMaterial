/**
 * @ngdoc module
 * @name backdrop
 * @description
 * backdrop
 */
angular
  .module('brMaterial')
  .factory('$brBackdrop', brBackdropService);


/**
 * @ngdoc service
 * @name $brBackdrop
 * @module backdrop
 *
 * @description
 * The `$brBackdrop` service will add a backdrop to any element you give it. it will also call a function when the backdrop is clicked
 *
 * @usage
 * <hljs lang="js">
 * angular.controller('MyCtrl', function($scope, $element, $brBackdrop) {
 *   $brBackdrop.add($element, $scope, function () {
 *     console.log('click callback');
 *     $brBackdrop.remove();
 *   });
 * });
 * </hljs>
 */
brBackdropService.$inject = ['$compile', '$animate'];
function brBackdropService ($compile, $animate) {
  var backdrop;
  var _element;
  var wrapper;

  var service = {
    add: add,
    remove: remove
  };
  return service;



  // --- Public ---------------
  // -------------------------


  /**
   * @ngdoc method
   * @name $brBackdrop#add
   * @function
   *
   * @description
   * The add function will add a backdrop to any element you give it. it will also call a function when the backdrop is clicked
   *
   * @param {elemnt} element - An element to place the backdrop behind
   * @param {scope} scope - A scope to tie the backdrop to
   * @param {function=} clickCallback - A function to call when backdrop is clicked
   */
  function add (element, scope, clickCallback) {
    if(!isValidAdd(element, scope, clickCallback)) return;

    backdrop = $compile('<br-backdrop class="br-click-catcher ng-enter">')(scope);
    createAndAdd(element, scope, clickCallback);
    element.addClass('br-backdrop-content-wrapper');

    // wrapper = angular.element('<div class="br-backdrop-content-wrapper" style="overflow: inherit;"></div>');
    // element.after(wrapper);
    // wrapper.prepend(element);
  }


  /**
    * @ngdoc method
   * @name $brBackdrop#remove
   * @function
   *
   * @description
   * The remove function will remove the current backdrop
   */
  function remove () {
    if(!backdrop) return;

    if(wrapper) {
      wrapper.after(_element);
      wrapper.remove();
      wrapper = null;
    }

    backdrop.off('click');
    backdrop.remove();
    backdrop = null;
  }





  // --- Private ------------------
  // ------------------------------


  function createAndAdd (element, scope, clickCallback) {
    _element = element;

    if(typeof clickCallback === 'function') {
      backdrop.on('click', clickCallback);
    }
  }


  function isValidAdd (element, scope, clickCallback) {
    if(backdrop) {
      console.log('$brBackdrop: You cannot add more than one backdrop at a time');
      return false;
    }

    if(!element) {
      console.log('$brBackdrop: Element is required');
      return false;
    }

    if(!scope) {
      console.log('$brBackdrop: Scope is required');
      return false;
    }

    return true;
  }
}
