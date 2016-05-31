angular
  .module('brMaterial')
  .directive('brExpansionCardManager', expansionCardManagerDirective);



function expansionCardManagerDirective() {
  var directive = {
    restrict: 'E',
    controller: ['$scope', '$attrs', '$element', '$brComponentRegistry', '$brExpansionCard', controller]
  };
  return directive;


  function controller($scope, $attrs, $element, $brComponentRegistry, $brExpansionCard) {
    /* jshint validthis: true */
    var vm = this;

    var cards = [];
    var lisetners = [];
    var registry = {};
    var epxandedCard;
    var autoExpand = $attrs.brAutoExpand !== undefined;

    vm.register = register;
    vm.add = add;
    vm.remove = _remove;
    vm.addCard = addCard;
    vm.expandCard = expandCard;
    vm.removeCard = removeCard;
    vm.removeAll = removeAll;

    vm.on = on;
    vm.off = off;
    vm.postMessage = postMessage;




    vm.destroy = $brComponentRegistry.register(vm, $attrs.brComponentId);
    $scope.$on('$destroy', function () {
      if (vm.destroy === 'function') { vm.destroy(); }
    });


    function on(eventName, callback, id) {
      lisetners.push({name: eventName, callback: callback, id: id });
    }

    function off(eventName, id) {
      var i = 0;
      var length = lisetners.length;

      while (i < length) {
        if (lisetners[i].name === eventName && lisetners[i].id === id) {
          lisetners.splice(i, 1);
          return;
        }

        i++;
      }
    }

    function postMessage(eventName, data, bubble) {
      bubble = bubble === false ? false : true;

      var i = lisetners.length - 1;

      while (i >= 0) {
        if (lisetners[i].name === eventName) {
          lisetners[i].callback(data);
          if (bubble === false) {
            return;
          }
        }

        i--;
      }
    }



    function addCard(id, isExpanded, renderFunc, element) {
      cards.push({
        id: id,
        render: renderFunc,
        $element: element
      });

      if (autoExpand === true && isExpanded !== undefined) {
        expandCard(id);
        getCardRenderFunc(id)(true);
      }
    }

    function expandCard(id) {
      if (epxandedCard === id) { return; }

      if (epxandedCard !== undefined) {
        getCardRenderFunc(epxandedCard)(false);

      }
      epxandedCard = id;

      removeSubCards(id);
    }

    function removeCard(id) {
      var index = getCardIndex(id);
      var card = cards.splice(index, 1)[0];
      if (epxandedCard === card.id) {
        epxandedCard = undefined;
      }
      remove(card);
      openLast();
    }

    function openLast() {
      if (cards.length === 0) {
        if (registry.default !== undefined) {
          add(registry.default.componentId);
        }
      } else {
        cards[cards.length-1].render(true);
      }
    }

    function getCardRenderFunc(id) {
      var index = getCardIndex(id);
      if (index === undefined) {
        return angular.noop;
      }
      return cards[getCardIndex(id)].render;
    }

    function getCardIndex(id) {
      var i = 0;
      var length = cards.length;

      while (i < length) {
        if (cards[i].id === id) {
          return i;
        }
        i += 1;
      }
    }

    function removeSubCards(id) {
      var card;
      var start = getCardIndex(id) + 1;
      var end = cards.length;
      if (start >= end) { return; }

      while (end > start) {
        remove(cards.pop());
        end -= 1;
      }
    }


    function remove(card) {
      card.render = undefined;
      card.$element.scope().$destroy();
      card.$element.remove();
      card.$element = undefined;
      card = undefined;
    }


    function removeAll() {
      while (cards.length > 0) {
        remove(cards.pop());
      }
    }




    function register(options) {
      options = options || {};

      // componentId is used to interact with cards
      if (!options.componentId) {
        throw Error('$brExpansionCardManager registry.register() : Is missing required paramters to create. "componeneteId" is required');
      }

      // if none of these exist then a dialog box cannot be created
      if (!options.template && !options.templateUrl) {
        throw Error('$brExpansionCardManager registry.register() : Is missing required paramters to create. Required One of the following: template, templateUrl');
      }

      if (registry[options.componentId] !== undefined) {
        throw Error('$brExpansionCardManager registry.register() : Must provide a unique componentId');
      }

      options.parent = $element;
      if (options.default === true) {
        registry.default = options;
      }
      registry[options.componentId] = options;
    }


    // TODO allow for passing of objects into the scope
    function add(componentId, locals) {
      if (componentId === undefined) {
        throw Error('$brExpansionCardManager registry.add() : Must provide a componentId parameter');
      }

      if (registry[componentId] === undefined) {
        throw Error("$brExpansionCardManager registry '" + componentId + "' is not available!");
      }

      return $brExpansionCard.add(registry[componentId], locals).then();
    }

    function _remove(componentId) {
      if (componentId === undefined) {
        throw Error('$brExpansionCardManager registry.remove() : Must provide a componentId parameter');
      }

      if (registry[componentId] === undefined) {
        throw Error("$brExpansionCardManager registry '" + componentId + "' is not available!");
      }

      $brExpansionCard(componentId).remove();
    }
  }
}
