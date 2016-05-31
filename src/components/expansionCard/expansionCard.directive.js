angular
  .module('brMaterial')
  .directive('brExpansionCard', expansionCardDirective);


expansionCardDirective.$inject = ['$timeout', '$parse', '$brUtil'];
function expansionCardDirective($timeout, $parse, $brUtil) {
  var directive = {
    restrict: 'E',
    require: ['brExpansionCard', '?^brExpansionCardManager'],
    scope: {},
    link: link,
    controller: ['$scope', '$element', '$attrs', '$brComponentRegistry', controller]
  };
  return directive;


  function link(scope, element, attrs, ctrl) {
    var expandGetter;
    var cardController = ctrl[0];
    var mangerController = ctrl[1];
    var id = $brUtil.nextUid();
    cardController.id = id;

    element.attr('br-card-id', id);

    if (mangerController) {
      cardController.mangerController = mangerController;
      // run on next tick so we can see if card was expanded
      $timeout(function () {
        mangerController.addCard(id, cardController.isExpanded, cardController.toggle, element);
      }, 0);
    }

    if (attrs.brExpand !== undefined) {
      expandGetter = $parse(attrs.brExpand);
      cardController.toggle(expandGetter(scope));
      attrs.$observe('br-expand', function () {
        cardController.toggle(expandGetter(scope));
      });
    }

    scope.$on('$destroy', function () {
      cardController.removeAllListeners();
      cardController.destroy();
    });

    cardController.setMinHeight();
  }

  function controller($scope, $element, $attrs, $brComponentRegistry) {
    /* jshint validthis: true */
    var vm = this;

    var listeners = [];


    vm.$card = {
      remove: removeCard,
      on: on,
      off: off,
      postMessage: postMessage,
      expand: expand,
      collapse: collapse,
      flash: flash
    };

    vm.isExpanded = false;
    vm.expand = expand;
    vm.collapse = collapse;
    vm.toggle = toggle;
    vm.setMinHeight = setMinHeight;
    vm.removeAllListeners = removeAllListeners;

    vm.destroy = $brComponentRegistry.register(vm, $attrs.brComponentId);

    vm.expandedCtrl = undefined;
    vm.collaspedCtrl = undefined;

    function expand() {
      vm.isExpanded = true;
      if (vm.mangerController) {
        vm.mangerController.expandCard(vm.id);
      }
      vm.expandedCtrl.show();
      vm.collaspedCtrl.hide();
    }

    function collapse() {
      vm.isExpanded = false;
      vm.expandedCtrl.hide();
      vm.collaspedCtrl.show();
      setMinHeight();
    }

    function toggle(value) {
      if (value === true) {
        expand();
      } else {
        collapse();
      }
    }


    function setMinHeight() {
      // add 1px for spacing
      $element.css('min-height', $element[0].querySelector('.br-collapsed-content').offsetHeight + 1 + 'px');
    }



    function flash() {
      vm.collaspedCtrl.flash();
    }

    function removeCard() {
      if (vm.mangerController) {
        vm.mangerController.removeCard(vm.id);
        return;
      }

      scope.$destroy();
      element.remove();
    }

    function on(eventName, callback) {
      if (vm.mangerController) {
        listeners.push({name: eventName, callback: callback, id: vm.id});
        vm.mangerController.on(eventName, callback, vm.id);
      }
    }

    function off(eventName) {
      if (vm.mangerController) {
        removeListener(eventName);
      }
    }

    function postMessage(eventName, data, bubble) {
      if (vm.mangerController) {
        vm.mangerController.postMessage(eventName, data, bubble);
      }
    }

    function removeListener(eventName) {
      var i = 0;
      var length = listeners.length;

      while (i < length) {
        if (listeners[i].name === eventName) {
          vm.mangerController.off(listeners[i].name, vm.id);
          listeners.splice(i, 1);
          return;
        }

        i++;
      }
    }


    function removeAllListeners() {
      var i = 0;
      var length = listeners.length;

      while (i < length) {
        off(listeners[i].name);
        i++;
      }

      listeners = undefined;
    }
  }
}
