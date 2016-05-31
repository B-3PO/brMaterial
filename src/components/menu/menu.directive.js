/**
 * @ngdoc module
 * @name menu
 */
angular
  .module('brMaterial')
  .directive('brMenu', brMenuDirective);



/**
 * @ngdoc directive
 * @name brMenu
 * @module menu
 *
 * @param {string=} br-position-mode - A space seperated string to declare what the origin for the animation is
 *
 * - "target target"
 * - "right top"
 * - "left top"
 * - "target top"
 * - "right bottom"
 * - "left bottom"
 * - "target bottom"
 * - "left target"
 * - "right target"
 *
 * @param {string=} br-offset - A space seperated string to declare what the menu offsets are in pixels
 *
 * @description
 * The `<br-menu>` directive provides a popout menu
 * You can call `$brOpenMenu()` inside the directive. you have the option of passing in `$event` to have the menu align to current target
 *
 * @usage
 * <hljs lang="html">
 * <br-menu br-position-mode="right target">
 *   <br-button ng-click="$brOpenMenu($event)" class="br-no-margin br-circle br-small"><br-icon br-font-icon="more_vert"></br-icon></br-button>
 *   <br-menu-content>
 *     <br-menu-item>
 *       <br-button ng-click=""><br-icon br-font-icon="edit" br-size="20"></br-icon>Change Image</br-button>
 *     </br-menu-item>
 *     <br-menu-item>
 *       <br-button ng-click=""><br-icon br-font-icon="add" br-size="20"></br-icon>Upload Image</br-button>
 *     </br-menu-item>
 *   </br-menu-content>
 * </br-menu>
 * </hljs>
 */
brMenuDirective.$inject = ['$document', '$brTheme', '$brBackdrop', '$animateCss', '$brUtil', '$window'];
function brMenuDirective ($document, $brTheme, $brBackdrop, $animateCss, $brUtil, $window) {
  var directive = {
    restrict: 'E',
    scope: true,
    compile: compile
  };
  return directive;


  function compile (tElement, tAttrs) {
    if (tElement.children().length !== 2) {
      throw Error('Invalid HTML for br-menu: Expected two child elements.');
    }

    tElement.addClass('br-menu');

    return function postLink (scope, element, attrs) {
      var MENU_EDGE_MARGIN = 8;

      var isOpen = false;
      var wasAppended = false;

      var triggerElement = element.children()[0];
      if (!triggerElement.hasAttribute('ng-click')) {
        triggerElement = triggerElement.querySelector('[ng-click],[ng-mouseenter]') || triggerElement;
      }


      var menuContainer = angular.element('<div class="br-open-menu-container"></div>');
      var menuContainerId = 'menu_container_' + $brUtil.nextUid();
      var menuContents = element.children()[1];
      if (!menuContents.hasAttribute('role')) {
        menuContents.setAttribute('role', 'menu');
      }
      menuContainer.attr('id', menuContainerId);
      menuContainer.append(menuContents);

      element.on('$destroy', function () {
        menuContainer.remove();
      });

      element.append(menuContainer);
      menuContainer[0].style.display = 'none';




      scope.$brOpenMenu = open;
      function open (event) {
        if (event) {
          event.stopPropagation();
          event.preventDefault();
        }

        if (isOpen) { return; }

        triggerElement = triggerElement || (event ? event.target : element[0]);

        // add menu to body if not added yet
        if (wasAppended === false) {
          $document.find('body').eq(0).append(menuContainer);
          wasAppended = true;
        }

        $brTheme.inherit(angular.element(menuContents), menuContainer);
        menuContainer[0].style.display = '';
        var position = calculateMenuPosition(menuContainer);

        menuContainer.removeClass('br-leave');
        $brBackdrop.add(menuContainer, scope, close);

        $animateCss(menuContainer, {
          addClass: 'br-active',
          from: $brUtil.toCss(position),
          to: $brUtil.toCss({transform: ''})
        })
        .start()
        .then(function () {
          menuContents.addEventListener('click', captureClickListener, true);
          menuContainer.addClass('br-clickable');
        });

        isOpen = true;
      }




      function close () {
        if ( !isOpen ) return;
        isOpen = false;

        menuContainer.removeClass('br-clickable');
        menuContents.removeEventListener('click', captureClickListener, true);

        $animateCss(menuContainer, {addClass: 'br-leave'})
          .start()
          .then(function () {
            menuContainer.removeClass('br-active');
            menuContainer[0].style.display = 'none';
            $brBackdrop.remove();
          });
      }



      // Close menu on menu item click, if said menu-item is not disabled
      function captureClickListener (event) {
        var target = event.target;

        do {
          if (target === menuContents) { return; }
          if ((hasAnyAttribute(target, ['ng-click', 'ng-href']) || target.nodeName == 'BUTTON' || target.nodeName == 'BR-BUTTON')) {
            if (!target.hasAttribute('disabled')) {
              closeApply();
            }
            break;
          }

          target = target.parentNode;
        } while (target);


        function closeApply() {
          scope.$apply(function() {
            close();
          });
        }

        function hasAnyAttribute (target, attrs) {
          if (!target) return false;
          var j;
          var i;
          var altForms;
          var attr;
          var rawAttr;

          for (i = 0; i < attrs.length; ++i) {
            attr = attrs[i];
            altForms = [attr, 'data-' + attr, 'x-' + attr];

            for (j = 0; j < altForms.length; ++j) {
              rawAttr = altForms[j];
              if (target.hasAttribute(rawAttr)) {
                return true;
              }
            }
          }

          return false;
        }
      }



      function getPositionMode () {
        var attachment = (attrs.brPositionMode || 'target').split(' ');

        // If attachment is a single item, duplicate it for our second value.
        // ie. 'target' -> 'target target'
        if (attachment.length === 1) {
          attachment.push(attachment[0]);
        }

        return {
          left: attachment[0],
          top: attachment[1]
        };
      }



      function getOffsets() {
        var position = (attrs.brOffset || '0 0').split(' ').map(parseFloat);
        if (position.length == 2) {
          return {
            left: position[0],
            top: position[1]
          };
        } else if (position.length == 1) {
          return {
            top: position[0],
            left: position[0]
          };
        } else {
          throw Error('Invalid offsets specified. Please follow format <x, y> or <n>');
        }
      }


      function calculateMenuPosition (containerElement) {
        var containerNode = containerElement[0];
        var openMenuNode = containerElement[0].firstElementChild;
        var openMenuNodeRect = openMenuNode.getBoundingClientRect();
        var boundryNode = $document[0].body;
        var boundryNodeRect = boundryNode.getBoundingClientRect();
        var menuStyle = $window.getComputedStyle(openMenuNode);
        var originNode = triggerElement.querySelector('[br-menu-origin]') || triggerElement;
        var originNodeRect = originNode.getBoundingClientRect();


        var bounds = {
          left: boundryNodeRect.left + MENU_EDGE_MARGIN,
          top: Math.max(boundryNodeRect.top, 0) + MENU_EDGE_MARGIN,
          bottom: Math.max(boundryNodeRect.bottom, Math.max(boundryNodeRect.top, 0) + boundryNodeRect.height) - MENU_EDGE_MARGIN,
          right: boundryNodeRect.right - MENU_EDGE_MARGIN
        };


        var alignTarget, alignTargetRect = { top:0, left : 0, right:0, bottom:0 }, existingOffsets  = { top:0, left : 0, right:0, bottom:0  };
        var positionMode = getPositionMode();


        alignTarget = firstVisibleChild();
        if ( alignTarget ) {
          // TODO: Allow centering on an arbitrary node, for now center on first menu-item's child
          alignTarget = alignTarget.firstElementChild || alignTarget;
          alignTarget = alignTarget.querySelector('[br-menu-align-target]') || alignTarget;
          alignTargetRect = alignTarget.getBoundingClientRect();

          existingOffsets = {
            top: parseFloat(containerNode.style.top || 0),
            left: parseFloat(containerNode.style.left || 0)
          };
        }


        var position = {};
        var transformOrigin = 'top ';

        switch (positionMode.top) {
          case 'target':
          case 'top':
            position.top = existingOffsets.top + originNodeRect.top - alignTargetRect.top;
            break;
          case 'bottom':
            position.top = originNodeRect.top + originNodeRect.height;
            break;
          default:
            throw new Error('Invalid target mode "' + positionMode.top + '" specified for br-menu on Y axis.');
        }


        switch (positionMode.left) {
          case 'target':
          case 'left':
            position.left = existingOffsets.left + originNodeRect.left - alignTargetRect.left;
            transformOrigin += 'left';
            break;
          case 'right':
            position.left = originNodeRect.right - openMenuNodeRect.width + (openMenuNodeRect.right - alignTargetRect.right);
            transformOrigin += 'right';
            break;
          default:
            throw new Error('Invalid target mode "' + positionMode.left + '" specified for br-menu on X axis.');
        }


        var offsets = getOffsets();
        position.top += offsets.top;
        position.left += offsets.left;

        clamp(position);

        var scaleX = Math.round(100 * Math.min(originNodeRect.width / containerNode.offsetWidth, 1.0)) / 100;
        var scaleY = Math.round(100 * Math.min(originNodeRect.height / containerNode.offsetHeight, 1.0)) / 100;


        return {
          top: Math.round(position.top),
          left: Math.round(position.left),

          // Animate a scale out if we aren't just repositioning
          transform: isOpen === false ? 'scale(' + scaleX + ', ' + scaleY + ')' : undefined,
          transformOrigin: transformOrigin
        };



        /**
         * Clamps the repositioning of the menu within the confines of
         * bounding element (often the screen/body)
         */
        function clamp(pos) {
          pos.top = Math.max(Math.min(pos.top, bounds.bottom - containerNode.offsetHeight), bounds.top);
          pos.left = Math.max(Math.min(pos.left, bounds.right - containerNode.offsetWidth), bounds.left);
        }

        /**
         * Gets the first visible child in the openMenuNode
         * Necessary incase menu nodes are being dynamically hidden
         */
        function firstVisibleChild() {
          for (var i = 0; i < openMenuNode.children.length; ++i) {
            if ($window.getComputedStyle(openMenuNode.children[i]).display !== 'none') {
              return openMenuNode.children[i];
            }
          }
        }
      }

    };
  }
}
