angular
  .module('brMaterial')
  .directive('brDialog', brDialogDirective)
  .run(['$rootScope', '$brDialog', function ($rootScope, $brDialog) {
    $rootScope.$on( "$locationChangeStart", function (event, next, current) {
      if (next === current) { return; }

      if ($brDialog.canRemove() === true) {
        event.preventDefault();
        $brDialog.remove();
      }
    });
  }]);

brDialogDirective.$inject = ['$brTheme', '$brDialog', '$$rAF', '$window', '$brUtil', '$brMobile'];
function brDialogDirective ($brTheme, $brDialog, $$rAF, $window, $brUtil, $brMobile) {
  var directive ={
    restrict: 'E',
    transclude: true,
    template:
      '<div class="br-dialog-container">'+
        '<div class="br-dialog-content">'+
          '<ng-transclude class="br-dialog-transclude"></ng-transclude>'+
        '</div>'+
      '</div>',
    link: link
  };
  return directive;


  function link (scope, element, attrs) {
    var containerElement = element[0].querySelector('.br-dialog-container');
    var containerElementAngular = angular.element(containerElement);
    var contentElement = element[0].querySelector('.br-dialog-content');
    var debouncedUpdateAll = $$rAF.throttle(updateAll);

    var updateTopPos = $$rAF.throttle(function () {
      containerElementAngular.css($brUtil.toCss({transform: 'translateY(' + $window.scrollY + 'px)'}));
    });

    $brTheme(element);
    element.removeClass('hide');

    if(scope._brMobileFill) {
      element.addClass('br-mobile-fill');
    }


    scope.remove = function (){
      $brDialog.remove();
    };

    scope.$cancel = function (){
      $brDialog
        .remove()
        .then(function () {
          if (typeof scope.cancel === 'function') { scope.cancel(); }
        });
    };

    scope.$continue = function () {
      $brDialog
        .remove()
        .then(function () {
          if (typeof scope.continue === 'function') { scope.continue(); }
        });
    };

    scope.scrollToBottom = function (){
      containerElement.scrollTop = containerElement.scrollHeight;
    };

    scope.isDialogScroll = function () {
      return containerElement.scrollHeight > containerElement.offsetHeight;
    };

    scope.lock = function () {
      angular.element(containerElement).addClass('br-no-event');
    };

    scope.unlock = function () {
      angular.element(containerElement).removeClass('br-no-event');
    };


    scope.init = function (isAlert) {
      // call update function to see if scrolling needs to be enabled
      scope.$watch(function(){return contentElement.offsetHeight;}, function (data){
        debouncedUpdateAll();
      });
      angular.element($window).on('resize', debouncedUpdateAll);
      angular.element($window).on('wheel touchmove', updateTopPos);
      scope.$on('$destroy', function () {
        angular.element($window).off('resize', debouncedUpdateAll);
        angular.element($window).off('wheel touchmove', updateTopPos);
      });

      updateAll();
    };

    function updateAll () {
      if (contentElement.offsetHeight >= containerElement.scrollHeight) {
        element.addClass('br-overflow-y');
        angular.element(contentElement).css('transform', '');
      } else {
        element.removeClass('br-overflow-y');
      }

      updateTopPos();
    }
  }
}
