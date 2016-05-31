/**
 * @ngdoc module
 * @name list
 */
angular
  .module('brMaterial')
  .directive('brList', listDirective)
  .directive('brItem', itemDirective);




/**
 * @ngdoc directive
 * @name brList
 * @module list
 *
 * @description
 * The `<br-list>` contains a list of items
 *
 * @param {model=} ng-model - Used to manage selected items
 * @param {function=} ng-change - `{@link https://docs.angularjs.org/api/ng/directive/ngChange Angular ngChange}`
 * @param {Number=} br-max-select - The maximum number of items allowed to be selected
 * @param {Boolean=} br-toggle-selection - Shows and hides checkboxes
 *
 * @usage
 * <hljs lang="html">
 * <br-list ng-model="theModel" br-max-select="1" br-toggle-select="theBoolValue">
 *  <br-item br-select="item.key" ng-repeat="item in list">
 *    <br-item-content>
 *      <div flex class="br-item-title">{{item.title}}</div>
 *      <div layout="row" layout-fill class="br-item-sub-title">
 *        <div>{{item.info}}</div>
 *        <div>{{item.other}}</div>
 *      </div>
 *    </br-item-content>
 *  </br-item>
 * </br-list>
 * </hljs>
 */
listDirective.$inject = ['$brTheme', '$brUtil', '$brMobile'];
function listDirective ($brTheme, $brUtil, $brMobile) {
  var directive = {
    restrict: 'E',
    require: ['brList', '?ngModel'],
    scope: {
      brToggleSelect: '='
    },
    link: link,
    controller: ['$scope', '$element', controller]
  };
  return directive;


  function link (scope, element, attr, ctrls) {
    $brTheme(element);

    if ($brMobile.isMobile === true) {
      element.addClass('br-touch');
    }

    var brListController = ctrls[0];
    var ngModelCtrl = ctrls[1] || $brUtil.fakeNgModel();
    brListController.init(ngModelCtrl);

    brListController.maxSelection = attr.brMaxSelection || undefined;

    var toggleSelect = attr.brToggleSelect || undefined;
    if (toggleSelect !== undefined) {
      element.addClass('br-hide-select');

      scope.$watch( function() { return scope.brToggleSelect; },
        function(value) {
          if (value === false) {
            brListController.isSelect = false;
            element.addClass('br-hide-select');
          } else {
            brListController.isSelect = true;
            element.removeClass('br-hide-select');
          }
        });
    }
  }


  function controller($scope, $element) {
    /* jshint validthis: true */
    var vm = this;

    vm.itemRenderFuncs = [];
    vm.hasAccent = $element.hasClass('br-accent');
    vm.hasWarn = $element.hasClass('br-warn');
    vm.isSelect = false;

    vm.init = init;
    vm.add = add;
    vm.remove = remove;
    vm.addViewValue = addViewValue;
    vm.removeViewValue = removeViewValue;
    vm.checkValue = checkValue;
    vm.blur = blur;



    function init(ngModelCtrl_) {
      vm.ngModelCtrl = ngModelCtrl_;
      vm.ngModelCtrl.$render = render;
    }

    function render() {
      var viewValue = vm.ngModelCtrl.$viewValue || [];

      vm.itemRenderFuncs.forEach(function (itemRender) {
        itemRender();
      });
    }

    function checkValue(value) {
      var viewValue = vm.ngModelCtrl.$viewValue || [];

      // filter out model if the length is greater that max selection
      if (viewValue.length > vm.maxSelection) {
        viewValue.splice(viewValue.indexOf(value), 1);
        return false;
      }

      if (viewValue.indexOf(value) > -1) {
        return true;
      }

      return false;
    }


    function add(renderFunc) {
      vm.itemRenderFuncs.push(renderFunc);
      renderFunc();
    }

    function remove(renderFunc) {
      var index = vm.itemRenderFuncs.indexOf(renderFunc);
      if (index !== -1) {
        vm.itemRenderFuncs.splice(index, 1);
      }
    }


    function addViewValue(value, eventType) {
      var viewValue = vm.ngModelCtrl.$viewValue || [];

      viewValue.push(value);
      vm.ngModelCtrl.$setViewValue(viewValue, eventType);

      // if selection is greater than max selection, remove the first item
      if (viewValue.length > vm.maxSelection) {
        viewValue.shift();
        render();
      }
    }

    function removeViewValue(value, eventType) {
      var viewValue = vm.ngModelCtrl.$viewValue || [];
      var index = viewValue.indexOf(value);

      if (index > -1) {
        viewValue.splice(index, 1);
        vm.ngModelCtrl.$setViewValue(viewValue, eventType);
      }
    }



    // garentee that only 1 row item is showing controlls at once
    // this is mainly a fix for mobile because the blur event does not alwaysp fire
    var blurFunc;
    function blur (func) {
      if (typeof blurFunc === 'function' && func !== blurFunc) {
        blurFunc();
      }

      blurFunc = func;
    }
  }
}






/**
 * @ngdoc directive
 * @name brItem
 * @module list
 *
 * @description
 * The `<br-item>` is the containing element for list items
 *
 * @param {string=} ng-repeat - `{@link https://docs.angularjs.org/api/ng/directive/ngRepeat Angular ngRepeat}`
 * @param {Number=} br-select - the value to use for selections
 *
 * @usage
 * <hljs lang="html">
 * <br-list ng-model="theModel" br-max-select="1" br-toggle-select="theBoolValue">
 *  <br-item br-select="item.key" ng-repeat="item in list">
 *    <br-item-content>
 *      <div flex class="br-item-title">{{item.title}}</div>
 *      <div layout="row" layout-fill class="br-item-sub-title">
 *        <div>{{item.info}}</div>
 *        <div>{{item.other}}</div>
 *      </div>
 *    </br-item-content>
 *  </br-item>
 * </br-list>
 * </hljs>
 */

 /**
  * @ngdoc directive
  * @name brItemContent
  * @module list
  *
  * @description
  * The `<br-item-content>` is the container for any content you want to display
  *
  * @usage
  * <hljs lang="html">
  * <br-list ng-model="theModel" br-max-select="1" br-toggle-select="theBoolValue">
  *  <br-item br-select="item.key" ng-repeat="item in list">
  *    <br-item-content>
  *      <div flex class="br-item-title">{{item.title}}</div>
  *      <div layout="row" layout-fill class="br-item-sub-title">
  *        <div>{{item.info}}</div>
  *        <div>{{item.other}}</div>
  *      </div>
  *    </br-item-content>
  *  </br-item>
  * </br-list>
  * </hljs>
  */

 /**
  * @ngdoc directive
  * @name brItemControls
  * @module list
  *
  * @description
  * The `<br-item-controls>` is an optional element to contain mobile hidden controls that show on swipe
  *
  * @usage
  * <hljs lang="html">
  * <br-list ng-model="theModel" br-max-select="1" br-toggle-select="theBoolValue">
  *  <br-item br-select="item.key" ng-repeat="item in list">
  *    <br-item-controls>
  *      <br-button class="br-primary br-raised">Edit</br-button>
  *    <br-item-controls>
  *    <br-item-content>
  *      <div flex class="br-item-title">{{item.title}}</div>
  *      <div layout="row" layout-fill class="br-item-sub-title">
  *        <div>{{item.info}}</div>
  *        <div>{{item.other}}</div>
  *      </div>
  *    </br-item-content>
  *  </br-item>
  * </br-list>
  * </hljs>
  */
itemDirective.$inject = ['$compile', '$brGesture', '$$rAF', '$brDialog', '$timeout'];
function itemDirective ($compile, $brGesture, $$rAF, $brDialog, $timeout) {
  var directive = {
    restrict: 'E',
    require: '^?brList',
    compile: compile,
    controller: ['$scope', controller]
  };
  return directive;




  function controller($scope) {
    /* jshint validthis: true */
    var vm = this;

    vm.blockDrag = function () {
      $scope.blockDrag();
    };

    vm.unblockDrag = function () {
      $scope.unblockDrag();
    };
  }


  function compile (tElement, tAttrs) {
    tElement.attr({
      tabIndex: 0,
      role: 'listitem'
    });

    return function link (scope, element, attr, listController) {
      if (listController === null) { return; }
      var selectTemplate;
      var maxWidth;
      var controlsWidth;
      var debouncedDrag;

      var brSelect = attr.brSelect;
      var selectClasses = 'br-primary';
      var controlsElement = element[0].querySelector('br-item-controls');
      var contentElement = element[0].querySelector('br-item-content');
      var selectElement;

      scope.blockDrag = blockDrag;
      scope.unblockDrag = unblockDrag;

      console.log(attr.brShowControlsClick);
      if (attr.brShowControlsClick !== undefined) {
        element.on('click', function () {
          showControls();
        });
      }

      // is br-select attricute is present add a checkbox
      if (brSelect !== undefined) {
        if (listController.hasAccent === true) { selectClasses = 'br-accent'; }
        else if (listController.hasWarn === true) { selectClasses = 'br-warn'; }

        scope._checked = false;

        selectTemplate = $compile('<div class="br-select"><br-checkbox br-no-click ng-checked="_checked" class="' + selectClasses + '"></br-checkbox></div>')(scope);
        element.append(selectTemplate);

        listController.add(renderCheckBox);

        selectTemplate
          .on('click', listener)
          .on('$destroy', function() {
            listController.remove(renderCheckBox);
          });
      }


      if (controlsElement) {
        maxWidth = element[0].offsetWidth || 0;
        controlsWidth = -controlsElement.scrollWidth || -controlsElement.offsetWidth;
        controlsElement.style.right = controlsWidth + 'px';

        debouncedDrag = $$rAF.throttle(drag);

        $brGesture.register(element, 'drag');
        element
          .on('$br.dragstart', dragStart)
          .on('$br.drag', debouncedDrag)
          .on('$br.dragend', dragEnd)
          .on('$br.scrollstart', scrollStart)
          .on('$br.scrollend', scrollEnd)
          .on('blur', blurControls);
      }


      if (attr.brRowSelect !== undefined) {
        element.on('click', listener);

        if (selectTemplate) {
          selectTemplate.addClass('br-no-event');
        }
      }



      // --- Select function ----------------


      function listener(ev) {
        scope._checked = !scope._checked;
        element.toggleClass('br-selected', scope._checked);

        scope.$apply(function () {
          if (scope._checked === true) {
            if ( listController.addViewValue(getValue()) === false ) {
              scope._checked = false;
            }
          } else {
            listController.removeViewValue(getValue());
          }
        });
      }

      function renderCheckBox() {
        var check = listController.checkValue(getValue());

        if (scope._checked !== check) {
          scope._checked = check;
        }

        element.toggleClass('br-selected', scope._checked);
      }


      function getValue() {
        if(brSelect !== '') {
          return scope.$eval(brSelect);
        }

        return scope.item;
      }





      // ---- Controll Interactions ---------


      var isDragging = false;
      var isScrolling = false;
      var isBlocking = false;
      var controlsStartX;
      var contentsStartX;
      var selectStartX;
      var controlsX;
      var contentX;
      var selectX;
      var controlsLastX;
      var contentLastX;
      var selectLastX;
      var normal;
      var eased;



      function scrollStart (e) {
        isScrolling = true;
      }

      function scrollEnd (e){
        isScrolling = false;
      }

      function blockDrag() {
        isBlocking = true;
      }

      function unblockDrag() {
        isBlocking = false;
      }


      function dragStart (e) {
        if (isScrolling === true || isBlocking === true) return;
        isDragging = true;
        element.addClass('br-dragging');

        controlsStartX = controlsLastX || parseInt(controlsElement.style.right) || 0;
        contentsStartX = contentLastX || parseInt(contentElement.style.left) || 0;

        if (selectTemplate !== undefined && listController.isSelect === true) {
          selectStartX = selectLastX || parseInt(selectTemplate[0].style.left) || 0;
        }
      }


      function dragEnd (e) {
        if (isDragging === false || isScrolling === true || isBlocking === true) return;
        isDragging = false;
        element.removeClass('br-dragging');

        if(e.pointer.velocityX > 1) {
          hideControls();
          return;

        } else if(e.pointer.velocityX < -1) {
          showControls();
          return;
        }

        if((controlsX / controlsWidth) > 0.5) {
          hideControls();
        } else if (controlsX !== undefined){
          showControls();
        }
      }



      function drag (e) {
        if(isDragging === false || isScrolling === true) return;

        controlsX = controlsStartX - e.pointer.distanceX;
        if(controlsX > 0) controlsX = 0;
        if(controlsX < controlsWidth) controlsX = controlsWidth;


        contentX = contentsStartX + e.pointer.distanceX;
        if(contentX < controlsWidth) {
          normal = (contentX - controlsWidth) / -maxWidth;
          eased = normal * (2 - normal);
          if(eased < 0) eased = 0;

          contentX = controlsWidth - ((maxWidth / 2) * eased);

        }else if(contentX > 0) {
          normal = contentX / maxWidth;
          eased = normal * (2 - normal);
          if(eased < 0) eased = 0;

          contentX = (maxWidth / 2) * eased;
        }

        if (selectTemplate !== undefined && listController.isSelect === true) {
          selectX = selectStartX + e.pointer.distanceX;
          if(selectX < controlsWidth) {
            normal = (selectX - controlsWidth) / -maxWidth;
            eased = normal * (2 - normal);
            if(eased < 0) eased = 0;

            selectX = controlsWidth - ((maxWidth / 2) * eased);

          }else if(selectX > 0) {
            normal = selectX / maxWidth;
            eased = normal * (2 - normal);
            if(eased < 0) eased = 0;

            selectX = (maxWidth / 2) * eased;
          }

          selectTemplate[0].style.left = selectX + 'px';
        }


        controlsElement.style.right = controlsX + 'px';
        contentElement.style.left = contentX + 'px';
      }


      function showControls(){
        controlsLastX = 0;
        contentLastX = 0;

        if (selectTemplate !== undefined && listController.isSelect === true) {
          selectLastX = 0;
          selectTemplate[0].style.left = selectLastX + 'px';
        }

        controlsElement.style.right = controlsLastX + 'px';
        contentElement.style.left = contentLastX + 'px';

        listController.blur(hideControls);
      }

      function hideControls(){
        controlsLastX = controlsWidth;
        contentLastX = 0;

        if (selectTemplate !== undefined && listController.isSelect === true) {
          selectLastX = 0;
          selectTemplate[0].style.left = selectLastX + 'px';
        }

        controlsElement.style.right = controlsLastX + 'px';
        contentElement.style.left = contentLastX + 'px';
      }


      function blurControls (e) {
        $timeout(function () {
          hideControls();
        }, 400);
      }


    };
  }
}
