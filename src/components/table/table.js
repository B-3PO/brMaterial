angular
  .module('brMaterial')
  .directive('brTable', tableDirective)
  .directive('brTh', thDirective)
  .directive('brBody', bodyDirective)
  .directive('brHead', headDirective)
  .directive('brTr', trDirective)
  .directive('brTd', tdDirective);



var selectNextId = 0;



// --- Table ----


/**
  * @name brTable
  * @module brTable
  *
  * @param {number} [height] - table height
  * @param {number} [width] - table width
  * @param {number} [inner-width] - width of table scroll area
  * @param {object} [br-filter] - object containing keys that match the table data with values to search on
  */
tableDirective.$inject = ['$brUtil', '$brTheme', '$parse'];
function tableDirective($brUtil, $brTheme, $parse) {
  var directive = {
    restrict: 'E',
    require: ['brTable', '?ngModel'],
    compile: compile,
    scope: true,
    controller: ['$scope', '$element', '$attrs', '$window', '$parse', controller]
  };
  return directive;




  function compile(tElement, tAttrs) {
    var innerWidth = tAttrs.brInnerWidth || tAttrs.innerWidth;
    var width = tAttrs.brWidth || tAttrs.width;
    var height = tAttrs.brHeight || tAttrs.height;

    if (width !== undefined) {
      tElement.css('width', $brUtil.valueToCss(width));
    }

    if (height !== undefined) {
      tElement.css('height', $brUtil.valueToCss(height));
    }


    var subheader = angular.element('<div class="br-table-container">');
    subheader.append(tElement.contents());
    tElement.append(subheader);

    if (innerWidth !== undefined) {
      subheader.css('min-width', $brUtil.valueToCss(innerWidth));
    }

    return postLink;
  }

  function postLink(scope, element, attrs, ctrls) {
    var tableController = ctrls[0];
    var ngModelCtrl = ctrls[1] || $brUtil.fakeNgModel();

    var headElement = angular.element(element[0].querySelector('br-head'));
    var bodyElement = angular.element(element[0].querySelector('br-body'));

    $brTheme(element);

    tableController.init(ngModelCtrl, attrs.ngModel);

    if (attrs.brWidth || attrs.width) {
      // set the header width
      scope.$watch(function () {
        return element[0].scrollWidth;
      }, function (data) {

        // if scroll area exists
        if (data <= element[0].offsetWidth) {
          headElement.css('width', (element[0].offsetWidth - $brUtil.scrollbarWidth) + 'px');
          bodyElement.css('width', (element[0].offsetWidth - $brUtil.scrollbarWidth) + 'px');
        } else {
          headElement.css('width', data + 'px');
          bodyElement.css('width', data + 'px');
        }
      });
    } else {
      headElement.css('width', '100%');
    }



    var deregisterWatcher;
    attrs.$observe('brMultiple', function (val) {
      if (deregisterWatcher) { deregisterWatcher(); }
      var parser = $parse(val);

      deregisterWatcher = scope.$watch(function() {
        return parser(scope);
      }, function(multiple, prevVal) {
        if (multiple === undefined && prevVal === undefined) { return; } // assume compiler did a good job
        if (multiple) {
          element.attr('multiple', 'multiple');
        } else {
          element.removeAttr('multiple');
        }

        tableController.setMultiple(multiple);
        // originalRender = ngModelCtrl.$render;
        // ngModelCtrl.$render = function() {
        //   originalRender();
        //   syncLabelText();
        //   // inputCheckValue();
        // };
        ngModelCtrl.$render();
      });
    });
  }



  function controller($scope, $element, $attrs, $window, $parse) {
    var idCounter = 0;

    /* jshint validthis: true */
    var vm = this;

    var columns = [];
    var lastSort;
    var sortFuncs = {};
    var defaultIsEmpty;

    vm.isMultiple = $attrs.multiple !== undefined;
    vm.selected = {};
    vm.options = {};

    vm.init = init;
    vm.$element = $element;
    vm.addColumn = addColumn;
    vm.getColumnInfo = getColumnInfo;
    vm.addSort = addSort;
    vm.setSort = setSort;
    vm.sortHook = sortHook;
    vm.setMultiple = setMultiple;


    function addColumn(elAttrs) {
      columns.push(elAttrs);
      return idCounter++;
    }

    function getColumnInfo(index) {
      return columns[index];
    }

    function addSort(by, func) {
      sortFuncs[by] = func;
    }

    function setSort(by, asc) {
      if (lastSort !== undefined && lastSort !== by && typeof sortFuncs[by] === 'function') {
        sortFuncs[lastSort]();
      }

      lastSort = by;
      vm.sortHook(by, asc);
    }

    function sortHook(func) {
      if (typeof func === 'function') {
        vm.sortHook = func;
      }
    }



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


    function setMultiple(isMultiple) {
      var ngModel = vm.ngModel;
      defaultIsEmpty = defaultIsEmpty || ngModel.$isEmpty;
      vm.isMultiple = isMultiple;
      // if (deregisterCollectionWatch) { deregisterCollectionWatch(); }


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
        // ngModel.$render = renderSingular;
      }


      function validateArray(modelValue, viewValue) {
        return angular.isArray(modelValue || viewValue || []);
      }
    }


    function renderMultiple() {
      var newSelectedValues = vm.ngModel.$modelValue || vm.ngModel.$viewValue || [];
      if (!angular.isArray(newSelectedValues)) { return; }

      var oldSelected = Object.keys(vm.selected);
      var newSelectedHashes = newSelectedValues.map(vm.hashGetter);
      var deselected = oldSelected.filter(function (hash) {
        return newSelectedHashes.indexOf(hash) === -1;
      });

      deselected.forEach(deselect);
      newSelectedHashes.forEach(function(hashKey, i) {
        vm.select(hashKey, newSelectedValues[i]);
      });
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
  }
}






// --- Column Header Container ---

headDirective.$inject = ['$$rAF', '$brConstant', '$brUtil'];
function headDirective($$rAF, $brConstant, $brUtil) {
  var directive = {
    restrict: 'E',
    require: '^brTable',
    link: link
  };
  return directive;


  function link(scope, element, attrs, tableCtrl) {
    var spacerElement = angular.element('<div class="br-table-header-spacer">');
    var throttleScroll = $$rAF.throttle(onScroll);
    var parent = element.parent();

    element.parent().prepend(spacerElement);

    // watch header height and adjust header spacer
    scope.$watch(function () {
      return element[0].offsetHeight;
    }, function (data) {
      spacerElement.css('height', data + 'px');
    });

    // translate hader to stick it to top
    tableCtrl.$element.on('scroll touchmove wheel', throttleScroll);
    function onScroll () {
      element.css(
        $brConstant.CSS.TRANSFORM,
        'translate3d(0,' + tableCtrl.$element[0].scrollTop + 'px,0)'
      );

      element.toggleClass('scrolled', tableCtrl.$element[0].scrollTop > 0);
    }

    // prevent scrollout animation on load
    setTimeout(function () {
      element.addClass('inited');
    }, 0);
  }
}






// --- Column Header ---

thDirective.$inject = ['$brUtil'];
function thDirective($brUtil) {
  var directive = {
    restrict: 'E',
    require: '^brTable',
    link: link
  };
  return directive;

  function link(scope, element, attrs, tableCtrl) {
    var asc = false;
    var width = $brUtil.valueToCss(attrs.brWidth || attrs.width);
    var minWidth = $brUtil.valueToCss(width || attrs.brMinWidth || attrs.minWidth);
    var alignRight = attrs.brAlignRight;
    var alignLeft = attrs.brAlignLeft;
    var sortBy = attrs.brSortBy;

    // style the column header and add the style to the table
    if (width !== undefined) { element.css('max-width', width); }
    if (minWidth !== undefined) {
      element.css('min-width', minWidth);
      element.css('flex-basis', minWidth);
    }
    if (alignRight !== undefined) { element.addClass('br-align-right'); }
    if (alignLeft !== undefined) { element.addClass('br-align-left'); }
    element.attr('column_id', tableCtrl.addColumn({
      width: width,
      minWidth: minWidth,
      ellipsis: attrs.brEllipsis,
      alignRight: alignRight,
      alignLeft: alignLeft
    }));


    if (sortBy !== undefined) {
      element.addClass('br-sort');
      element.on('click', sort);

      tableCtrl.addSort(sortBy, function () {
        asc = false;
        element.removeClass('br-asc');
        element.removeClass('br-desc');
      });
    }

    function sort(ev) {
      element.toggleClass('br-asc', asc);
      element.toggleClass('br-desc', !asc);

      scope.$apply(function () {
        tableCtrl.setSort(sortBy, asc);
      });
      asc = !asc;
    }
  }
}







// --- Body ---

bodyDirective.$inject = ['$parse', '$compile', '$filter'];
function bodyDirective($parse, $compile, $filter) {
  var directive = {
    restrict: 'E',
    terminal: true, // needed for ng-repeat
    require: ['^brTable'],
    compile: compile
  };
  return directive;

  function compile(tElement, tAttrs) {
    var i = 0;
    var children = tElement.children();
    if (children[0].nodeName === 'BR-TR') {
      children = angular.element(children[0]).children();
    }
    var length = children.length;

    while (i < length) {
      angular.element(children[i]).attr('column_id', i);
      i += 1;
    }

    return link;
  }


  function link(scope, element, attrs, ctrls) {
    var rawData;
    var filterData;

    var tableCtrl = ctrls[0];
    var orderBy = $filter('orderBy');
    var filterBy = $filter('filter');
    var trElement = angular.element(element[0].querySelector('br-tr'));
    var sortProperties = {};

    var itemName = attrs.brItem;
    var dataGetter = $parse(attrs.brData);
    var filterGetter;
    if (attrs.brFilter !== undefined) {
      filterGetter = $parse(attrs.brFilter);
    }

    if (!trElement.length) {
      trElement = angular.element('<br-tr>');
      trElement.append(element.contents());
      element.empty().append(trElement);
    }
    trElement.attr('ng-repeat', itemName + ' in _tableData');

    scope._tableData = [];

    // watch for data change
    scope.$watch(function () {
      return dataGetter(scope);
    }, function (data) {
      rawData = data;
      runfilters();
    }, true);


    // watch for filter changes
    if (filterGetter !== undefined) {
      scope.$watch(function () {
        return filterGetter(scope);
      }, function (data) {
        filterData = data;
        runfilters();
      }, true);
    }



    $compile(trElement)(scope);
    tableCtrl.sortHook(function (predicate, reverse) {
      sortProperties.predicate = predicate;
      sortProperties.reverse = reverse;
      runfilters();
    });



    function runfilters() {
      filter();
      sort();
    }

    function filter() {
      if (filterData === undefined) {
        scope._tableData = rawData;
        return;
      }
      scope._tableData = filterBy(rawData, filterData);
    }

    function sort() {
      if (sortProperties.predicate === undefined) { return; }
      scope._tableData = orderBy(scope._tableData, sortProperties.predicate, sortProperties.reverse);
    }


    // var wrapper = angular.element('<br-infinite-repeat-container style="height: ' + tableCtrl.height + 'px">');
    // var repeatElement = angular.element('<div br-infinite-repeat="' + itemName + ' in _tableData">');
    // repeatElement.append(element.contents());
    // wrapper.append(repeatElement);
    // element.empty().append($compile(wrapper)(scope));
  }
}






// --- tr -----


var CHECKBOX_SELECTION_INDICATOR = angular.element('<div class="br-table-icon-container"><div class="br-table-menu-icon"></div></div>');

function trDirective() {
  var directive = {
    restrict: 'E',
    require: '^brTable',
    link: link
  };
  return directive;

  function link(scope, element, attrs, tableController) {
    if (tableController.isMultiple === true) {
      element.addClass('br-table-checkbox-enabled');
      element.prepend(CHECKBOX_SELECTION_INDICATOR.clone());
    }
  }
}




// --- td ---

function tdDirective() {
  var directive = {
    restrict: 'E',
    require: '^brTable',
    link: link
  };
  return directive;

  function link(scope, element, attrs, ctrl) {
    var columnAttrs = ctrl.getColumnInfo(element.attr('column_id'));
    if (columnAttrs.width !== undefined) { element.css('max-width', columnAttrs.width); }
    if (columnAttrs.minWidth !== undefined) {
      element.css('min-width', columnAttrs.minWidth);
      element.css('flex-basis', columnAttrs.minWidth);
    }
    if (columnAttrs.ellipsis !== undefined) { element.addClass('br-ellipsis'); }
    if (columnAttrs.alignRight !== undefined) { element.addClass('br-align-right'); }
    if (columnAttrs.alignLeft !== undefined) { element.addClass('br-align-left'); }
  }
}
