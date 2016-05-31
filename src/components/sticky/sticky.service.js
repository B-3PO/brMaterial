angular
  .module('brMaterial')
  .factory('$brSticky', brStickyService);


brStickyService.$inject = ['$document', '$$rAF', '$brUtil', '$timeout', '$brConstant'];
function brStickyService($document, $$rAF, $brUtil, $timeout, $brConstant) {
  var browserStickySupport = checkStickySupport();

  return function registerStickyElement(scope, element, stickyClone, horizontalScroll) {
    horizontalScroll = horizontalScroll || false;
    var contentCtrl = element.controller('brContent');
    if (!contentCtrl) return;

    if (browserStickySupport) {
      element.css({
        position: browserStickySupport,
        top: 0,
        'z-index': 2
      });
    } else {
      var $$sticky = contentCtrl.$element.data('$$sticky');
      if (!$$sticky) {
        $$sticky = setupSticky(contentCtrl, horizontalScroll);
        contentCtrl.$element.data('$$sticky', $$sticky);
      }

      var deregister = $$sticky.add(element, stickyClone || element.clone());
      scope.$on('$destroy', deregister);
      scope.$on('$removeSticky', deregister);
    }
  };




  function setupSticky(contentCtrl, horizontalScroll) {
    var contentEl = contentCtrl.$element;
    var debouncedRefreshElements = $$rAF.throttle(refreshElements);
    var debouncedScroll = $$rAF.throttle(onScroll);

    setupAugmentedScrollEvents(contentEl);
    contentEl.on('$scrollstart', debouncedRefreshElements);
    contentEl.on('$scroll', debouncedScroll);


    var self = {
      prev: null,
      current: null,
      next: null,
      items: [],
      add: add,
      refreshElements: refreshElements,
      horizontalScroll: horizontalScroll
    };
    return self;




    function add(element, stickyClone) {
      stickyClone.addClass('br-sticky-clone');

      if ($brUtil.getClosest(element, 'br-expanded-content') !== null) {
        stickyClone.addClass('br-card-header');
      }

      var item = {
        element: element,
        clone: stickyClone
      };
      self.items.push(item);

      $$rAF(function() {
        contentEl.prepend(item.clone);
      });

      debouncedRefreshElements();

      return function remove() {
        self.items.forEach(function(item, index) {
          if (item.element[0] === element[0]) {
            self.items.splice(index, 1);
            item.clone.remove();
          }
        });
        debouncedRefreshElements();
      };
    }


    function refreshElements() {
      var item;
      var i;
      var currentScrollTop = contentEl.prop('scrollTop');

      self.items.forEach(refreshPosition);
      self.items = self.items.sort(function(a, b) {
        return a.top < b.top ? -1 : 1;
      });

      for (i = self.items.length - 1; i >= 0; i--) {
        if (currentScrollTop > self.items[i].top) {
          item = self.items[i];
          break;
        }
      }

      setCurrentItem(item);
    }


    function refreshPosition(item) {
      var current = item.element[0];

      item.top = 0;
      item.left = 0;

      while (current && current !== contentEl[0]) {
        item.top += current.offsetTop;
        item.left += current.offsetLeft;
        current = current.offsetParent;
      }

      item.height = item.element.prop('offsetHeight');
      // item.clone.css('margin-left', item.left + 'px');
    }


    function onScroll() {
      var scrollTop = contentEl.prop('scrollTop');
      var isScrollingDown = scrollTop > (onScroll.prevScrollTop || 0);

      onScroll.prevScrollTop = scrollTop;

      if (scrollTop === 0) {
        setCurrentItem(null);
        return;
      }



      if (isScrollingDown) {

        // If we've scrolled down past the next item's position, sticky it and return
        if (self.next && self.next.top <= scrollTop) {
          setCurrentItem(self.next);
          return;
        }

        // If the next item is close to the current one, push the current one up out of the way
        if (self.current && self.next && self.next.top - scrollTop <= self.next.height) {
          translate(self.current, scrollTop + (self.next.top - self.next.height - scrollTop));
          return;
        }
      }


      if (!isScrollingDown) {

        // If we've scrolled up past the previous item's position, sticky it and return
        if (self.current && self.prev && scrollTop < self.current.top) {
          setCurrentItem(self.prev);
          return;
        }

        // If the next item is close to the current one, pull the current one down into view
        if (self.next && self.current && (scrollTop >= (self.next.top - self.current.height))) {
          translate(self.current, scrollTop + (self.next.top - scrollTop - self.current.height));
          return;
        }
      }

      if (self.current) {
        translate(self.current, scrollTop);
      }
    }



    function setCurrentItem(item) {
      if (self.current === item) { return; }

      if (self.current) {
        translate(self.current, null);
        setStickyState(self.current, null);
      }

      if (item) {
        setStickyState(item, 'active');
      }

      self.current = item;
      var index = self.items.indexOf(item);

      self.next = self.items[index + 1];
      self.prev = self.items[index - 1];
      setStickyState(self.next, 'next');
      setStickyState(self.prev, 'prev');
    }


    function setStickyState(item, state) {
      if (!item || item.state === state) { return; }

      if (item.state) {
        item.clone.attr('sticky-prev-state', item.state);
        item.element.attr('sticky-prev-state', item.state);
      }

      item.clone.attr('sticky-state', state);
      item.element.attr('sticky-state', state);
      item.state = state;
    }


    function translate(item, amount) {
      if (!item) { return; }

      if (amount === null || amount === undefined) {
        if (item.translateY) {
          item.translateY = null;
          item.clone.css($brConstant.CSS.TRANSFORM, '');
        }
      } else {
        item.translateY = amount;
        item.clone.css(
          $brConstant.CSS.TRANSFORM,
          'translate3d(0,' + amount + 'px,0)'
        );
      }
    }

  }






  // Function to check for browser sticky support
  function checkStickySupport() {
    var stickyProp;
    var testEl = angular.element('<div>');
    $document[0].body.appendChild(testEl[0]);

    var stickyProps = ['sticky', '-webkit-sticky'];
    for (var i = 0; i < stickyProps.length; ++i) {
      testEl.css({position: stickyProps[i], top: 0, 'z-index': 2});
      if (testEl.css('position') == stickyProps[i]) {
        stickyProp = stickyProps[i];
        break;
      }
    }
    testEl.remove();
    return stickyProp;
  }



  function setupAugmentedScrollEvents(element) {
    var SCROLL_END_DELAY = 200;
    var isScrolling;
    var lastScrollTime;

    element.on('scroll touchmove wheel', function() {
      if (!isScrolling) {
        isScrolling = true;
        $$rAF.throttle(loopScrollEvent);
        element.triggerHandler('$scrollstart');
      }
      element.triggerHandler('$scroll');
      lastScrollTime = +$brUtil.now();
    });

    function loopScrollEvent() {
      if (+$brUtil.now() - lastScrollTime > SCROLL_END_DELAY) {
        isScrolling = false;
        element.triggerHandler('$scrollend');
      } else {
        element.triggerHandler('$scroll');
        $$rAF.throttle(loopScrollEvent);
      }
    }
  }
}
