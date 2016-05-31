angular
  .module('brMaterial')
  .factory('$brSideContent', brSideContentService);



/**
  * @ngdoc service
  * @name $brSideContent
  * @module sideContent
  *
  *
  * @description
  * `$brSideContent` controls the `<br-side-content>` element
  *
  *
  * @usage
  * <hljs lang="js">
  * angular.controller('MyCtrl', function ($brSideContent) {
  *   $brSideContent('theComponentId').open();
  *   $brSideContent('theComponentId').isOpen();
  *   $brSideContent('theComponentId').isLockedOpen();
  *   $brSideContent('theComponentId').close();
  *   $brSideContent('theComponentId').addBackdrop();
  *   $brSideContent('theComponentId').removeBackdrop();
  * });
  * </hljs>
  *
  * <hljs lang="html">
  * <br-side-content br-component-id="theComponentId" br-is-locked-open="$brMedia('md')" br-width="400">
  *   // content does here
  * </br-side-content>
  * </hljs>
  */
brSideContentService.$inject = ['$brComponentRegistry', '$q'];
function brSideContentService($brComponentRegistry, $q) {
  return function (handle) {
    var errorMsg = "SideNav '" + handle + "' is not available!";
    var instance = $brComponentRegistry.get(handle);

    if(!instance) {
      $brComponentRegistry.notFoundError(handle);
    }

    var service = {
      isOpen: isOpen,
      isLockedOpen: isLockedOpen,
      hide: hide,
      show: show,
      toggle: toggle,
      open: open,
      close: close,
      then: then,
      addBackdrop: addBackdrop,
      removeBackdrop: removeBackdrop
    };
    return service;


    /**
     * @ngdoc method
     * @name $brSideContent#isOpen
     * @function
     *
     * @description
     * Check to see is a side content is open
     *
     * @return {boolean} - true if open, false if closed
     */
    function isOpen() {
      return instance && instance.isOpen();
    }


    /**
     * @ngdoc method
     * @name $brSideContent#isLockedOpen
     * @function
     *
     * @description
     * Check to see if the br-locked-open attribute is true or false
     *
     * @return {boolean} - True id locked open, flase is not locked open
     */
    function isLockedOpen() {
      return instance && instance.isLockedOpen();
    }

    /**
     * @ngdoc method
     * @name $brSideContent#hide
     * @function
     *
     * @description
     * hide
     */
    function hide() {
      if (instance) instance.hide();
    }

    /**
     * @ngdoc method
     * @name $brSideContent#show
     * @function
     *
     * @description
     * show
     */
    function show() {
      if (instance) instance.show();
    }


    /**
     * @ngdoc method
     * @name $brSideContent#toggle
     * @function
     *
     * @description
     * Toggles open closed state. This will only close if the locked open state is false
     *
     * @return {promise} - promise resolved post animation
     */
    function toggle() {
      return instance ? instance.toggle() : $q.reject(errorMsg);
    }



    /**
     * @name open
     * @function
     *
     * @description
     * Toggles content open state
     *
     * @return {promise} - promise resolved post animation
     */
    function open() {
      return instance ? instance.open() : $q.reject(errorMsg);
    }


    /**
     * @ngdoc method
     * @name $brSideContent#close
     * @function
     *
     * @description
     * Toggles closed state. This will only close if the locked open state is false
     *
     * @return {promise} - promise resolved post animation
     */
    function close() {
      return instance ? instance.close() : $q.reject(errorMsg);
    }


    /**
     * @ngdoc method
     * @name $brSideContent#then
     * @function
     *
     * @description
     * Function called post operation
     *
     * @return {promise} - promise resolved post animation
     */
    function then(callbackFn) {
      var promise = instance ? $q.when(instance) : waitForInstance();
      return promise.then( callbackFn || angular.noop );
    }


    /**
     * @ngdoc method
     * @name $brSideContent#addBackdrop
     * @function
     *
     * @description
     * Adds a backdrop behind the side content to prevent clicking
     *
     * @return {promise} - promise resolved post backdrop being added
     */
    function addBackdrop(clickCallback) {
      return instance ? instance.addBackdrop(clickCallback) : $q.reject(errorMsg);
    }


    /**
     * @ngdoc method
     * @name $brSideContent#removeBackdrop
     * @function
     *
     * @description
     * Removes backdrop from behind the side content
     *
     * @return {promise} - promise resolved post backdrop being removed
     */
    function removeBackdrop() {
      return instance ? instance.removeBackdrop() : $q.reject(errorMsg);
    }





    function waitForInstance() {
      return $brComponentRegistry
        .when(handle)
        .then(function (it) {
          instance = it;
          return it;
        });
    }

  };
}
