/**
 * @ngdoc module
 * @name slider
 */
angular
  .module('brMaterial')
	.directive('brSlider', brSliderDirective);




/**
  * @ngdoc directive
  * @name brSlider
  * @module slider
  *
  *
  * @description
  * `<br-slider>` is a animated slider that can be used with or without a percentage
  *
  * @param {number=} min=0 - The minimum value
	* @param {number=} max=100 - The maximum value
	* @param {number=} step - Ttep the value by
  *
  * @usage
  * <hljs lang="html">
  * <br-slider min="0" max="100" ng-model="info.slider" id="slider"></br-slider>
  * </hljs>
  */

brSliderDirective.$inject = ['$window', '$brUtil', '$brConstant', '$brTheme', '$parse', '$brGesture', '$$rAF', '$timeout'];
function brSliderDirective($window, $brUtil, $brConstant, $brTheme, $parse, $brGesture, $$rAF, $timeout){
	var directive = {
		scope: {},
		require: '?ngModel',
		template:
			'<div class="br-slider-wrapper">' +
				'<div class="br-track-container">' +
					'<div class="br-track"></div>' +
					'<div class="br-track br-track-fill"></div>' +
				'</div>' +
				'<div class="br-thumb-container">' +
					'<div class="br-thumb"></div>' +
					'<div class="br-focus-ring"></div>' +
					'<div class="br-slider-value" ng-if="showThumbValue">{{modelValue}}</div>' +
				'</div>' +
			'</div>',
		compile: compile
	};

	return directive;


	function compile(tElement, tAttrs){
		tElement.attr({
			tabIndex: 0,
			role: 'slider'
		});

		return postLink;
	}

	function postLink(scope, element, attr, ngModelCtrl){
		var min;
		var max;
		var step;
		var dimensions = {};
		var isDragging = false;
		var isScrolling = false;
		var dragPer;
		var dragPos;
		var dragStep;

		var disabledGetter = $parse(attr.ngDisabled);
		var thumb = angular.element(element[0].querySelector('.br-thumb'));
		var thumbRing = angular.element(element[0].querySelector('.br-focus-ring'));
		var thumbContainer = thumb.parent();
		var trackContainer = angular.element(element[0].querySelector('.br-track-container'));
		var activeTrack = angular.element(element[0].querySelector('.br-track-fill'));

		scope.showThumbValue = false;


		$brTheme(element);
		ngModelCtrl = ngModelCtrl || $brUtil.fakeNgModel();

		ngModelCtrl.$render = ngModelRender;
		ngModelCtrl.$viewChangeListeners.push(ngModelRender);
		ngModelCtrl.$formatters.push(minMaxValidator);
		ngModelCtrl.$formatters.push(stepValidator);

		attr.min = attr.min ? attr.$observe('min', updateMin) : updateMin(0);
		attr.max = attr.max ? attr.$observe('max', updateMax) : updateMax(100);
		attr.step = attr.step ? attr.$observe('step', updateStep) : updateStep(1);



		$brGesture.register(element, 'press');
		$brGesture.register(element, 'scroll');
		element
			.on('keydown', keydownListener)
			.on('$br.pressdown', onDown)
			.on('$br.pressup', onUp)
			.on('$br.scrollstart', scrollStart)
			.on('$br.scrollend', scrollEnd);

		$brGesture.register(thumbContainer, 'drag');
		thumbContainer
			.on('$br.dragstart', dragStart)
			.on('$br.drag', drag)
			.on('$br.dragend', dragEnd);



		var debouncedUpdateAll = $$rAF.throttle(updateAll);
		angular.element($window).on('resize', debouncedUpdateAll);

		scope.$on('$destroy', function() {
			angular.element($window).off('resize', debouncedUpdateAll);
		});

		function updateAll() {
			setDimensions();
			ngModelRender();
		}

		function updateMin(value) {
			min = parseFloat(value);
			ngModelRender();
		}
		function updateMax(value) {
			max = parseFloat(value);
			ngModelRender();
		}
		function updateStep(value) {
			step = parseFloat(value);
		}



		//--- Events ---


		function keydownListener(ev) {
			if(disabledGetter(scope)) return;

			var changeAmount;
			if (ev.keyCode === $brConstant.KEY_CODE.LEFT_ARROW) {
				changeAmount = -step;
			} else if (ev.keyCode === $brConstant.KEY_CODE.RIGHT_ARROW) {
				changeAmount = step;
			}
			if (changeAmount) {
				if (ev.metaKey || ev.ctrlKey || ev.altKey) {
					changeAmount *= 4;
				}
				ev.preventDefault();
				ev.stopPropagation();
				var value = ngModelCtrl.$viewValue + changeAmount;
				var minMaxNum = minMaxValidator(value);

				scope.$evalAsync(function() {
					ngModelCtrl.$setViewValue(minMaxNum);
				});
			}
		}

		function onDown(e) {
			if (disabledGetter(scope) || isDragging || isScrolling) return;

			setDimensions();
			element.addClass('active');
			element[0].focus();
			scope.showThumbValue = true;
		}

		function onUp(e){
			if (disabledGetter(scope) || isDragging || isScrolling) return;

			element.removeClass('active');
			setValue(e.pointer.x);

			$timeout(function(){
				scope.showThumbValue = false;
			}, 1000);
		}



		//--- Drag ---
		function scrollStart(){
			isScrolling = true;
			scope.showThumbValue = false;
			element[0].blur();
			element.removeClass('active');
		}

		function scrollEnd(){
			isScrolling = false;
		}

		function dragStart(e){
			if(disabledGetter(scope) || isScrolling) return;

			e.preventDefault();
			e.srcEvent.preventDefault();

			isDragging = true;
			setDimensions();
			element.addClass('dragging');
			scope.showThumbValue = true;
		}

		function dragEnd(e){
			if(!isDragging || isScrolling) return;

			isDragging = false;
			element.removeClass('dragging');
			scope.showThumbValue = false;
		}

		function drag(e) {
			if(!isDragging || isScrolling) return;

			e.preventDefault();
			e.srcEvent.preventDefault();

			updateValueOnSlide(e.pointer.x);
		}


		function updateValueOnSlide(value){
			scope.$evalAsync( function() {
				dragPer = positionToPercent(value);
				dragPos = percentToValue(dragPer);
				dragStep = stepValidator(dragPos);
				ngModelCtrl.$setViewValue(dragStep);
			});
		}

		// Set Value and update view
		function setValue(value){
			var percent = positionToPercent(value);
			var perValue = percentToValue(percent);
			var minMaxNum = minMaxValidator(perValue);
			var stepNum = stepValidator(minMaxNum);
			scope.$apply(function() {
				ngModelCtrl.$setViewValue(stepNum);
				ngModelRender();
			});
		}

		function ngModelRender() {
			if (isNaN(ngModelCtrl.$viewValue)) {
				ngModelCtrl.$viewValue = ngModelCtrl.$modelValue || 0;
			}

			var percent = (ngModelCtrl.$viewValue - min) / (max - min);
			scope.modelValue = ngModelCtrl.$viewValue;
			setSliderPercent(percent);
		}

		function positionToPercent(value){
			return Math.max(0, Math.min(1, (value - dimensions.left) / (dimensions.width)));
		}

		function percentToValue(value){
			return min + value * (max - min);
		}

		function stepValidator(value){
			return Math.round(value / step) * step;
		}


		function setSliderPercent(percent) {
			activeTrack.css('width', (percent * 100) + '%');
			thumbContainer.css(
				'left',
				(percent * 100) + '%'
			);
			element.toggleClass('br-min', percent === 0);
		}

		function minMaxValidator(value){
			return Math.max(min, Math.min(max, value));
		}

		setDimensions();
		function setDimensions() {
			dimensions = trackContainer[0].getBoundingClientRect();
		}
	}
}
