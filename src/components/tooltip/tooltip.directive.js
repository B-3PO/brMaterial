/**
 * @ngdoc module
 * @name tooltip
 */
angular
  .module('brMaterial')
  .directive('brTooltip', brTooltipDirective);




/**
  * @ngdoc directive
  * @name brTooltip
  * @module tooltip
  *
  * @description
  * The `<br-ttooltip>` directive can attact to any element. just place it inside of the element you want it to ativate on
  *
  *
  * @param {boolean=} [br-visible] - show/hide tooltip
  * @param {number=} [br-delay=300] - delay for hidding the tooltip in millaseconds.
  * @param {boolean=} [br-autohide=true] - DEFAULT: true. automatically hide on mouse exit
  * @param {string=} [br-position] - use "top", "left", "right" to change the position of the tooltip
  *
  * - "right top"
  * - "left top"
  * - "right bottom"
  * - "left bottom"
  *
  * @usage
  * <hljs lang="html">
  * <br-button>
  *   Button Label
  *   <br-tooltip>Tooltip Title</br-tooltip>
  * </br-button>
  * </hljs>
  */

brTooltipDirective.$inject = ['$brTheme', '$$rAF', '$brUtil', '$animate', '$q', '$timeout', '$window', '$rootElement', '$document'];
function brTooltipDirective ($brTheme, $$rAF, $brUtil, $animate, $q, $timeout, $window, $rootElement, $document) {
  var TOOLTIP_SHOW_DELAY = 300;
  var TOOLTIP_WINDOW_EDGE_SPACE = 8;

  var directive = {
    restrict: 'E',
    transclude: true,
    priority: 210,
    template: '<div class="br-background"></div>'+
              '<div class="br-content" ng-transclude></div>',
    scope: {
      visible: '=?brVisible',
      delay: '=?brDelay',
      autohide: '=?brAutohide'
    },
    link: link
  };
  return directive;


  function link (scope, element, attr) {
    $brTheme(element);

    var parent = getParentWithPointerEvents();
    var background = angular.element(element[0].getElementsByClassName('br-background')[0]);
    var content = angular.element(element[0].getElementsByClassName('br-content')[0]);
    var direction = attr.brPosition;
    var current = getNearestContentElement();
    var tooltipParent = angular.element(current || document.body);
    var debouncedOnResize = $$rAF.throttle(function () { if (scope.visible) positionTooltip(); });


    setDefaults();
    manipulateElement();
    bindEvents();
    configureWatchers();



    function setDefaults() {
      if (!angular.isDefined(attr.brDelay)) scope.delay = TOOLTIP_SHOW_DELAY;
    }

    function manipulateElement() {
      element.detach();
      element.attr('role', 'tooltip');
    }


    function bindEvents() {
      var mouseActive = false;

      var ngWindow = angular.element($window);

      if (parent[0] && 'MutationObserver' in $window) {
        var attributeObserver = new MutationObserver(function(mutations) {
          if (mutations.some(function (mutation) {
              return (mutation.attributeName === 'disabled' && parent[0].disabled);
            })) {
              $timeout(function() {
                setVisible(false);
              }, 0);
          }
        });

        attributeObserver.observe(parent[0], { attributes: true});
      }

      // Store whether the element was focused when the window loses focus.
      var windowBlurHandler = function() {
        elementFocusedOnWindowBlur = document.activeElement === parent[0];
      };
      var elementFocusedOnWindowBlur = false;

      function windowScrollHandler() {
        setVisible(false);
      }

      ngWindow.on('blur', windowBlurHandler);
      ngWindow.on('resize', debouncedOnResize);
      document.addEventListener('scroll', windowScrollHandler, true);
      scope.$on('$destroy', function() {
        ngWindow.off('blur', windowBlurHandler);
        ngWindow.off('resize', debouncedOnResize);
        document.removeEventListener('scroll', windowScrollHandler, true);
        if (attributeObserver !== undefined) { attributeObserver.disconnect(); }
      });

      var enterHandler = function(e) {
        // Prevent the tooltip from showing when the window is receiving focus.
        if (e.type === 'focus' && elementFocusedOnWindowBlur) {
          elementFocusedOnWindowBlur = false;
          return;
        }
        parent.on('blur mouseleave touchend touchcancel', leaveHandler);
        setVisible(true);
      };
      var leaveHandler = function () {
        var autohide = scope.hasOwnProperty('autohide') ? scope.autohide : attr.hasOwnProperty('brAutohide');
        if (autohide || mouseActive || ($document[0].activeElement !== parent[0])) {
          parent.off('blur mouseleave touchend touchcancel', leaveHandler);
          parent.triggerHandler("blur");
          setVisible(false);
        }
        mouseActive = false;
      };

      // to avoid `synthetic clicks` we listen to mousedown instead of `click`
      parent.on('mousedown', function() { mouseActive = true; });
      parent.on('focus mouseenter touchstart', enterHandler);
    }


    function configureWatchers () {
      scope.$on('$destroy', function() {
        scope.visible = false;
        element.remove();
        angular.element($window).off('resize', debouncedOnResize);
      });
      scope.$watch('visible', function (isVisible) {
        if (isVisible) showTooltip();
        else hideTooltip();
      });
    }



    function setVisible (value) {
      setVisible.value = !!value;
      if (!setVisible.queued) {
        if (value) {
          setVisible.queued = true;
          $timeout(function() {
            scope.visible = setVisible.value;
            setVisible.queued = false;
          }, scope.delay);
        } else {
          $brUtil.nextTick(function() { scope.visible = false; });
        }
      }
    }


    function getParentWithPointerEvents () {
      var parent = element.parent();
      while (hasComputedStyleValue('pointer-events', 'none', parent)) {
        parent = parent.parent();
      }
      return parent;
    }



    function getNearestContentElement () {
      var current = element.parent()[0];
      while (current && current !== $rootElement[0] && current !== document.body) {
        current = current.parentNode;
      }
      return current;
    }

    function hasComputedStyleValue(key, value, target) {
      var hasValue = false;

      if ( target && target.length  ) {
        var computedStyles = $window.getComputedStyle(target[0]);
        hasValue = angular.isDefined(computedStyles[key]) && (value ? computedStyles[key] == value : true);
      }

      return hasValue;
    }


    function showTooltip() {
      // Insert the element before positioning it, so we can get the position
      // and check if we should display it
      tooltipParent.append(element);

      // Check if we should display it or not.
      // This handles hide-* and show-* along with any user defined css
      if ( hasComputedStyleValue('display','none') ) {
        scope.visible = false;
        element.detach();
        return;
      }

      positionTooltip();
      angular.forEach([element, background, content], function (element) {
        $animate.addClass(element, 'br-show');
      });
    }

    function hideTooltip() {
        var promises = [];
        angular.forEach([element, background, content], function (it) {
          if (it.parent() && it.hasClass('br-show')) {
            promises.push($animate.removeClass(it, 'br-show'));
          }
        });

        $q.all(promises)
          .then(function () {
            if (!scope.visible) element.detach();
          });
    }


    function positionTooltip() {
      var tipRect = $brUtil.offsetRect(element, tooltipParent);
      var parentRect = $brUtil.offsetRect(parent, tooltipParent);
      var newPosition = getPosition(direction);

      // If the user provided a direction, just nudge the tooltip onto the screen
      // Otherwise, recalculate based on 'top' since default is 'bottom'
      if (direction) {
        newPosition = fitInParent(newPosition);
      } else if (newPosition.top > element.prop('offsetParent').scrollHeight - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE) {
        newPosition = fitInParent(getPosition('top'));
      }

      element.css({top: newPosition.top + 'px', left: newPosition.left + 'px'});

      positionBackground();

      function positionBackground () {
        var size = direction === 'left' || direction === 'right' ? Math.sqrt(Math.pow(tipRect.width, 2) + Math.pow(tipRect.height / 2, 2)) * 2
              : Math.sqrt(Math.pow(tipRect.width / 2, 2) + Math.pow(tipRect.height, 2)) * 2,
            position = direction === 'left' ? { left: 100, top: 50 }
              : direction === 'right' ? { left: 0, top: 50 }
              : direction === 'top' ? { left: 50, top: 100 }
              : { left: 50, top: 0 };
        background.css({
          width: size + 'px',
          height: size + 'px',
          left: position.left + '%',
          top: position.top + '%'
        });
      }

      function fitInParent (pos) {
        var newPosition = { left: pos.left, top: pos.top };
        newPosition.left = Math.min( newPosition.left, tooltipParent.prop('scrollWidth') - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE );
        newPosition.left = Math.max( newPosition.left, TOOLTIP_WINDOW_EDGE_SPACE );
        newPosition.top  = Math.min( newPosition.top,  tooltipParent.prop('scrollHeight') - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE );
        newPosition.top  = Math.max( newPosition.top,  TOOLTIP_WINDOW_EDGE_SPACE );
        return newPosition;
      }

      function getPosition (dir) {
        return dir === 'left' ? { left: parentRect.left - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE,
              top: parentRect.top + parentRect.height / 2 - tipRect.height / 2 }
          : dir === 'right' ? { left: parentRect.left + parentRect.width + TOOLTIP_WINDOW_EDGE_SPACE,
              top: parentRect.top + parentRect.height / 2 - tipRect.height / 2 }
          : dir === 'top' ? { left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
              top: parentRect.top - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE }
          : { left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
              top: parentRect.top + parentRect.height + TOOLTIP_WINDOW_EDGE_SPACE };
      }
    }

  }
}
