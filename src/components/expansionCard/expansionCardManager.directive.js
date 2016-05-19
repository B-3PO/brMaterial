angular
  .module('brMaterial')
  .directive('brExpansionCardManager', expansionCardManagerDirective);



function expansionCardManagerDirective() {
  var directive = {
    restrict: 'E',
    controller: ['$attrs', controller]
  };
  return directive;


  function controller($attrs) {
    /* jshint validthis: true */
    var vm = this;

    var cards = [];
    var epxandedCard;
    var autoExpand = $attrs.brAutoExpand !== undefined;

    vm.addCard = addCard;
    vm.expandCard = expandCard;
    vm.removeCard = removeCard;



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
      cards[cards.length-1].render(true);
    }

    function getCardRenderFunc(id) {
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
      card.$element.scope().$broadcast('$removeCard');
      card.$element.scope().$destroy();
      card.$element.remove();
      card.$element = undefined;
      card = undefined;
    }
  }
}