/**
 * @ngdoc module
 * @name content
 * @description
 * content
 */
angular
  .module('brMaterial')
  .directive('brContent', brContentDirective);



/**
 * @ngdoc directive
 * @name brContent
 * @module content
 *
 *
 * @description
 * The `<br-content>` is a general container, this is used to wrap sticky headers, tables, or any set of scrolling elements
 *
 * @param {boolean=} br-auto-height - If this exits `<br-content>` will automatically fill the avalable viewable space and set its height propery
 * @param {boolean=} br-scroll-fix - Stop scrolling from continuing to the next element with scroll
 * @param {boolean=} br-scroll-y - Sets the overflow for scrolling vertically
 * @param {boolean=} br-scroll-x - Sets the overflow for scrolling horizontally
 *
 * @usage
 * ### Basic
 * You can wrap anything with `<br-content>` to create a scrollable container.
 *
 * <hljs lang="html">
 * <br-content style="height: 400px;" br-scroll-y>
 *  <!-- html goes here -->
 * </br-content>
 * </hljs>
 *
 * ### Sticky Haaders
 * If You place `<br-subheader>` inside of `<br-content>` they will act as sticky headers
 * <hljs lang="html">
 *
 * <br-content style="height: 400px;" br-scroll-y>
 *  <br-subheader>Title</br-subheader>
 *  <!-- html goes here -->
 *  <br-subheader>Title 2</br-subheader>
 *  <!-- html goes here -->
 * </br-content>
 * </hljs>
 */
brContentDirective.$inject = ['$brTheme', '$window', '$$rAF', '$brUtil'];
function brContentDirective ($brTheme, $window, $$rAF, $brUtil) {
  var directive = {
    restrict: 'E',
    link: link,
    controller: ['$element', controller]
  };
  return directive;


  function link (scope, element, attrs) {
    $brTheme(element);

    var isAutoHeight = attrs.brAutoHeight !== undefined;
    var height = element.css('height') || undefined;

    if (height === undefined && isAutoHeight === false) {
      var overflowParent = getOverflowParent();

      if(overflowParent !== undefined) {
        scope.$watch(function () { return overflowParent[0].offsetHeight; }, function (data) {
          element.css('height', data + 'px');
        });
      }

    } else if (height === undefined && isAutoHeight === true) {
      var isCardChild = $brUtil.getClosest(element, 'br-expanded-content') !== null;
      var debouncedUpdateAll = $$rAF.throttle(updateAll);
      debouncedUpdateAll();

      scope.$watch(function () { return element[0].offsetHeight; }, function (data){
        debouncedUpdateAll();
      });

      angular.element($window).on('resize', debouncedUpdateAll);
      scope.$on('$destroy', function () {
        angular.element($window).off('resize', debouncedUpdateAll);
      });
    }


    if (attrs.brScrollFix !== undefined) { iosScrollFix(element[0]); }



    function updateAll() {
      var rect = element[0].getBoundingClientRect();
      var innerHeight = $window.innerHeight;
      if (isCardChild === true) {
        innerHeight -= 30;
      }

      element.css('height', (innerHeight - rect.top) + 'px');
    }


    function getOverflowParent() {
      var parent = element.parent();

      while (parent !== undefined && hasComputedStyleValue('overflowY', parent[0]) === false) {
        if (parent[0] === document) {
          parent = undefined;
        } else {
          parent = parent.parent();
        }
      }

      return parent;
    }


    function hasComputedStyleValue (key, target) {
      key = attrs.$normalize(key);
      target = target || element[0];

      if(target === document) { return false; }
      var computedStyles = $window.getComputedStyle(target);

      return angular.isDefined(computedStyles[key]) && (computedStyles[key] == 'scroll' || computedStyles[key] == 'auto');
    }



    function iosScrollFix(node){
      angular.element(node).on('$br.pressdown', function (ev) {
        if (ev.pointer.type !== 't') return;
        if (ev.$brMaterialScrollFixed) return;
        ev.$brMaterialScrollFixed = true;

        if (node.scrollTop === 0) {
          node.scrollTop = 1;
        } else if (node.scrollHeight === node.scrollTop + node.offsetHeight) {
          node.scrollTop -= 1;
        }
      });
    }
  }


  function controller ($element) {
    /*jshint validthis: true */
    var vm = this;

    // expose for $brSticky
    vm.$element = $element;
  }

}
