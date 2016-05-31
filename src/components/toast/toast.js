/**
 * @ngdoc module
 * @name toast
 */
angular
  .module('brMaterial')
  .directive('brToast', toastDirective)
  .factory('$brToast', toastService);


var DEFAULT_DELAY = '1400';

/**
 * @ngdoc service
 * @name $brToast
 * @module toast
 *
 * @description
 * add toast notification
 *
 * @usage
 * <hljs lang="js">
 * angular.controller('MyCtrl', function ($brToast) {
 *  $brToast.add({
 *    message: 'The Toast Mesage'
 *  });
 * });
 * </hljs>
 */
toastService.$inject = ['$animateCss', '$compile', '$rootScope', '$document', '$brUtil', '$timeout'];
function toastService($animateCss, $compile, $rootScope, $document, $brUtil, $timeout) {
  var body = $document.find('body').eq(0);
  var isToast = false;
  var queue = [];

  var service = {
    add: add
  };
  return service;



  /**
   * @ngdoc method
   * @name $brToast#add
   * @function
   *
   * @description
   * add toast notification
   *
   * @param {object} options - options object
   * @param {string} options.message - Message to Display
   * @param {boolean=} options.primary - Primary color Background
   * @param {boolean=} options.accent - Accent color Background
   * @param {boolean=} options.warn - Warn color Background
   * @param {number=} options.delay - delay in ms before the toast dissapears
   * @param {string=} options.positionMode - DEFUALT: "left bottom"
   *
   * - "right top"
   * - "left top"
   * - "right bottom"
   * - "left bottom"
   */
  function add(options) {
    queue.push(options);
    nextToast();
  }

  function nextToast() {
    if (isToast === true) { return; }
    if (queue.length > 0) { showToast(queue.shift()); }
  }



  function showToast(options) {
    isToast = true;
    var template = '<br-toast class="hide br-alert">'+
      '<div class="br-toast-message">' + options.message + '</div>'+
      '<div class="br-toast-close" ng-click="remove()"></div>'+
    '</br-toast>';


    var scope = $rootScope.$new();
    scope.remove = remove;

    var toastElement = $compile(template)(scope);
    body.append(toastElement);

    if (options.warn === true) { toastElement.addClass('br-warn'); }
    if (options.primary === true) { toastElement.addClass('br-primary'); }
    if (options.accent === true) { toastElement.addClass('br-accent'); }

    // set one of for corner positions
    var position = getPosition(options);
    if (position.top !== undefined) {
      toastElement.css('top', position.top);
      toastElement.css('bottom', position.bottom);
    }
    if (position.left !== undefined) {
      toastElement.css('left', position.left);
      toastElement.css('right', position.right);
    }

    $animateCss(toastElement, {
      addClass: 'br-active',
      from: $brUtil.toCss(position),
      to: $brUtil.toCss({transform: ''})
    })
    .start()
    .then(function () {
      $timeout(remove, options.delay || DEFAULT_DELAY);
    });



    function remove() {
      if (scope === undefined) { return; }

      // toastElement.removeClass('br-active');
      $animateCss(toastElement, {
        addClass: 'br-leave',
        from: $brUtil.toCss({transform: ''}),
        to: $brUtil.toCss(position)
      })
      .start()
      .then(function () {
        toastElement.remove();
        scope = undefined;
        isToast = false;
        nextToast();
      });
    }
  }


  function getPosition(options) {
    var attachment = (options.positionMode || 'bottom left').split(' ');
    var position = {};
    var transformOrigin = 'top ';

    switch (attachment[1]) {
      case 'top':
        position.transform = 'translateY(-100px)';
        position.top = '8px';
        position.bottom = 'initial';
        break;
      case 'bottom':
        position.transform = 'translateY(100px)';
        break;
      default:
        position.transform = 'translateY(100px)';
    }


    switch (attachment[0]) {
      case 'left':
        transformOrigin += 'left';
        break;
      case 'right':
        position.right = '8px';
        position.left = 'initial';
        transformOrigin += 'right';
        break;
      default:
        transformOrigin += 'left';
    }

    position.transformOrigin = transformOrigin;
    return position;
  }
}






toastDirective.$inject = ['$brTheme'];
function toastDirective($brTheme) {
  var directive = {
    restrict: 'E',
    template: '',
    link: link
  };
  return directive;


  function link(scope, element, attr) {
    $brTheme(element);
  }
}
