/**
 * @ngdoc module
 * @name expander
 */
angular
  .module('brMaterial')
  .directive('brExpander', expanderDirective)
  .directive('brExpanderHeader', expanderHeaderDirective)
  .directive('brExpanderContent', expanderContentDirective);




/**
  * @ngdoc directive
  * @name brExpander
  * @module expander
  *
  * @description
  * The `<br-expander>` is a container that opens and closes
  *
  * @param {boolean=} br-width - Set expander width
  * @param {boolean=} br-height - Set epander height, this will set scrolling in y
  * @param {boolean=} br-open - Bound value for opening and closing
  * @param {string=} br-component-id - Name that can be used with the `$brExpander` service
  *
  * @usage
  * You can controll the expander in 3 ways.
  * - The `<br-expander-header>` element will automatically expand when clicked
  * - The `[br-open]` attribute will listen for changes
  * - The `$brExpander` service has functions to control the expander based on its `[br-component-id]` name
  *
  * <hljs lang="js">
  *   angular.controller('MyCtrl', function ($scope, $brExpander) {
  *     $scope.isOpen = false;
  *     $brExpander('expanderComponentId').open();
  *     $brExpander('expanderComponentId').close();
  *     $brExpander('expanderComponentId').toggle();
  *     $brExpander('expanderComponentId').isOpen();
  *   });
  * </hljs>
  *
  * <hljs lang="html">
  *    <br-expander br-open="isOpen" br-component-id="expanderComponentId">
  *      <br-expander-header>Title</br-expander-header>
  *
  *      <br-expander-content>
  *         <!-- content foes here -->
  *      </br-expander-content>
  *    </br-expander>
  * </hljs>
  */
expanderDirective.$inject = ['$brTheme', '$parse'];
function expanderDirective ($brTheme, $parse) {
  var directive = {
    restrict: 'E',
    require: 'brExpander',
    compile: compile,
    controller: ['$element', '$attrs', '$brComponentRegistry', controller]
  };
  return directive;


  function compile(tElement, tAttrs) {
    tElement.addClass('br-expander');

    var width = tAttrs.brWidth || tAttrs.width;
    if (width !== undefined) {
      tElement.css('width', width.replace('px', '') + 'px');
    }

    if (tAttrs.brHide === undefined) {
      angular.element(tElement[0].querySelector('.br-expander-hide')).attr('ng-if', '$brOpen');
    }

    return postLink;
  }

  function postLink(scope, element, attr, ctrl) {
    $brTheme(element);

    // varefy the correct child elements exist
    var headerElement = element[0].querySelector('br-expander-header');
    var contentElement = element[0].querySelector('br-expander-content');
    if (contentElement === null) {
      throw new Error('<br-expander> : Should contain <br-expander-content>');
    }

    if (attr.brOpen !== undefined) {
      var openGetter = $parse(attr.brOpen);
      scope.$watch(function () { return openGetter(scope); }, function (open) {
        if (open === true) {
          ctrl.open();
        } else {
          ctrl.close();
        }
      });
    }
  }


  function controller($element, $attrs, $brComponentRegistry) {
    /* jshint validthis: true */
    var vm = this;

    var _isOpen = false;

    vm.height = $attrs.brHeight || $attrs.height;
    vm.headerHook = headerHook;
    vm.contentHook = contentHook;

    vm.open = open;
    vm.close = close;
    vm.toggle = headerHook;
    vm.isOpen = isOpen;


    var destroy = $brComponentRegistry.register(vm, $attrs.brComponentId);
    $element.on('$destroy', destroy);

    function headerHook() {
      _isOpen = !_isOpen;
      setState();
    }

    function contentHook(func) {
      if (typeof func !== 'function') { return; }
      vm.contentHook = func;
    }

    function open() {
      _isOpen = true;
      setState();
    }

    function close() {
      _isOpen = false;
      setState();
    }

    function isOpen() {
      return _isOpen;
    }

    function setState() {
      $element.toggleClass('br-open', _isOpen);
      vm.contentHook(_isOpen);
    }
  }
}





function expanderHeaderDirective() {
  var directive = {
    restrict: 'E',
    require: '^?brExpander',
    link: link
  };
  return directive;


  function link (scope, element, attr, ctrl) {
    element.append(angular.element('<div class="br-expander-icon-container"><div class="br-expander-icon"></div></div>'));
    element.on('click', function () {
      scope.$apply(function () {
        ctrl.headerHook();
      });
    });
  }
}




expanderContentDirective.$inject = ['$timeout', '$document'];
function expanderContentDirective($timeout, $document) {
  var directive = {
    restrict: 'E',
    require: '^?brExpander',
    template:
      '<div class="br-expander-hide" ng-transclude>'+
      '</div>',
    transclude: true,
    link: link
  };
  return directive;


  function link (scope, element, attr, ctrl) {
    var killWatch;
    var height = ctrl.height === undefined ? undefined : ctrl.height.replace('px', '') + 'px';

    element.css('height', '0');


    ctrl.contentHook(function (open) {
      scope.$brOpen = open;

      $timeout(function () {
        if (open === true) {
          expandContent();
        } else {
          contractContent();
        }
      }, 0);
    });



    function expandContent() {
      element.css('height', getHeight());
      element.css('overflow', 'auto');
    }


    function getHeight() {
      if (height) {
        return height;
      } else {
        return element[0].scrollHeight + 'px';
      }
    }


    function contractContent() {
      if (typeof killWatch === 'function') { killWatch(); }
      element.css('height', '0');
    }
  }
}
