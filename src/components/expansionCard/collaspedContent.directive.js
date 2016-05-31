angular
  .module('brMaterial')
  .directive('brCollapsedContent', collapsedContentDirective);


collapsedContentDirective.$injeect = ['$timeout', '$animateCss', '$brUtil'];
function collapsedContentDirective($timeout, $animateCss, $brUtil) {
  var directive = {
    restrict: 'E',
    transclude: true,
    template: '<div class="br-collapsed-content" ng-transclude></div>',
    require: '^brExpansionCard',
    link: link
  };
  return directive;

  function link(scope, element, attrs, ecCtrl) {
    var container = angular.element(element[0].querySelector('.br-collapsed-content'));
    var color = attrs.brColor !== undefined ? '#' + attrs.brColor.replace('#', '') : undefined;
    scope.$expand = ecCtrl.expand;
    scope.$card = ecCtrl.$card;
    ecCtrl.collaspedCtrl = {
      show: show,
      hide: hide,
      flash: flash
    };

    element.on('click', function () {
      ecCtrl.expand();
    });


    function hide() {
      container.removeClass('br-show');
      container.addClass('ng-hide');
    }

    function show() {
      var fromProps = $brUtil.toCss({transform: 'translate3d(0,4px,0)'});
      fromProps.opacity = 0;
      var toProps = $brUtil.toCss({transform: 'translate3d(0,0,0)'});
      toProps.opacity = 1;

      if (color !== undefined) {
        fromProps.background = '#FFFFFF';
        toProps.background = color;
      }

      container.removeClass('ng-hide');
      container.addClass('br-show');
      $animateCss(container, {
        from: fromProps,
        to: toProps
      })
      .start();
    }

    function flash() {
      $animateCss(container, {
        addClass: 'br-flash',
        duration: 1.2
      })
      .start()
      .then(function () {
        container.removeClass('br-flash');
      });
    }
  }
}
