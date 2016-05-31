angular
  .module('brMaterial')
  .directive('brSelectMenu', selectMenuDirective)
  .directive('brOptionGroup', optionGroupDirective)
  .directive('brOption', optionDirective)
  .directive('brSelectHeader', selectHeader)
  .directive('brSelectOptionsWrapper', brSelectOptionsWrapper);


var selectNextId = 0;

/**
  * @ngdoc directive
  * @name brSelectMenu
  * @module select
  *
  * @description
  * `<br-select-menu>` is used in place of `<select>`. It it gives the flexibility for searching multiple groupings and buttons
  *
  * @param {boolean=} multiple - Enables multi selection
  * @param {model=} ng-model - `{@link https://docs.angularjs.org/api/ng/directive/ngModel Angular ngModel}`
  * @param {boolean=} ng-disabled - `{@link https://docs.angularjs.org/api/ng/directive/ngChange Angular ngDisabled}`
  * @param {function=} ng-change - `{@link https://docs.angularjs.org/api/ng/directive/ngChange Angular ngChange}`
  * @param {string=} placeholder - Same as input palceholder
  *
  * @usage
  * <hljs lang="html">
  * <br-select>
  *   <label>Label</label>
  *   <br-select-menu ng-model="model" placeholder="Select">
  *     <br-select-header>
  *       <input type="search" ng-model="selectFilter2" placeholder="Search..." />
  *     </br-select-header>
  *
  *     <br-option-group ng-repeat="group in selectListGrouped" label="{{group.label}}" ng-if="(group.people | filter:selectFilter2).length">
  *       <br-option ng-value="item" ng-repeat="item in group.people | filter:selectFilter2">{{item.name}}</br-option>
  *     </br-option-group>
  *
  *     <br-button class="br-primary" ng-click="vm.selectButtonTest();">Create New</br-button>
  *   </br-select-menu>
  * </br-select>
  * </hljs>
  */
selectMenuDirective.$inject = ['$brUtil', '$brTheme', '$compile', '$parse', '$document', '$brBackdrop', '$animateCss', '$window', '$brConstant', '$$rAF', '$brMobile', '$interval', '$timeout'];
function selectMenuDirective($brUtil, $brTheme, $compile, $parse, $document, $brBackdrop, $animateCss, $window, $brConstant, $$rAF, $brMobile, $interval, $timeout) {
  var driectve = {
    restrict: 'E',
    require: ['brSelectMenu', '^?brSelect', 'ngModel'],
    compile: compile,
    controller: ['$scope', '$element', '$attrs', '$brUtil', SelectController]
  };
  return driectve;


  function compile(tElement, tAttr) {
    // add the select value that will hold our placeholder or selected option value

    if (!tAttr.tabindex) {
      tAttr.$set('tabindex', 0);
    }

    // create display value container
    var valueElement = angular.element('<div class="br-select-menu-content"><span class="br-select-menu-label"></span><div class="br-select-icon"></div></div>');
    if (!tElement.attr('id')) {
      tElement.attr('id', 'select_' + $brUtil.nextUid());
    }


    // transplant option groups into container
    var optiongroupsContainer = angular.element('<br-select-options-wrapper class="br-optiongroups-container">').append(
      angular.element('<div class="br-optionsgroup-scroll">').append(
        angular.element('<br-content br-scroll-fix>').append(tElement.contents())));

    tElement.on('$destroy', function () {
      optiongroupsContainer.remove();
    });

    // attach display value and option groups container
    tElement.empty().append(valueElement);
    tElement.append(optiongroupsContainer);
    optiongroupsContainer[0].style.display = 'none';

    var errorsSpacer = angular.element('<div class="br-errors-spacer">');
    tElement.after(errorsSpacer);


    return postLink;
  }


  function postLink(scope, element, attr, ctrls) {
    var EDGE_MARGIN = 8;

    var stickTopKiller;
    var isOpen = false;
    var isStickTop = false;
    var wasAppended = false;
    var selectMenuCtrl = ctrls[0];
    var containerCtrl = ctrls[1];
    var ngModelCtrl = ctrls[2] || $brUtil.fakeNgModel();
    var selectLabel = element[0].parentNode.querySelector('label');
    var placeholder = attr.placeholder !== undefined ? attr.placeholder : selectLabel !== null ? selectLabel.innerHTML : '';
    var isReadonly = attr.readonly !== undefined;
    var valueElement = angular.element(element[0].querySelector('.br-select-menu-content'));
    var labelElement = angular.element(valueElement[0].querySelector('.br-select-menu-label'));
    var containerElement = angular.element(element[0].querySelector('.br-optiongroups-container'));
    var contentElement = angular.element(element[0].querySelector('br-content'))[0];
    var debounceUpdatePos = $$rAF.throttle(updatePosition);
    var searchInputElement = containerElement[0].querySelector('br-select-header input');

    if (searchInputElement !== null) {
      // remvoe default styling from input
      angular.element(searchInputElement).removeClass('br-input br-input-standard');
    }

    $brTheme(containerElement);

    // add placeholder if it exists and ng model is empty
    containerCtrl.label = labelElement;



    if (attr.placeholder !== undefined) {
      element.removeAttr('placeholder');
      containerCtrl.setHasPlaceholder(true);
    } else if (placeholder !== '') {
      attr.$set('placeholder', placeholder);
    }



    selectMenuCtrl.init(ngModelCtrl, attr.ngModel);
    var originalRender = ngModelCtrl.$render; // this is set from the select controller
    ngModelCtrl.$render = function() {
      originalRender();
      syncLabelText();
      // inputCheckValue();
    };
    containerCtrl.selectElement = element;
    selectMenuCtrl.containerElement = containerElement;

    attr.$observe('placeholder', ngModelCtrl.$render);
    attr.$observe('disabled', function (disabled) {
      valueElement.toggleClass('br-disabled', !!disabled);

      if (disabled === true) {
        containerElement.off('keydown', handleKeypress);
        element
          .removeAttr('tabindex')
          .off('click', openSelect)
          .off('keydown', handleKeypress);
      } else {
        containerElement.on('keydown', handleKeypress);
        element
          .attr({'tabindex': attr.tabindex})
          .on('click', openSelect)
          .on('keydown', handleKeypress);
      }
    });

    if (attr.disabled === undefined && attr.ngDisabled === undefined) {
      element.on('click', openSelect);
      element.on('keydown', handleKeypress);
      containerElement.on('keydown', handleKeypress);
    }

    if (attr.multiple !== undefined) {
      containerElement.addClass('br-multiple');
    }
    var deregisterWatcher;
    attr.$observe('brMultiple', function(val) {
      if (deregisterWatcher) { deregisterWatcher(); }
      var parser = $parse(val);

      deregisterWatcher = scope.$watch(function() {
        return parser(scope);
      }, function(multiple, prevVal) {
        if (multiple === undefined && prevVal === undefined) { return; } // assume compiler did a good job
        if (multiple) {
          element.attr('multiple', 'multiple');
          containerElement.addClass('br-multiple');
        } else {
          element.removeAttr('multiple');
          containerElement.removeClass('br-multiple');
        }

        selectMenuCtrl.setMultiple(multiple);
        originalRender = ngModelCtrl.$render;
        ngModelCtrl.$render = function() {
          originalRender();
          syncLabelText();
          // inputCheckValue();
        };
        ngModelCtrl.$render();
      });
    });


    if (!isReadonly) {
      element
        .on('focus', function (ev) {
          containerCtrl.setFocused(true);
        })
        .on('blur', function (ev) {
          containerCtrl.setFocused(false);
        });
    }


    scope.$$postDigest(function() {
      syncLabelText();
    });


    // scope.$watch(selectMenuCtrl.selectedLabels, syncLabelText);
    function syncLabelText() {
      selectMenuCtrl.setLabelText(selectMenuCtrl.selectedLabels());
    }

    // these function are created here to give them access to the container controller
    selectMenuCtrl.setLabelText = function (text) {
      selectMenuCtrl.setIsPlaceholder(!text);
      // Use placeholder attribute, otherwise fallback to the md-input-container label
      var tmpPlaceholder = attr.placeholder || (containerCtrl && containerCtrl.label ? containerCtrl.label.text() : '');
      text = text || tmpPlaceholder || '';
      var target = valueElement.children().eq(0);
      target.html(text);
    };

    selectMenuCtrl.setIsPlaceholder = function (isPlaceholder) {
      if (isPlaceholder === true) {
        if (containerCtrl && containerCtrl.label) {
          containerCtrl.setHasValue(false);
          containerCtrl.label.addClass('_br-placeholder');
        }
      } else {
        if (containerCtrl && containerCtrl.label) {
          containerCtrl.setHasValue(true);
          containerCtrl.label.removeClass('_br-placeholder');
        }
      }
    };


    function handleKeypress(ev) {
      var keyCodes = $brConstant.KEY_CODE;
      var allowedCodes = [32, 13, 38, 40];
      if (allowedCodes.indexOf(ev.keyCode) !== -1) {
        openSelect(ev);
        ev.preventDefault();
      }

      switch (ev.keyCode) {
        case keyCodes.UP_ARROW:
          selectMenuCtrl.focusPrevOption();
          break;
        case keyCodes.DOWN_ARROW:
          selectMenuCtrl.focusNextOption();
          break;
        case keyCodes.SPACE:
        case keyCodes.ENTER:
          var option = $brUtil.getClosest(ev.target, 'br-option');
          if (option) {
            element.triggerHandler({
              type: 'click',
              target: option
            });
            ev.preventDefault();
          }
          setSelected(event);
          break;
        case keyCodes.TAB:
        case keyCodes.ESCAPE:
          ev.stopPropagation();
          ev.preventDefault();
          close(ev);
          break;
        default:
          if (ev.target.nodeName !== 'INPUT' && ev.keyCode >= 31 && ev.keyCode <= 90) {
            ev.stopPropagation();
            ev.preventDefault();
            var optNode = selectMenuCtrl.optNodeForKeyboardSearch(ev);
            selectMenuCtrl.setFocusNode(optNode);
            if (optNode !== undefined) { optNode.focus(); }
          }
      }
    }


    function openSelect() {
      if (isOpen === true) { return; }
      isOpen = true;


      // prevent over scroll
      angular.element(contentElement).on('wheel touchmove', preventOverScoll);

      // watch for window size changes
      angular.element($window)
        .on('resize', debounceUpdatePos)
        .on('orientationchange', debounceUpdatePos);

      // if the device is mobile then stick the select to top center of window
      if ($brMobile.isMobile === true) {
        angular.element(searchInputElement)
          .on('focus', stickSelect)
          .on('blur', unstickSelect);
      }


      // add menu to body if not added yet
      if (wasAppended === false) {
        $document.find('body').eq(0).append(containerElement);
        wasAppended = true;
      }


      containerElement[0].style.display = '';
      containerElement.removeClass('br-leave');
      $brBackdrop.add(containerElement, scope, close);

      var position = calculatePosition(containerElement);

      $animateCss(containerElement, {
        addClass: 'br-active',
        from: $brUtil.toCss(position),
        to: $brUtil.toCss({transform: ''})
      })
      .start()
      .then(function () {
        containerElement[0].addEventListener('click', captureClickListener, true);
        containerElement.addClass('br-clickable');
      });
    }

    function close() {
      if ( !isOpen ) return;
      isOpen = false;

      // remove click listener to prevent propogation and allow button clicks to work
      element.off('click', openSelect);


      // prevent over scroll
      angular.element(contentElement).off('wheel touchmove', preventOverScoll);

      // watch for window size changes
      angular.element($window)
        .off('resize', debounceUpdatePos)
        .off('orientationchange', debounceUpdatePos);

      // if the device is mobile then stick the select to top center of window
      angular.element(searchInputElement)
        .off('focus', stickSelect)
        .off('blur', unstickSelect);

      unstickSelect();


      containerElement[0].removeEventListener('click', captureClickListener, true);
      selectMenuCtrl.resetFocus();

      $animateCss(containerElement, {addClass: 'br-leave'})
        .start()
        .then(function () {
          containerElement.removeClass('br-active');
          containerElement[0].style.display = 'none';
          $brBackdrop.remove();

          // clear search input
          if (searchInputElement !== null) {
            if (angular.element(searchInputElement).data('$ngModelController') !== undefined) {
              angular.element(searchInputElement).data('$ngModelController').$setViewValue('');
              angular.element(searchInputElement).data('$ngModelController').$render();
            }
          }

          // add click back
          element.on('click', openSelect);
        });
    }


    function preventOverScoll(ev) {
      var delta = ev.wheelDelta || -ev.detail;
      var bottomOverflow = contentElement.scrollTop + contentElement.offsetHeight - contentElement.scrollHeight >= 0;
      var topOverflow = contentElement.scrollTop <= 0;

      if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
        ev.preventDefault();
      }
    }

    function updatePosition() {
      var position;

      if (isStickTop === true) {
        position = calculatePosition(containerElement, true);
      } else {
        position = calculatePosition(containerElement);
      }

      containerElement.css($brUtil.toCss(position));
    }

    function stickSelect() {
      isStickTop = true;
      angular.element(contentElement).css('max-height', '256px');

      var inter = $interval(debounceUpdatePos, 10);
      $timeout(function () {
        $interval.cancel(inter);
        inter = undefined;
      }, 1400);
    }

    function unstickSelect(reset) {
      isStickTop = false;
      angular.element(contentElement).css('max-height', '');
    }




    // Close menu on menu item click, if said option is not disabled
    function captureClickListener(event) {
      var target = event.target;

      do {
        if (target === containerElement[0]) { return; }
        if (hasAnyAttribute(target, ['ng-click', 'ng-href']) || target.nodeName == 'BUTTON' || target.nodeName == 'BR-BUTTON' || target.nodeName == 'BR-OPTION') {
          if (!target.hasAttribute('disabled')) {
            if (target.nodeName == 'BR-OPTION') { setSelected(event); }
            else {
              close();
            }
          }
          break;
        }

        target = target.parentNode;
      } while (target);


      function hasAnyAttribute(target, attrs) {
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



    function setSelected(ev) {
      var option = $brUtil.getClosest(ev.target, 'br-option');
      var optionCtrl = option && angular.element(option).data('$brOptionController');

      if (!option || !optionCtrl) return;
      if (option.hasAttribute('disabled')) {
        ev.stopImmediatePropagation();
        return false;
      }


      var optionHashKey = selectMenuCtrl.hashGetter(optionCtrl.value);
      var isSelected = selectMenuCtrl.selected[optionHashKey] !== undefined;

      scope.$apply(function () {
        if (selectMenuCtrl.isMultiple) {
          if (isSelected) {
            selectMenuCtrl.deselect(optionHashKey);
          } else {
            selectMenuCtrl.select(optionHashKey, optionCtrl.value);
          }
        } else {
          if (!isSelected) {
            selectMenuCtrl.deselect(Object.keys(selectMenuCtrl.selected)[0]);
            selectMenuCtrl.select(optionHashKey, optionCtrl.value);
          }
        }
        selectMenuCtrl.refreshViewValue();

        if (selectMenuCtrl.isMultiple !== true) { close(); }
      });
    }





    function calculatePosition(containerElement, stick) {
      stick = stick || false;

      var containerNode = containerElement[0];
      var boundryNodeRect = $document[0].body.getBoundingClientRect();
      var originNodeRect = element[0].getBoundingClientRect();
      var selectBounds = valueElement[0].getBoundingClientRect();

      var bounds = {
        left: boundryNodeRect.left + EDGE_MARGIN,
        right: boundryNodeRect.right - EDGE_MARGIN,
        top: Math.max(boundryNodeRect.top, 0) + EDGE_MARGIN,
        bottom: Math.max(boundryNodeRect.bottom, Math.max(boundryNodeRect.top, 0) + boundryNodeRect.height) - EDGE_MARGIN
      };

      var transformOrigin = 'top 50%';
      var position = {
        top: originNodeRect.top,
        left: Math.abs(originNodeRect.left - ((containerNode.offsetWidth - selectBounds.width) / 2))
      };

      if (stick === true) {
        position.top = $window.scrollY;
        position.left = $window.scrollX + (($window.innerWidth / 2) - (containerNode.offsetWidth / 2));
      }

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
    }

  }




  function SelectController($scope, $element, $attrs, $brUtil) {
    /* jshint validthis: true */
    var vm = this;

    var deregisterCollectionWatch;
    var defaultIsEmpty;

    vm.isMultiple = $attrs.multiple !== undefined;
    vm.selected = {};
    vm.options = {};

    vm.setMultiple = setMultiple;
    vm.select = select;
    vm.deselect = deselect;
    vm.addOption = addOption;
    vm.removeOption = removeOption;
    vm.refreshViewValue = refreshViewValue;
    vm.selectedLabels = selectedLabels;
    vm.optNodeForKeyboardSearch = optNodeForKeyboardSearch;
    vm.focusNextOption = focusNextOption;
    vm.focusPrevOption = focusPrevOption;
    vm.resetFocus = resetFocus;
    vm.setFocusNode = setFocusNode;
    vm.init = init;


    $scope.$watchCollection(function() {
      return vm.options;
    }, function() {
      vm.ngModel.$render();
    });



    function init(ngModel, binding) {
      vm.ngModel = ngModel;
      vm.modelBinding = binding;

      // Allow users to provide `ng-model="foo" ng-model-options="{trackBy: 'foo.id'}"` so
      // that we can properly compare objects set on the model to the available options
      if (ngModel.$options && ngModel.$options.trackBy) {
        var trackByLocals = {};
        var trackByParsed = $parse(ngModel.$options.trackBy);
        vm.hashGetter = function(value, valueScope) {
          trackByLocals.$value = value;
          return trackByParsed(valueScope || $scope, trackByLocals);
        };
        // If the user doesn't provide a trackBy, we automatically generate an id for every
        // value passed in
      } else {
        vm.hashGetter = function getHashValue(value) {
          if (angular.isObject(value)) {
            return 'object_' + (value.$$brSelectId || (value.$$brSelectId = ++selectNextId));
          }
          return value;
        };
      }

      vm.setMultiple(vm.isMultiple);
    }


    function select(hashKey, hashedValue) {
      var option = vm.options[hashKey];
      if (option !== undefined) { option.setSelected(true); }
      vm.selected[hashKey] = hashedValue;
    }

    function deselect(hashKey, hashedValue) {
      var option = vm.options[hashKey];
      if (option !== undefined) { option.setSelected(false); }
      delete vm.selected[hashKey];
    }

    function addOption(hashKey, optionCtrl) {
      if (vm.options[hashKey] !== undefined) {
        throw new Error('Duplicate md-option values are not allowed in a select. ' +
          'Duplicate value "' + optionCtrl.value + '" found.');
      }
      vm.options[hashKey] = optionCtrl;

      // If this option's value was already in our ngModel, go ahead and select it.
      if (vm.selected[hashKey] !== undefined) {
        vm.select(hashKey, optionCtrl.value);
        vm.refreshViewValue();
      }
    }

    function removeOption(hashKey) {
      delete vm.options[hashKey];
      // Don't deselect an option when it's removed - the user's ngModel should be allowed
      // to have values that do not match a currently available option.
    }

    function refreshViewValue() {
      var values = [];
      var option;
      var usingTrackBy;
      var newVal;
      var prevVal;
      var hashKeys = Object.keys(vm.selected);
      var hashKey = hashKeys.pop();

      while (hashKey !== undefined) {
        if ((option = vm.options[hashKey])) {
          values.push(option.value);
        } else {
          // push unhashed key from ealier time
          values.push(vm.selected[hashKey]);
        }

        hashKey = hashKeys.pop();
      }


      usingTrackBy = vm.ngModel.$options && vm.ngModel.$options.trackBy;
      newVal = vm.isMultiple ? values : values[0];
      prevVal = vm.ngModel.$modelValue;

      if (usingTrackBy ? !angular.equals(prevVal, newVal) : prevVal != newVal) {
        vm.ngModel.$setViewValue(newVal);
        vm.ngModel.$render();
      }
    }


    function renderMultiple() {
      var newSelectedValues = vm.ngModel.$modelValue || vm.ngModel.$viewValue || [];
      if (!angular.isArray(newSelectedValues)) { return; }

      var oldSelected = Object.keys(vm.selected);
      var newSelectedHashes = newSelectedValues.map(vm.hashGetter);
      var deselected = oldSelected.filter(function(hash) {
        return newSelectedHashes.indexOf(hash) === -1;
      });

      deselected.forEach(deselect);
      newSelectedHashes.forEach(function (hashKey, i) {
        vm.select(hashKey, newSelectedValues[i]);
      });
    }

    function renderSingular() {
      var value = vm.ngModel.$viewValue || vm.ngModel.$modelValue;
      Object.keys(vm.selected).forEach(deselect);
      vm.select(vm.hashGetter(value), value);
    }



    function selectedLabels(opts) {
      opts = opts || {};
      var selectedOptionEls = $brUtil.nodesToArray(vm.containerElement[0].querySelectorAll('br-option[selected]'));
      if (selectedOptionEls.length) {
        return selectedOptionEls.map(function (el) { return el.innerHTML; }).join(', ');
      } else {
        return '';
      }
    }

    var focusedNode;
    function focusOption(direction) {
      var optionsArray = $brUtil.nodesToArray(vm.containerElement[0].querySelectorAll('br-option'));
      var index = optionsArray.indexOf(focusedNode);
      var newOption;

      do {
        if (index === -1) {
          // We lost the previously focused element, reset to first option
          index = 0;
        } else if (direction === 'next' && index < optionsArray.length - 1) {
          index++;
        } else if (direction === 'prev' && index > 0) {
          index--;
        }
        newOption = optionsArray[index];
        if (newOption.hasAttribute('disabled')) newOption = undefined;
      } while (!newOption && index < optionsArray.length - 1 && index > 0);
      if (newOption !== undefined) { newOption.focus(); }
      focusedNode = newOption;
    }

    function focusNextOption() {
      focusOption('next');
    }

    function focusPrevOption() {
      focusOption('prev');
    }

    function resetFocus() {
      focusedNode = undefined;
    }

    function setFocusNode(node) {
      focusedNode = node || focusedNode;
    }


    function setMultiple(isMultiple) {
      var ngModel = vm.ngModel;
      defaultIsEmpty = defaultIsEmpty || ngModel.$isEmpty;
      vm.isMultiple = isMultiple;
      if (deregisterCollectionWatch) { deregisterCollectionWatch(); }


      if (vm.isMultiple) {
        ngModel.$validators['br-multiple'] = validateArray;
        ngModel.$render = renderMultiple;


        $scope.$watchCollection(vm.modelBinding, function(value) {
          if (validateArray(value)) renderMultiple(value);
          vm.ngModel.$setPristine();
        });


        ngModel.$isEmpty = function(value) {
          return !value || value.length === 0;
        };
      } else {
        delete ngModel.$validators['br-multiple'];
        ngModel.$render = renderSingular;
      }


      function validateArray(modelValue, viewValue) {
        return angular.isArray(modelValue || viewValue || []);
      }
    }


    var searchStr = '';
    var clearSearchTimeout, optNodes, optText;
    var CLEAR_SEARCH_AFTER = 300;
    function optNodeForKeyboardSearch(e) {
      var i = 0;
      var length;

      if (clearSearchTimeout !== undefined) { clearTimeout(clearSearchTimeout); }
      clearSearchTimeout = setTimeout(function() {
        clearSearchTimeout = undefined;
        searchStr = '';
        optText = undefined;
        optNodes = undefined;
      }, CLEAR_SEARCH_AFTER);
      searchStr += String.fromCharCode(e.keyCode);
      var search = new RegExp('^' + searchStr, 'i');
      if (!optNodes) {
        optNodes = $element.find('br-option');
        optText = new Array(optNodes.length);
        angular.forEach(optNodes, function(el, i) {
          optText[i] = el.textContent.trim();
        });
      }

      length = optText.length;
      while (i < length) {
        if (search.test(optText[i])) {
          return optNodes[i];
        }

        i += 1;
      }
    }
  }
}









// ---- Group Directive ---------------------

/**
  * @ngdoc directive
  * @name brOptionGroup
  * @module select
  *
  * @description
  * `<br-option-group>` is used to create groupings of `<br-option>`
  *
  * @param {string} [ng-repeat]
  * @param {string} [ng-label]
  *
  * @example
  * <br-select>
  *   <label>Label</label>
  *   <br-select-menu ng-model="model" placeholder="Select">
  *     <br-select-header>
  *       <input type="search" ng-model="selectFilter2" placeholder="Search..." />
  *     </br-select-header>
  *
  *     <br-option-group ng-repeat="group in selectListGrouped" label="{{group.label}}" ng-if="(group.people | filter:selectFilter2).length">
  *       <br-option ng-value="item" ng-repeat="item in group.people | filter:selectFilter2">{{item.name}}</br-option>
  *     </br-option-group>
  *
  *     <br-button class="br-primary" ng-click="vm.selectButtonTest();">Create New</br-button>
  *   </br-select-menu>
  * </br-select>
  */
function optionGroupDirective() {
  var directive = {
    restrict: 'E',
    compile: compile
  };
  return directive;

  function compile(tElement, tAttr) {
    var labelElement = tElement.find('label');
    if (!labelElement.length) {
      labelElement = angular.element('<div class="br-option-group-label">');
      tElement.prepend(labelElement);
    }
    // labelElement.addClass('_br-container-ignore');
    if (tAttr.label) { labelElement.text(tAttr.label); }
  }
}









// ---- Option Directive ---------------------

var CHECKBOX_SELECTION_INDICATOR = angular.element('<div class="br-select-icon-container"><div class="br-select-menu-icon"></div></div>');

/**
  * @ngdoc directive
  * @name brOption
  * @module select
  *
  * @description
  * `<br-option>` is the containing element for selecting
  *
  * @param {string} [ng-repeat]
  * @param {any} [ng-value]
  *
  * @example
  * <br-select>
  *   <label>Label</label>
  *   <br-select-menu ng-model="model" placeholder="Select">
  *     <br-select-header>
  *       <input type="search" ng-model="selectFilter2" placeholder="Search..." />
  *     </br-select-header>
  *
  *     <br-option-group ng-repeat="group in selectListGrouped" label="{{group.label}}" ng-if="(group.people | filter:selectFilter2).length">
  *       <br-option ng-value="item" ng-repeat="item in group.people | filter:selectFilter2">{{item.name}}</br-option>
  *     </br-option-group>
  *
  *     <br-button class="br-primary" ng-click="vm.selectButtonTest();">Create New</br-button>
  *   </br-select-menu>
  * </br-select>
  */
function optionDirective() {
  var directive = {
    restrict: 'E',
    require: ['brOption', '^^brSelectOptionsWrapper'],
    compile: compile,
    controller: ['$element', OptionController]
  };
  return directive;

  function compile(tElement, tAttr) {
    // Manual transclusion to avoid the extra inner <span> that ng-transclude generates
    tElement.append(angular.element('<div class="br-text">').append(tElement.contents()));
    tElement.attr('tabindex', tAttr.tabindex || '0');
    return postLink;
  }

  function postLink(scope, element, attrs, ctrls) {
    var optionCtrl = ctrls[0];
    var selectCtrl = ctrls[1].selectController;

    if (selectCtrl.isMultiple === true) {
      element.addClass('br-select-checkbox-enabled');
      element.prepend(CHECKBOX_SELECTION_INDICATOR.clone());
    }


    // watch value
    if (attrs.ngValue !== undefined) {
      scope.$watch(attrs.ngValue, setOptionValue);
    } else if (attrs.value !== undefined) {
      setOptionValue(attrs.value);
    } else {
      scope.$watch(function() {
        return element.text().trim();
      }, setOptionValue);
    }


    // disable tabbing on disabled options
    attrs.$observe('disabled', function(disabled) {
      if (disabled === true) {
        element.attr('tabindex', '-1');
      } else {
        element.attr('tabindex', '0');
      }
    });


    // set selected
    scope.$$postDigest(function() {
      attrs.$observe('selected', function(selected) {
        if (selected === undefined) return;
        if (typeof selected === 'string') { selected = true; }

        if (selected === true) {
          if (!selectCtrl.isMultiple) {
            selectCtrl.deselect(Object.keys(selectCtrl.selected)[0]);
          }
          selectCtrl.select(optionCtrl.hashKey, optionCtrl.value);
        } else {
          selectCtrl.deselect(optionCtrl.hashKey);
        }

        selectCtrl.refreshViewValue();
      });
    });


    scope.$on('$destroy', function() {
      selectCtrl.removeOption(optionCtrl.hashKey, optionCtrl);
    });



    function setOptionValue(newValue, oldValue, prevAttempt) {
      if (!selectCtrl.hashGetter) {
        if (prevAttempt !== true) {
          scope.$$postDigest(function() {
            setOptionValue(newValue, oldValue, true);
          });
        }
        return;
      }

      var oldHashKey = selectCtrl.hashGetter(oldValue, scope);
      var newHashKey = selectCtrl.hashGetter(newValue, scope);

      optionCtrl.hashKey = newHashKey;
      optionCtrl.value = newValue;

      selectCtrl.removeOption(oldHashKey, optionCtrl);
      selectCtrl.addOption(newHashKey, optionCtrl);
    }
  }


  function OptionController($element) {
    /* jshint validthis: true */
    var vm = this;

    vm.selected = false;
    vm.setSelected = function (isSelected) {
      if (isSelected === true && vm.selected === false) {
        $element.attr({selected: 'selected'});
      } else if (!isSelected && this.selected) {
        $element.removeAttr('selected');
      }

      vm.selected = isSelected;
    };
  }
}




/**
  * @ngdoc directive
  * @name brSelectHeader
  * @module select
  *
  * @description
  * `<br-select-header>` is the containing element for search input
  *
  * @example
  * <br-select>
  *   <label>Label</label>
  *   <br-select-menu ng-model="model" placeholder="Select">
  *     <br-select-header>
  *       <input type="search" ng-model="selectFilter2" placeholder="Search..." />
  *     </br-select-header>
  *
  *     <br-option-group ng-repeat="group in selectListGrouped" label="{{group.label}}" ng-if="(group.people | filter:selectFilter2).length">
  *       <br-option ng-value="item" ng-repeat="item in group.people | filter:selectFilter2">{{item.name}}</br-option>
  *     </br-option-group>
  *
  *     <br-button class="br-primary" ng-click="vm.selectButtonTest();">Create New</br-button>
  *   </br-select-menu>
  * </br-select>
  */
function selectHeader() {
  var directive = {
    restrict: 'E'
  };
  return directive;
}


function brSelectOptionsWrapper() {
  var directive = {
    restrict: 'E',
    require: ['brSelectOptionsWrapper', '^^brSelectMenu'],
    link: link,
    controller: controller
  };
  return directive;


  function link(scope, element, attrs, ctrls) {
    ctrls[0].selectController = ctrls[1];
  }

  function controller() {
    /* jshint validthis: true */
    var vm = this;

    vm.selectController = undefined;
  }
}
