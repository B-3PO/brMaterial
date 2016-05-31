/**
 * @ngdoc module
 * @name sideContent
 */
angular
  .module('brMaterial')
  .directive('brSideContent', brSideContentDirective);



/**
  * @ngdoc directive
  * @name brSideContent
  * @module sideContent
  *
  *
  * @description
  * `<br-side-content>` is a side panel that will auto hide on mobile devices and when the screen is too small.
  * You can open it using the `$brContentService`
  *
  * @param {number=} br-width - The width used when open and there is enough screen space
	* @param {string=} br-component-id - The name used when calling the content from `$brSideContent` service
	* @param {boolean=} br-is-locked-open - Tells the side content to stay open or not. you can use `$brMedia` service to control this for mobile devices
  *
  * @usage
  * ### Class Names
  * - br-side-content-right - tells the side content stick to the right side
  * - br-side-content-left - tells the side content stick to the left side
  * - br-border-right - shows border on right
  * - br-border-left - shows border on left
  *
  * <hljs lang="html">
  *   <br-side-content class="br-side-content-right br-border-left" br-is-locked-open="$brMedia('md')" br-component-id="sideContentId" br-width="400">
  *     // content does here
  *    </br-side-content>
  * </hljs>
  */
brSideContentDirective.$inject = ['$brTheme', '$q', '$parse', '$window', '$brMedia', '$animate', '$document', '$brUtil', '$brConstant'];
function brSideContentDirective($brTheme, $q, $parse, $window, $brMedia, $animate, $document, $brUtil, $brConstant) {
  var directive = {
    restrict: 'E',
    scope: {
      isOpen: '=?brIsOpen'
    },
    transclude: true,
    template:
      '<div class="br-side-content-container">'+
        '<div ng-transclude></div>'+
      '</div>',
    compile: compile,
    controller: ['$scope', '$element', '$attrs', '$brComponentRegistry', '$q', '$brBackdrop', controller]
  };
  return directive;


  function compile(tElement, tAttrs) {
    tElement.addClass('br-closed');
    tElement.attr('tabIndex', '-1');

    return function postLink(scope, element, attrs, sideContentCtrl) {
      var lastParentOverFlow;
      var triggeringElement = null;
      var promise = $q.when(true);
      var isLockedOpenParsed = $parse(attrs.brIsLockedOpen);
      var brWidth = attrs.brWidth !== undefined;
      var windowWidth;

      $brTheme(element);


      if(brWidth === true) {
        brWidth = attrs.brWidth.replace('px', '');
        angular.element($window).bind('resize', resize);
        scope.$on('$destroy', function () {
          angular.element($window).off('resize', resize);
        });

        if(brWidth < ($window.innerWidth - 23)) {
          element.css('width', brWidth + 'px');
          element.css('min-width', brWidth + 'px');
          element.css('max-width', brWidth + 'px');
        }
      }

      var isLocked = function() {
        return isLockedOpenParsed(scope.$parent, {
          $brMedia: $brMedia
        });
      };


      scope.disableLockedOpen = false;
      scope.$watch(isLocked, updateIsLocked);
      scope.$watch('isOpen', updateIsOpen);
      element.on('$destroy', sideContentCtrl.destroy);

      sideContentCtrl.$toggleOpen = toggleOpen;



      function resize () {
        if (brWidth >= ($window.innerWidth - 24)) {
          element.attr('style', '');
        } else {
          element.css('width', brWidth + 'px');
          element.css('min-width', brWidth + 'px');
          element.css('max-width', brWidth + 'px');
        }
      }


      function updateIsLocked(isLocked){
        if (scope.disableLockedOpen === true) {
          scope.isLockedOpen = false;
          element.removeClass('br-locked-open');
          return;
        }

        scope.isLockedOpen = isLocked;
        element.toggleClass('br-locked-open', !isLocked);
      }


      function updateIsOpen(isOpen) {
        var parent = element.parent();
        //var focusEl = sideContentCtrl.focusElement();

        parent[isOpen ? 'on' : 'off']('keydown', onKeyDown);
        // backdrop[isOpen ? 'on' : 'off']('click', close);

        if ( isOpen ) {
          triggeringElement = $document[0].activeElement;
        }

        disableParentScroll(isOpen);

        // TODO : make this promis triggetr on animation complete
        promise = $q.all([
            // isOpen ? $animate.enter(backdrop, parent) : $animate.leave(backdrop),
            //$animate[isOpen ? 'removeClass' : 'addClass'](element, 'br-closed')
            setTimeout(function () {
  						scope.$apply(function(){
  							$animate[isOpen ? 'removeClass' : 'addClass'](element, 'br-closed');
  						});
  					}, 0)
          ])
          .then(function() {
            // Perform focus when animations are ALL done...
            if (scope.isOpen) {
              //focusEl && focusEl.focus();
            }
          });

        return promise;
      }


      function toggleOpen(isOpen) {
        if (scope.isOpen == isOpen ) {
          return $q.when(true);

        } else {
          var deferred = $q.defer();

          // Toggle value to force an async `updateIsOpen()` to run
          scope.isOpen = isOpen;

          $brUtil.nextTick(function() {

            // When the current `updateIsOpen()` animation finishes
            promise.then(function(result) {
              if (!scope.isOpen) {
                // reset focus to originating element (if available) upon close

                setTimeout(function () {
                  if (triggeringElement) { triggeringElement.focus(); }
                  triggeringElement = null;
                }, 0);
              }

              deferred.resolve(result);
            });
          });

          return deferred.promise;
        }
      }


      function disableParentScroll(disabled) {
        var parent = element.parent();
        if ( disabled && !lastParentOverFlow ) {

          lastParentOverFlow = parent.css('overflow');
          parent.css('overflow', 'hidden');

        } else if (angular.isDefined(lastParentOverFlow)) {
          parent.css('overflow', lastParentOverFlow);
          lastParentOverFlow = undefined;
        }
      }


      function onKeyDown(ev) {
        var isEscape = (ev.keyCode === $brConstant.KEY_CODE.ESCAPE);
        return isEscape ? close(ev) : $q.when(true);
      }


      function close(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        return sideContentCtrl.close();
      }
    };
  }






  function controller($scope, $element, $attrs, $brComponentRegistry, $q, $brBackdrop) {
    /* jshint validthis: true */
    var vm = this;

    vm.isOpen = function () { return !!$scope.isOpen; };
    vm.isLockedOpen = function () { return !!$scope.isLockedOpen; };
    vm.hide = function () { $element.addClass('br-side-content-hide'); };
    vm.show = function () { $element.removeClass('br-side-content-hide'); };
    vm.open = function () { return vm.$toggleOpen(true); };
    vm.close = function () { return vm.$toggleOpen( false ); };
    vm.toggle = function () { return vm.$toggleOpen( !$scope.isOpen ); };
    vm.$toggleOpen = function(value) { return $q.when($scope.isOpen = value); };
    vm.addBackdrop = function (clickCallback) { $brBackdrop.add($element, $scope, clickCallback); };
    vm.removeBackdrop = function () { $brBackdrop.remove(); };

    vm.focusElement = function (el) {
      if (angular.isDefined(el)) {
        return el;
      }
      return null;
    };

    vm.destroy = $brComponentRegistry.register(vm, $attrs.brComponentId);
  }
}
