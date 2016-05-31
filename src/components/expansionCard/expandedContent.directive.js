angular
  .module('brMaterial')
  .directive('brExpandedContent', expandedContentDirective);


expandedContentDirective.$inject = ['$animateCss', '$brUtil', '$timeout'];
function expandedContentDirective($animateCss, $brUtil, $timeout) {
  var directive = {
    restrict: 'E',
    transclude: true,
    template: '<div class="br-expanded-content" ng-transclude></div>',
    require: '^brExpansionCard',
    link: link
  };
  return directive;

  function link(scope, element, attrs, ecCtrl) {
    var container = angular.element(element[0].querySelector('.br-expanded-content'));

    scope.$collapse = ecCtrl.collapse;
    scope.$card = ecCtrl.$card;
    ecCtrl.expandedCtrl = {
      show: show,
      hide: hide
    };
    disableSubHeaders();

    function show() {
      enableSubHeaders();

      container.addClass('br-show');

      // minus 24 to compensate for the margin and padding
      var height = container[0].scrollHeight - 24;
      // var fromProps = $brUtil.toCss({height: 80, transform: 'translate3d(0,12px,0)'});
      var fromProps = $brUtil.toCss({height: 80, transform: 'translate3d(0,0,0)'});
      fromProps.opacity = 0;
      fromProps.marginLeft = '16px';
      fromProps.marginRight = '16px';

      // var toProps = $brUtil.toCss({height: height, transform: 'translate3d(0,16px,0)'});
      var toProps = $brUtil.toCss({height: height, transform: 'translate3d(0,-2px,0)'});
      fromProps.opacity = 1;
      toProps.marginLeft = '4px';
      toProps.marginRight = '4px';

      container.addClass('br-overflow');
      $animateCss(container, {
        from: fromProps,
        to: toProps
      })
      .start()
      .then(function () {
        container.removeClass('br-overflow');
        container.css('height', 'auto');
      });
    }

    function hide() {
      disableSubHeaders();

      // minus 24 to compensate for the margin and padding
      var height = container[0].scrollHeight - 24;

      // var fromProps = $brUtil.toCss({height: height, transform: 'translate3d(0,16px,0)'});
      var fromProps = $brUtil.toCss({height: height, transform: 'translate3d(0,2px,0)'});
      fromProps.marginLeft = '4px';
      fromProps.marginRight = '4px';
      fromProps.opacity = 1;

      // var toProps = $brUtil.toCss({height: 80, transform: 'translate3d(0,12px,0)'});
      var toProps = $brUtil.toCss({height: 80, transform: 'translate3d(0,0,0)'});
      toProps.marginLeft = '16px';
      toProps.marginRight = '16px';
      toProps.opacity = 0;

      container.removeClass('br-show');
      container.addClass('br-hide');
      container.addClass('br-overflow');
      $animateCss(container, {
        from: fromProps,
        to: toProps
      })
      .start()
      .then(function () {
        container.removeClass('br-hide');
        container.removeClass('br-overflow');
      });
    }




    function disableSubHeaders() {
      runOnSubHeaders(function (el) {
        el.attr('br-no-sticky', 'true');
      });
    }

    function enableSubHeaders() {
      runOnSubHeaders(function (el) {
        el.removeAttr('br-no-sticky');
      });
    }


    function runOnSubHeaders(func) {
      var i = 0;
      var subheaders = element[0].querySelectorAll('.br-subheader');
      var length = subheaders.length;

      while (i < length) {
        func(angular.element(subheaders[i]));
        i++;
      }
    }
  }
}
