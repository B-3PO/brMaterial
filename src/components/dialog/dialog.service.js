/**
 * @ngdoc module
 * @name dialog
 * @description
 * dialog
 */
angular
  .module('brMaterial')
  .factory('$brDialog', brDialogService);



/**
  * @ngdoc service
  * @name $brDialog
  * @module dialog
  *
  *
  * @description
  * This service will let you create a dialog popup with optional controls and templates.
  * You can also add an alert type that will display a temporary message. The alerts will queue.
  * you can call the $cancel and $continue in the tempalte to trigger there scope functions
  * cancel is called on the completion of the removal animation
  *
  * @usage
  * ### Baisc Message
  * This will give you a popup with a message and a continue and cancel button. The cancel button will close the dialog.
  *
  * <hljs lang="js">
  * $brDialog.add({
  * 	message: 'Hello World',
  * 	controls: true,
  *   scope: {
  * 	 continue: function () {
  *     $brDialog.remove();
  *    },
  *   }
  * });
  * </hljs>
  *
  * ### Advanced Message
  * You can control the text used on the default continue and cancel button
  *
  * <hljs lang="js">
  * $brDialog.add({
  * 	message: 'Hello World',
  * 	controls: {
  *		  continueLabel: 'Continue',
  * 		cancelLabel: 'Close'
  *	  },
  *   scope: {
  * 	 cancel: function () {},
  * 	 continue: function () {}
  *   },
  *   controller: function () {}
  * }).then(function () {
  *   // called post animation
  * });
  * </hljs>
  *
  * ### Templated
  * you can add controllers and locals to create a dialog directive
  *
  * <hljs lang="js">
  * $brDialog.add({
  * 	teplateURL: 'theurl.html',
  *   locals: {passedLocal: 'value'},
  *   controllerAs: 'vm',
  *   controller: ['$scope', 'passedLocal', function ($scope, passedLocal) {
  *   })
  * });
  * </hljs>
  *
  * ### Alert
  * Alerts will queue and play sequencially.
  *
  * <hljs lang="js">
  * $brDialog.alert('The Alert Message');
  * </hljs>
  *
  * ### Other
  * <hljs lang="js">
  * $brDialog.lock();
  * $brDialog.unlock();
  * $brDialog.remove().then(function () {
  *   // called post animation
  * });
  * </hljs>
  */
brDialogService.$inject = ['$brMobile', '$timeout', '$document', '$rootScope', '$compile', '$brTheme', '$animateCss', '$brUtil', '$q', '$controller', '$window'];
function brDialogService ($brMobile, $timeout, $document, $rootScope, $compile, $brTheme, $animateCss, $brUtil, $q, $controller, $window) {
  var body = $document.find('body').eq(0);
  var dialogBox;
  var alertBox;
  var alertQueue = [];
  var dialogMobileFill = $brTheme.dialogMobileFill;

  var service = {
    add: add,
    alert: alert,
    remove: remove,
    lock: lock,
    unlock: unlock,
    hasDialog: hasDialog,
    canRemove: canRemove
  };
  return service;



  function hasDialog() {
    return dialogBox !== undefined;
  }

  function canRemove() {
    return dialogBox !== undefined && dialogBox.scope().allowBack === undefined;
  }


  /**
   * @ngdoc method
   * @name $brDialog#add
   * @function
   *
   * @description
   * creates a dialog popup
   *
   * @param {object} options.message - Dialog options
   * @param {string=} [options.message] - contains text that will be displayed
   * @param {srting=} [options.template] - an html string to displayed
   * @param {string=} [options.templateUrl] - A path to a html file to load into the dialog
   * @param {boolean=} [options.controls] - show cancel and continue buttons, this will callback with tru/false
   * @param {object=} [options.controls] - An object containing lbels for the concel/continue controls
   * @param {string=} [options.controls.continueLabel] - Label for continue button. This will default to "Continue"
   * @param {string=} [options.controls.cancelLabel] - Label for continue button. This will default to "Continue"
   * @param {function=} [options.callback] - callback function that returns true/fasle
   * @param {number=} [options.width] - set the maxWidth of the dialog
   * @param {boolean=} [options.mobileFill] - this will turn the popup into a full page element if it is on a mobile touch device
   * @param {scope=} [options.scope] - an object of properties that will be made available on scope
   * @param {scope=} [options.controller] - a controller function or string name
   * @param {scope=} [options.controllerAs] - this will default to 'dialog' if not given
   * @param {scope=} [options.allowBack] - By default the browser back button will run cancel on the dialog and prevent navigation, you can turn this off
   *
   * @return {promise}
   */
  function add(options) {
    if (dialogBox) {
      console.log('$brDialog.add() : You cannot add more than one Dialog at a time');
      return;
    }

    options = options || {};

    // if none of these exist then a dialog box cannot be created
    if (!options.template && !options.templateUrl && !options.controls && !options.message) {
      console.log('$brDialog.add() : Is missing required paramters to create. Required One of the following: template, templateUrl, controls, message');
      return;
    }

    var scope = $rootScope.$new();
    angular.extend(scope, options.scope);
    scope._brLock = false;
    scope._brEvent = true;


    // check for mobile fill
    if (options.mobileFill === false || $brMobile.isMobile === false) {
      scope._brMobileFill = false;
    } else if (options.mobileFill === true && $brMobile.isMobile === true) {
      scope._brMobileFill = true;
    } else if (dialogMobileFill === true && $brMobile.isMobile === true) {
      scope._brMobileFill = true;
    }
    if (options.allowBack === true) { scope.allowBack = true; }

    var element = angular.element('<div>').html(getTemplate(options)).contents();
    var linkFunc = $compile(element);

    if (options.controller) {
      options.locals = options.locals || {};
      options.locals.$scope = scope;
      var invokeCtrl = $controller(options.controller, options.locals, true);
      var ctrl = invokeCtrl();
      element.data('$ngControllerController', ctrl);
      element.children().data('$ngControllerController', ctrl);
      scope[options.controllerAs || 'dialog'] = ctrl;
    }

    dialogBox = linkFunc(scope);
    addDialogStyle(dialogBox, options);
    body.append(dialogBox);

    var dialogContainer = angular.element(dialogBox[0].querySelector('.br-dialog-container'));
    dialogContainer.css('opacity', '1').css($brUtil.toCss({transform: 'translateY(' + $window.scrollY + 'px)'}));

    var dialogContent = angular.element(dialogBox[0].querySelector('.br-dialog-content'));
    return $animateCss(dialogContent, {
      addClass: 'br-active',
      from: getTargetPosition(),
      to: $brUtil.toCss({transform: ''})
    }).start().then(function () {
      scope.init();
    });


    function getTargetPosition() {
      var defaultAnim = $brUtil.toCss({transform: 'translate(-50%, -50%) scale(0.4)'});

      if (options.targetEvent === undefined) { return defaultAnim; }
      var target = $brUtil.getNode(options.targetEvent.target);
      if (target === undefined || target === null) { return defaultAnim; }

      var boundRect = dialogContainer[0].getBoundingClientRect();
      var originBnds = target.getBoundingClientRect();

      var dialogRect = dialogContent[0].getBoundingClientRect();
      var dialogCenterPt = centerPointFor(dialogRect);
      var originCenterPt = centerPointFor(originBnds);

      var zoomStyle = {
        centerX: originCenterPt.x - dialogCenterPt.x - (dialogRect.width / 2),
        centerY: originCenterPt.y - dialogCenterPt.y - (dialogRect.height / 2),
        scaleX: Math.round(100 * Math.min(0.5, originBnds.width / dialogRect.width)) / 100,
        scaleY: Math.round(100 * Math.min(0.5, originBnds.height / dialogRect.height)) / 100
      };

      return $brUtil.toCss({transform: 'translate3d(' + zoomStyle.centerX + 'px, ' + zoomStyle.centerY + 'px, 0) scale(' + zoomStyle.scaleX + ',0.4)'});
    }

  }

  function centerPointFor(targetRect) {
    return targetRect ? {
      x: Math.round(targetRect.left + (targetRect.width / 2)),
      y: Math.round(targetRect.top + (targetRect.height / 2))
    } : { x : 0, y : 0 };
  }

  function addDialogStyle(dialogBox, options) {
    var container = angular.element(dialogBox[0].querySelector('.br-dialog-content'));

    if (options.width !== undefined) {
      container.css('width', $brUtil.valueToCss(options.width));
    }

    if (options.maxWidth !== undefined) {
      container.css('max-width', $brUtil.valueToCss(options.maxWidth));
    }
  }





  /**
   * @ngdoc method
   * @name $brDialog#alert
   * @function
   *
   * @description
   * creates a alert dialog popup
   * a queue is created if more than one are added
   *
   * @param {string} [options.message] - contains text that will be displayed
   * @param {boolean} [options.mobileFill] - this will turn the popup into a full page element if it is on a mobile touch device
   */
  function alert (options) {
    // if none of these exist then a dialog box cannot be created
    if (typeof options === 'object' && options.message === undefined) {
      console.log('$brDialog.alert() : Is missing required paramter message');
      return;
    } else if (typeof options === 'string' && options === '') {
      console.log('$brDialog.alert() : Is missing message');
      return;
    }

    if (typeof options === 'string') {
      if(alertBox) {
        alertQueue.push([options, {}]);
        return;
      }
      displayAlert(options, {});
    } else {
      if(alertBox) {
        alertQueue.push([options.message, options]);
        return;
      }
      displayAlert(options.message, options);
    }
  }



  /**
   * @ngdoc method
   * @name $brDialog#lock
   * @function
   *
   * @description
   * turns off all click events for the curretn dialog popup
   */
  function lock() {
    if (dialogBox !== undefined && typeof dialogBox.scope === 'function') {
      dialogBox.scope().lock();
    }
  }


  /**
   * @ngdoc method
   * @name $brDialog#unlock
   * @function
   *
   * @description
   * turns on all click events for the current dialog popup
   */
  function unlock() {
    if (dialogBox !== undefined && typeof dialogBox.scope === 'function') {
      dialogBox.scope().unlock();
    }
  }


  /**
   * @ngdoc method
   * @name $brDialog#remove
   * @function
   *
   * @description
   * removes the current dialog popup
   */
  function remove () {
    if (dialogBox === undefined || typeof dialogBox.scope !== 'function') { return; }

    // document.activeElement.blur();
    angular.element(dialogBox[0].querySelector('.br-dialog-content')).addClass('br-leave');
    angular.element(dialogBox[0].querySelector('.br-dialog-container')).css('opacity', '0');

    return $q(function(resolve, reject) {
      if(!dialogBox) { reject('No Dialog Box'); }

      $timeout(function (){
        dialogBox.scope().$destroy();
        dialogBox.remove();
        dialogBox = undefined;
        resolve();
      }, 300);
    });
  }





  // --- Private -----------------


  function nextAlert(){
    var next = alertQueue.shift();
    displayAlert(next[0], next[1]);
  }


  function displayAlert(message, options) {
    var scope = $rootScope.$new();

    // check for mobile fill
    if (options.mobileFill === false || $brMobile.isMobile === false) {
      scope._brMobileFill = false;
    } else if (options.mobileFill === true && $brMobile.isMobile === true) {
      scope._brMobileFill = true;
    } else if (dialogMobileFill === true && $brMobile.isMobile === true) {
      scope._brMobileFill = true;
    }

    var template = '<br-dialog class="hide br-alert">'+
      '<div class="br-dialog-label">' + message + '</div>'+
    '</br-dialog>';

    alertBox = $compile(template)(scope);
    body.append(alertBox);

    angular.element(alertBox[0].querySelector('.br-dialog-container')).css('opacity', '1').css($brUtil.toCss({transform: 'translateY(' + $window.scrollY + 'px)'}));

    $animateCss(angular.element(alertBox[0].querySelector('.br-dialog-content')), {
      addClass: 'br-active',
      from: $brUtil.toCss({transform: 'translate(-50%, -50%) scale(0.4)'}),
      to: $brUtil.toCss({transform: 'translate(-50%, -50%) scale(1)'})
    })
    .start()
    .then(function () {
      scope.init(true);
    });

    $timeout(function(){
      removeAlert();
    }, 3500);
  }


  // remove alert box and call the next alert if one exists
  function removeAlert(){
    if(!alertBox) return;

    document.activeElement.blur();
    alertBox.scope()._brShow = false;
    alertBox.scope()._brEvent = false;

    $timeout(function (){
      alertBox.scope().$destroy();
      alertBox.remove();
      alertBox = undefined;

      if(alertQueue.length > 0) nextAlert();
    }, 220);
  }



  // creat template for dialog box and add()
  function getTemplate(options) {
    var template = '<br-dialog class="hide" ng-class="_brLock ? \'br-lock\' : \'\'">';

    if(options.template) {
      template += options.template;
    } else if(options.templateUrl) {
      template += '<ng-include src="\'' + options.templateUrl + '\'"></ng-include>';
    } else if(options.message) {
      template += '<div class="br-dialog-label">' + options.message + '</div>';
    }

    if(options.controls) {
      var continueLabel = options.controls.continueLabel || 'Continue';
      var cancelLable = options.controls.cancelLabel || 'Cancel';

      template += '<div layout="row" layout-align="center" layout-full>';
      template += '<br-button class="br-primary" ng-click="$continue()">' + continueLabel + '</br-button>';
      template += '<br-button class="br-warn" ng-click="$cancel()">' + cancelLable + '</br-button>';
      template += '</div>';
    }

    template += '</br-dialog>';

    return template;
  }

}
