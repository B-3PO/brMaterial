/**
 * @ngdoc module
 * @name button
 */
angular
  .module('brMaterial')
  .directive('button', buttonExtendDirective)
  .directive('brButton', brButtonDirective);






buttonExtendDirective.$inject = ['$brTheme'];
function buttonExtendDirective($brTheme) {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    if (!element.hasClass('br-button') && attrs.brNoStyle === undefined) {
      $brTheme(element);
      element.addClass('br-button');
    }
  }
}



/**
 * @ngdoc directive
 * @name brButton
 * @module button
 *
 * @description
 * The `<br-button>` can be a button with txt, icons, or anything else you want. The button type will default to `[type="button"]`
 *
 * @param {boolean=} br-no-style - removes material style from the standard HTML button
 * @param {boolean=} ng-disabled - `{@link https://docs.angularjs.org/api/ng/directive/ngDisabled Angular ngDisabled}`
 * @param {function=} ng-click - `{@link https://docs.angularjs.org/api/ng/directive/ngClick Angular ngClick}`
 * @param {string=} ng-href - `{@link https://docs.angularjs.org/api/ng/directive/ngHref Angular ngHref}`
 *
 * @usage
 * #### Class Names
 * Buttons can have all the main theme classes applied to them
 *  - `br-raised` - Adds backround to button
 *  - `br-primary` - Themes primary color
 *  - `br-accent` - Themes accent color
 *  - `br-warn` - Themes warn color
 *  - `br-circle` - Makes button a circle
 *  - `br-small` - Makes button a smaller circle
 *  - `br-fill` - Makes button stretch to the full width of its container
 *  - `br-shadow` - Add drop shadow to button
 *  - `br-no-radius` - Remove border radius
 *  - `br-no-padding` - Remove padding
 *  - `br-no-margin` - Remove margin
 *
 * <hljs lang="html">
 * <br-button>button</br-button>
 * <br-button class="br-primary">Primary button</br-button>
 * <br-button class="br-primary br-rasied">Primary Raised button</br-button>
 * <br-button class="br-circle br-small"><br-icon br-icon-font="edit"></br-icon></br-button>
 * <br-button class="br-accent br-rasied"><br-icon br-icon-font="add"></br-icon>Icon & Text button</br-button>
 * </hljs>
 */
brButtonDirective.$inject = ['$brTheme', '$timeout', '$brRippleService'];
function brButtonDirective ($brTheme, $timeout, $brRippleService) {
  var directive = {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: getTemplate,
		link: link
  };
  return directive;





  function isAnchor (attr) {
    return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref) || angular.isDefined(attr.ngLink);
  }

  function getTemplate (element, attr) {
    if (isAnchor(attr)) {
      return '<a class="br-button" ng-transclude></a>';
    } else {
      // If buttons don't have type="button", they will submit forms automatically.
      var btnType = (typeof attr.type === 'undefined') ? 'button' : attr.type;
      return '<button class="br-button" type="' + btnType + '" ng-transclude></button>';
    }
  }


  function link (scope, element, attr) {
    $brTheme(element);
    $brRippleService.attach(scope, element);

    // For anchor elements, we have to set tabindex manually when the
    // element is disabled
    if (isAnchor(attr) && angular.isDefined(attr.ngDisabled) ) {
      scope.$watch(attr.ngDisabled, function (isDisabled) {
        element.attr('tabindex', isDisabled ? -1 : 0);
      });
    }


    // disabling click event when disabled is true
    element.on('click', function(e){
      if (attr.disabled === true) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });

    // restrict focus styles to the keyboard
    var mouseActive = false;
    element.on('mousedown', function() {
        mouseActive = true;
        $timeout(function () {
          mouseActive = false;
        }, 100);
      })
      .on('focus', function () {
        if (mouseActive === false) {
          element.addClass('br-focused');
        }
      })
      .on('blur', function (ev) {
        element.removeClass('br-focused');
      });
  }
}
