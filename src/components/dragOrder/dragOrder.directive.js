/**
 * @ngdoc module
 * @name dragOrder
 * @description
 * dragOrder
 */

angular
  .module('brMaterial')
  .directive('brDragOrder', brDragOrderDirective);



/**
 * @ngdoc directive
 * @name brDragOrder
 * @module dragOrder
 *
 * @param {function=} br-drag-order - Pass in an optinal function the will get called when the order changes
 * @param {boolean=} br-drag-order-allowed - Set if the drag ordering can be done
 *
 * @description
 * The `[br-drag-order]` this will use the ng-repeat and its ordinal filter to allow you to click-drag reorder elements
 * This will set a new ordinal value between the two items you dragged between.
 * decimals are used for this process.
 * The drag reorder is initiated after holding the element for 500 ms
 *
 * @usage
 * ### Controller
 * <hljs lang="js">
 * angular.controller('MyCtrl', function($scope) {
 *   $scope.users = [
 *     { ordinal: 1, name: 'Bob' },
 *     { ordinal: 2, name: 'Alice' },
 *     { ordinal: 3, name: 'Steve' }
 *   ];
 * });
 * </hljs>
 *
 * ### HTML
 * `br-drag-reorder` will use the propery defined by the `orderBy` filter
 * <hljs lang="html">
 *  <div ng-repeat="item in list | orderBy:'item.ordinal'" br-drag-order="">
 *    {{item}}
 *  </div>
 * </hljs>
 */
brDragOrderDirective.$inject = ['$brGesture', '$brConstant', '$brDialog', '$parse'];
function brDragOrderDirective($brGesture, $brConstant, $brDialog, $parse) {
  var directive = {
    restrict: 'A',
    require: '?brItem',
    link: link,
    controller: ['$scope', controller]
  };
  return directive;



  function controller($scope) {
    /*jshint validthis: true */
    var vm = this;

    vm.triggerHold = function () {
      $scope.triggerHold();
    };
  }





  function link(scope, element, attr, brItemController) {
    if(attr.ngRepeat === undefined) {
      throw new Error('[br-drag-order]. You can only apply to an element with ngRepeat');
    }

    var parts = attr.ngRepeat.match(/^\s*(\w+)\sin\s+([\w\[\].]+)\s\|?\s?orderBy(?::\s?')\s?(\w+)/i);


    // TODO : Mabye Allow for orderby field specification????
    // for now orderBy is required
    if(!parts || parts[2] === undefined) {
      throw new Error('[br-drag-order]. your ngRepeat can only contain the "orderBy" filter');
    }



    scope.triggerHold = triggerHold;



    var itemKey = parts[1];
    var orderBy = parts[3];
    var parent = element.parent();
    var offsetParent = angular.element(element[0].offsetParent);
    var parentBounds;
    var clone;
    var hoverElement;
    var startX = 0;
    var startY = 0;
    var isDown = false;
    var isOnHold = false;
    var isDragging = false;



    // --- public mothod ---
    function triggerHold() {
      isDown = true;
      // prevent text selection
      angular.element(document.body).addClass('br-no-text-select');

      // prevent draggin for br item controls
      if (brItemController !== undefined) { brItemController.blockDrag(); }

      startDrag();
    }



    // --- Events -------
    // ------------------

    $brGesture.register(element, 'hold');
    $brGesture.register(element, 'press');
    $brGesture.register(element, 'dragVertical');
    element
      .on('$br.hold', onHold)
      .on('$br.pressdown', onPressDown)
      .on('$br.pressup', onPressUp)
      .on('$br.dragstart', dragStart)
      .on('$br.drag', onDrag)
      .on('$br.dragend', dragEnd);




    // set hold state and add roation animation
    function onHold(e) {
      if(!isDown) return;

      e.preventDefault();
			e.stopPropagation();

      // prevent text selection
      angular.element(document.body).addClass('br-no-text-select');

      // prevent draggin for br item controls
      if (brItemController !== undefined) { brItemController.blockDrag(); }

      startDrag();
    }

    function startDrag() {
			isOnHold = true;

      // clear text selection
      document.getSelection().removeAllRanges();

      element.addClass('br-drag-order-hold');
		}


    // set down state and disable user selection(text)
    function onPressDown(e) {
      isDown = true;
    }

    // reset hold and down state
    function onPressUp(e) {
      isOnHold = false;
      isDown = false;

      clearDrag();
    }




    // set drag state. create clone element. find all sister elements and set their center points
    // set initianl clone location. add css for new display states
    function dragStart(e) {
      if (!isOnHold) return;

      e.preventDefault();
      e.stopPropagation();
      e.srcEvent.preventDefault();
      e.srcEvent.stopPropagation();

      isDragging = true;

      parentBounds = parent[0].getBoundingClientRect();
      // expand bounds for inbound detection
      parentBounds = {top: parentBounds.top - 20, bottom: parentBounds.bottom + 20};

      setupSisters();
      clone = angular.element('<div></div>');
      clone.css('width', element[0].getBoundingClientRect().width + 'px');
      clone.css('height', element[0].getBoundingClientRect().height + 'px');
      clone.css('overflow', 'hidden');

      clone.append(element.clone());
      // clone = element.clone();

      clone.removeClass('br-drag-order-hold');
      clone.addClass('br-drag-order-clone');

      // TODO fix position if the parent is not also offsetParent
      // offsetParent.prepend(clone);
      parent.prepend(clone);

      element.addClass('br-drag-order-dragging');
      element.removeClass('br-drag-order-hold');
      setInitalPoint();
    }



    function onDrag(e) {
      if (!isDragging) return;

      var x = startX + e.pointer.distanceX;
      var y = startY + e.pointer.distanceY;

      clone.css($brConstant.CSS.TRANSFORM, 'translate3d(' + x + 'px,' + y + 'px,0) rotate(1.25deg)');

      // TODO fix hover position when screen is scrolled
      setHoverElement(e.pointer.x, e.pointer.y);
    }

    function dragEnd(e) {
      if(!isDragging) return;

      isDragging = false;
      clearDrag();

      setNewOrder();
    }



    // set offset postion and set clnes position
    function setInitalPoint() {
      startX = element[0].offsetLeft - clone[0].offsetLeft;
      startY = element[0].offsetTop - clone[0].offsetTop;
      clone.css($brConstant.CSS.TRANSFORM, 'translate3d(' + startX + 'px,' + startY + 'px,0) rotate(1.25deg)');
    }







    // --- Helpers ------
    // ------------------

    var sisters = [];
    var sistersBounds = [];
    var prepend;

    // get current order value for post and pre elements then calculate a new order value for inbetween them
    // set this number on the scopes item
    function setNewOrder() {
      if (angular.isDefined(attr.brDragOrderAllowed) && $parse(attr.brDragOrderAllowed)(scope) === false) {
        $brDialog.alert('You do not have permission to re-order');
        return;
      }

      if (hoverElement === undefined) { return; }

      var preOrder;
      var postOrder;
      var newOrder;

      // get pre order value or set it to 0
      if (sisters.indexOf(hoverElement[0]) > 0) {
        preOrder = angular.element(sisters[sisters.indexOf(hoverElement[0])-1]).scope()[itemKey][orderBy];
      } else {
        preOrder = 0;
      }

      // get post order value
      postOrder = hoverElement.scope()[itemKey][orderBy];

      // calculate new order value
      if (prepend) {
        if (postOrder - preOrder > 1) {
          newOrder = preOrder + 1;
        } else {
          newOrder = preOrder + ((postOrder - preOrder) / 2);
        }
      } else {
        newOrder = postOrder + 1;
      }

      // set new value
      // force a scope apply
      setTimeout(function() {
        scope.$apply(function () {
          scope[itemKey][orderBy] = newOrder;

          if (attr.brDragOrder !== '') {
            $parse(attr.brDragOrder.replace('()', '('+itemKey+')'))(scope);
          }
        });
      }, 0);

      hoverElement = undefined;
    }




    // fins sister drag elements and create an array with ther vertical centers
    function setupSisters() {
      var rect;

      sisters = getSisters();

      sistersBounds = [];

      var i = 0;
      var len = sisters.length;

      for(i; i < len; ++i) {
        rect = sisters[i].getBoundingClientRect();
        sistersBounds.push(rect.top + (rect.height / 2));
      }
    }


    // Return a list of neighboring elements with the brDragOrder attribute
    function getSisters() {
      var i = 0;
      var children = parent.children();
      var len = children.length;
      var list = [];

      for (i; i < len; ++i) {
        if (children[i].getAttribute('br-drag-order') !== null) {
          list.push(children[i]);
        }
      }

      return list;
    }



    // remove all css for dragging and clear clone
    function clearDrag() {
      document.getSelection().removeAllRanges();

      // prevent text selection
      angular.element(document.body).removeClass('br-no-text-select');

      // prevent draggin for br item controls
      if (brItemController !== undefined) { brItemController.unblockDrag(); }

      element.removeClass('br-drag-order-hold');
      element.removeClass('br-drag-order-dragging');

      if (hoverElement) {
        hoverElement.removeClass('br-drag-order-select-top');
        hoverElement.removeClass('br-drag-order-select-bottom');
      }

      if(clone) {
        clone.remove();
        clone = undefined;
      }
    }


    // set hove elemente based on sisters vertical centers and mouse position
    function setHoverElement(x, y) {
      var i = 0;
      var len = sistersBounds.length;

      if (hoverElement) {
        hoverElement.removeClass('br-drag-order-select-top');
        hoverElement.removeClass('br-drag-order-select-bottom');
        hoverElement = undefined;
      }

      // check if pointer is in bounds. if not clear hoverElement
      if (y < parentBounds.top || y > parentBounds.bottom) {
        hoverElement = undefined;
        return;
      }

      // check if pointer is bellow the last elements center line
      prepend = false;
      if (y > sistersBounds[sistersBounds.length - 1]) {
        // hoverItem = sistersBounds.length - 1;
        hoverElement = angular.element(sisters[sistersBounds.length - 1]);
        hoverElement.addClass('br-drag-order-select-bottom');
        return;
      }

      // check for which elements center line the pointer is above
      for(i; i < len; ++i) {
        if (y < sistersBounds[i] && sisters[i] != element[0]) {
          prepend = true;
          hoverElement = angular.element(sisters[i]);
          hoverElement.addClass('br-drag-order-select-top');
          return;
        }
      }

      hoverElement = undefined;
    }

  }
}
