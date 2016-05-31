/**
 * @ngdoc module
 * @name select
 */
angular
  .module('brMaterial')
  .directive('select', selectAugmentDirective)
  .directive('brSelect', selectDirective);



selectAugmentDirective.$inject = ['$brUtil', '$compile'];
function selectAugmentDirective($brUtil, $compile) {
  var directive = {
    restrict: 'E',
    scope: true,
    require: ['^?brSelect', '?ngModel'],
    link: link
  };

  return directive;


  function link(scope, element, attr, ctrls) {
    var containerCtrl = ctrls[0];
    var ngModelCtrl = ctrls[1] || $brUtil.fakeNgModel();
    var isReadonly = attr.readonly !== undefined;

    if (attr.tabindex === undefined) {
      attr.$set('tabindex', 0);
    }

    if ( !containerCtrl ) {
      if (attr.brNoStyle === undefined) { element.addClass('br-select-standard'); }
      return;
    }

    var errorsSpacer = angular.element('<div class="br-errors-spacer">');
    element.after(errorsSpacer);

    containerCtrl.selectElement = element;

    var ngOptionsHelper = $brUtil.ngOptionsHelper(attr.ngOptions, scope);


    // add placeholder if it exists and ng model is empty
    var placeholder = attr.placeholder || '';
    if (attr.placeholder !== undefined) {
      scope.selectText = placeholder;
      element.removeAttr('placeholder');
      containerCtrl.setHasPlaceholder(true);
    } else {
      placeholder = containerCtrl.label;
    }


    var valueElement = $compile('<div class="br-select-content"><span>{{selectText}}</span><div class="br-select-icon"></div></div>')(scope);
    element.after(valueElement);

    attr.$observe('disabled', function (disabled) {
      valueElement.toggleClass('br-disabled', !!disabled);
      if (disabled === true) {
        element
          .removeAttr('tabindex');
      } else {
        element
          .attr({'tabindex': attr.tabindex});
      }
    });


    element.addClass('br-real-select');
    if (!element.attr('id')) {
      element.attr('id', 'select_' + $brUtil.nextUid());
    }


    ngModelCtrl.$parsers.push(ngModelPipelineCheckValue);
    ngModelCtrl.$formatters.push(ngModelPipelineCheckValue);
    ngModelCtrl.$render = ngModelRender;


    if (!isReadonly) {
      element
        .on('focus', function (ev) {
          containerCtrl.setFocused(true);
        })
        .on('blur', function (ev) {
          containerCtrl.setFocused(false);
        });
    }

    element.on('change', function () {
      scope.$apply(function () {
        ngModelRender();
      });
    });


    function ngModelPipelineCheckValue(arg) {
      containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(arg));
      return arg;
    }


    function ngModelRender() {
      scope.selectText = ngOptionsHelper.getLabel(ngModelCtrl.$viewValue) || placeholder;
    }

  }

}



/**
  * @ngdoc directive
  * @name brSelect
  * @module select
  *
  * @description
  * `<br-select>` is a wrapper for selects and select menus
  *
  * @usage
  * <hljs lang="html">
  * <br-select>
  *   <label>Label</label>
  *   <select ng-model="model" ng-options="item.name for item in list"></select>
  * </br-select>
  * </hljs>
  */
selectDirective.$inject = ['$brTheme'];
function selectDirective ($brTheme) {

  var directive = {
    restrict: 'E',
    compile: compile,
    controller: ['$scope', '$element', '$brMobile', controller]
  };
  return directive;



  function compile(tElement, tAttrs) {
    tElement.addClass('br-select');

    return function link (scope, element, attr) {
      $brTheme(element);
    };
  }


  function controller($scope, $element, $brMobile) {
    /* jshint validthis: true */
    var vm = this;


    // the click area for select is diffrent in each browser
    // for non-mobile devices listen for the click event on the element container and open the select.
    // this is only for native selects
    if ($element[0].querySelector('select') !== null && $brMobile.isMobile === false) {
      $element.on('click', augmentedClick);

      $scope.$on('$destroy', function () {
        $element.off('click', augmentedClick);
      });
    }

    var labelElement = $element[0].querySelector('label');

    if (labelElement !== undefined && labelElement !== null) {
      vm.label = labelElement.innerText;
      setTimeout(function () {
        angular.element(labelElement).attr('for', vm.selectElement.attr('id'));
      }, 0);
      // $element.addClass('br-has-label');
    }


    vm.setFocused = setFocused;
    vm.setHasValue = setHasValue;
    vm.setHasPlaceholder = setHasPlaceholder;


    function setFocused(isFocused) {
      $element.toggleClass('br-select-focused', !!isFocused);
    }

    function setHasValue(hasValue) {
      $element.toggleClass('br-select-has-value', !!hasValue);
    }

    function setHasPlaceholder(hasValue) {
      $element.toggleClass('br-select-has-placeholder', !!hasValue);
    }


    function augmentedClick(event) {
      if (event.target === vm.selectElement[0]) { return; }
      event.preventDefault();
      event.stopPropagation();

      openSelect();
    }

    function openSelect() {
      if (document.createEvent) {
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        vm.selectElement[0].dispatchEvent(e);
      } else if ($element.fireEvent) {
        vm.selectElement[0].fireEvent("onmousedown");
      }
    }
  }

}
