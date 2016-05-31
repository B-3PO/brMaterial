/**
 * @ngdoc module
 * @name checkbox
 */
angular
  .module('brMaterial')
  .directive('brCheckbox', brCheckboxDirective);


/**
  * @ngdoc directive
  * @name brCheckbox
  * @module checkbox
  *
  * @description
  * The `<br-checkbox>` standard checkbox
  *
  * @param {model=} ng-model - `{@link https://docs.angularjs.org/api/ng/directive/ngModel Angular ngModel}`
  * @param {boolean=} ng-checked - `{@link https://docs.angularjs.org/api/ng/directive/ngChange Angular ngChecked}`
  * @param {boolean=} ng-disabled - `{@link https://docs.angularjs.org/api/ng/directive/ngChange Angular ngDisabled}`
  * @param {function=} ng-change - `{@link https://docs.angularjs.org/api/ng/directive/ngChange Angular ngChange}`
  * @param {boolean=} br-no-style - use with standard HTML input checkbox to remove material styling
  *
  * @usage
  * #### Class Names
  *  - `br-primary` - Themes primary color
  *  - `br-accent` - Themes accent color
  *  - `br-warn` - Themes warn color
  *
  * <hljs lang="html">
  * <br-checkbox ng-model="switch1">
  *		Switch 1: {{ switch1 }}
  *	</br-checkbox>
  * </hljs>
  */
brCheckboxDirective.$inject = ['$timeout', 'inputDirective', '$brTheme', '$brUtil', '$brGesture', '$brConstant'];
function brCheckboxDirective ($timeout, inputDirective, $brTheme, $brUtil, $brGesture, $brConstant) {
  inputDirective = inputDirective[0];

  var directive = {
		restrict: 'E',
		transclude: true,
		require: '?ngModel',
		template:
			'<div class="br-container">' +
				'<div class="br-icon"></div>' +
			'</div>' +
			'<div ng-transclude class="br-label"></div>',
		compile: compile
	};

	return directive;


  function compile(tElement, tAttrs) {
    tAttrs.type = 'checkbox';
		tAttrs.tabIndex = tAttrs.tabindex || '0';
		tElement.attr('role', tAttrs.type);

    return function link (scope, element, attr, ngModelCtrl) {
      ngModelCtrl = ngModelCtrl || $brUtil.fakeNgModel();
			$brTheme(element);

      // if using ng-checked, trigger ngModel on change
      if (attr.ngChecked) {
				scope.$watch(
					scope.$eval.bind(scope, attr.ngChecked),
					ngModelCtrl.$setViewValue.bind(ngModelCtrl)
				);
			}

      scope.$watch(attr.ngDisabled, function(value) {
        if (value === true) {
          element.attr('tabindex', '-1');
        } else {
          element.attr('tabindex', attr.tabindex);
        }
      });

      inputDirective.link.pre(scope, {
				on: angular.noop,
				0: {}
			}, attr, [ngModelCtrl]);

			ngModelCtrl.$render = render;


      if (attr.brNoClick === undefined) {
        $brGesture.register(element, 'press');
  			element
  				.on('click', onClick)
  				.on('keypress', keypressHandler)
  				.on('focus', function() {
  					element.addClass('br-focused');
  				})
  				.on('blur', function() {
  					element.removeClass('br-focused');
  				});
      }




      function render () {
				if(ngModelCtrl.$viewValue) {
					element.addClass('br-checked');
				} else {
					element.removeClass('br-checked');
				}
			}



      function onClick(e) {
				if (attr.disabled === true || attr.readonly === true) return;

				listener(e);
				element[0].blur();
			}

			function keypressHandler (ev) {
				if (attr.disabled === true || attr.readonly === true) return;

        var keyCode = ev.which || ev.keyCode;
        if (keyCode === $brConstant.KEY_CODE.SPACE || keyCode === $brConstant.KEY_CODE.ENTER) {
          ev.preventDefault();
          if (!element.hasClass('br-focused')) { element.addClass('br-focused'); }
          listener(ev);
        }
      }

      function listener (ev) {
				ev.stopPropagation();

        scope.$apply(function () {
          var viewValue = attr.ngChecked ? attr.checked : !ngModelCtrl.$viewValue;
          ngModelCtrl.$setViewValue(viewValue, ev && ev.type);
          ngModelCtrl.$render();
        });
      }
    };
  }
}
