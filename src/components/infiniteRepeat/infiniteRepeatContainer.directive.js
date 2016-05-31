angular
  .module('brMaterial')
  .directive('brInfiniteRepeatContainer', brInfiniteRepeatContainer);


var MAX_ELEMENT_SIZE = 1533917;


/**
 * @ngdoc directive
 * @name brInfiniteRepeatContainer
 * @module infinteRepeat
 *
 * @param {number=} br-min-width - Set the minimum width of the inner element, this will allow horizontal scrolling
 *
 * @description
 * `<br-infiinite-repeat-container>` is the wrapping element needed for `[br-ifinite-repeat]`
 *
 * @usage
 * <hljs lang="html">
 * <br-infinite-repeat-container>
 * 	<div br-inifinte-repeat="item in list">
 * 		{{item.name}}
 * 	</div>
 * </br-infinite-repeat-container>
 * </hljs>
 */
function brInfiniteRepeatContainer() {
  var directive = {
    template: getTemplate,
    compile: compile,
    controller: ['$scope', '$element', '$attrs', '$parse', '$$rAF', '$window', '$brUtil', controller]
  };
  return directive;



  function getTemplate(tElement) {
    return '<div class="br-infinite-repeat-scroller">'+
        '<div class="br-infinite-repeat-sizer"></div>'+
        '<div class="br-infinite-repeat-offsetter">'+
          tElement[0].innerHTML+
        '</div>'+
      '</div>';
  }


  function compile(tElement) {
    tElement.addClass('br-infinite-repeat-container');
  }




  function controller($scope, $element, $attrs, $parse, $$rAF, $window, $brUtil) {
    /* jshint validthis: true */
    var vm = this;

    var updateRepeat;

    var scrollSize = 0;
    var scrollOffset = 0;
    var itemsHeight = 0;
    var size = $element[0].clientHeight;
    var offsetSize = parseInt($attrs.brOffsetSize, 10) || 0;

    var scroller = $element[0].querySelector('.br-infinite-repeat-scroller');
    var offsetter = scroller.querySelector('.br-infinite-repeat-offsetter');
    var sizer = scroller.querySelector('.br-infinite-repeat-sizer');
    var isCardChild = $brUtil.getClosest($element, 'br-expanded-content') !== null;

    var isHeight = $element.css('height') || undefined;
    var isAutoHeight = $attrs.brAutoHeight !== undefined;
    var updateAutoHeightThrottle = $$rAF.throttle(updateAutoHeight);


    vm.getSize = getSize;
    vm.getScrollOffset = getScrollOffset;
    vm.setScrollSize = setScrollSize;
    vm.updateContainer = updateContainer;
    vm.resetScroll = resetScroll;
    vm.setScrollTop = setScrollTop;
    vm.setTransform = setTransform;
    vm.updateAutoHeight = checkAutoHeight;


    if ($attrs.brMinWidth !== undefined) {
      angular.element(offsetter).css('min-width', $attrs.brMinWidth.replace('px', '') + 'px');
    }


    updateSize();
    $$rAF(function () {
      var jWindow = angular.element($window);
      jWindow.on('resize', updateSize);
      $scope.$on('$destroy', function() {
        jWindow.off('resize', updateSize);
      });
    });
    $scope.$watch(function () { return $element.css('height'); }, function (data) {
      updateSize();
    });



    if (isHeight === undefined && $attrs.brAutoHeight !== undefined) {
      updateAutoHeightThrottle();

      $scope.$watch(function () { return $element[0].offsetHeight; }, function (data){
        updateAutoHeightThrottle();
      });
    }

    function updateAutoHeight() {
      var rect = $element[0].getBoundingClientRect();
      var innerHeight = $window.innerHeight;
      if (isCardChild === true) {
        innerHeight -= 30;
      }
      $element.css('height', (innerHeight - rect.top) + 'px');
    }

    function checkAutoHeight() {
      if (isAutoHeight) {
        updateAutoHeightThrottle();
      }
    }




    // --- Public ---

    function getSize() {
      return size;
    }

    function getScrollOffset() {
      return scrollOffset;
    }

    function setScrollSize(itemsSize) {
      var size = itemsSize + offsetSize;
      if (scrollSize === size) return;

      sizeScroller(size);
      scrollSize = size;
    }

    function resetScroll() {
      scrollTo(0);
    }

    function scrollTo(position) {
      scroller.scrollTop = position;
      handleScroll();
    }

    function setScrollTop(position) {
      scroller.scrollTop = position;
    }




    // --- Private ----

    function updateSize() {
      if (isAutoHeight === true) {
        updateAutoHeightThrottle();
      }
      size = $element[0].clientHeight;
      if (typeof updateRepeat === 'function') { updateRepeat(); }
    }


    function sizeScroller(size) {
      var dimension = 'height';
      var crossDimension = 'width';

      // Clear any existing dimensions.
      sizer.innerHTML = '';

      if (size < MAX_ELEMENT_SIZE) {
        sizer.style[dimension] = size + 'px';
      } else {
        sizer.style[dimension] = 'auto';
        sizer.style[crossDimension] = 'auto';

        // Divide the total size we have to render into N max-size pieces.
        var numChildren = Math.floor(size / MAX_ELEMENT_SIZE);

        // Element template to clone for each max-size piece.
        var sizerChild = document.createElement('div');
        sizerChild.style[dimension] = MAX_ELEMENT_SIZE + 'px';
        sizerChild.style[crossDimension] = '1px';

        for (var i = 0; i < numChildren; i++) {
          sizer.appendChild(sizerChild.cloneNode(false));
        }

        // Re-use the element template for the remainder.
        sizerChild.style[dimension] = (size - (numChildren * MAX_ELEMENT_SIZE)) + 'px';
        sizer.appendChild(sizerChild);
      }
    }

    function updateContainer(func) {
      updateRepeat = $$rAF.throttle(func);
      angular.element(scroller)
        .on('scroll wheel touchmove touchend', handleScroll);
    }

    function handleScroll () {
      var offset = scroller.scrollTop;
      if (offset === scrollOffset) { return; }

      scrollOffset = offset;
      updateRepeat();
    }

    function setTransform(height) {
      var transform = 'translate3d(0,' + height + 'px,0)';
      offsetter.style.webkitTransform = transform;
      offsetter.style.transform = transform;
    }
  }
}
