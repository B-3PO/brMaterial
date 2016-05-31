/**
 * @ngdoc module
 * @name util
 */
angular
  .module('brMaterial')
  .factory('$brUtil', brUtilService);


  /**
   * @ngdoc service
   * @name $brUtil
   * @module util
   *
   * @description
   * `$brUtil` has varios helpful functions
   *
   * @usage
   * ### Debounce
   * <hljs lang="js">
   * var debounceFunc = $brUtil.debounce(func, 1000);
   * function func() {
   *  // do stuff
   * }
   *
   * // function is called every 100ms but only executes every seconds
   * $setInterval(function () {
   *  debounceFunc();
   * }, 100);
   * </hljs>
   *
   *
   * ### Throttle
   * <hljs lang="js">
   * var throttleFunc = $brUtil.throttle(func, 1000);
   * function func() {
   *  // do stuff
   * }
   *
   * // function is called every 100ms but only executes every seconds
   * $setInterval(function () {
   *  throttleFunc();
   * }, 100);
   * </hljs>
   */
brUtilService.$inject = ['$brMobile', '$timeout', '$rootScope', '$brConstant', '$document', '$parse', '$templateRequest', '$templateCache'];
function brUtilService ($brMobile, $timeout, $rootScope, $brConstant, $document, $parse, $templateRequest, $templateCache) {
  var nextUniqueId = [];
  var now = window.performance ?
      angular.bind(window.performance, window.performance.now) :
      Date.now;

  var service = {
    now: now,
    toCss: toCss,
    valueToCss: valueToCss,
    nextTick: nextTick,
    valueOnUse: valueOnUse,
    fakeNgModel: fakeNgModel,
    debounce: debounce,
    throttle: throttle,
    nextUid: nextUid,
    ngOptionsHelper: ngOptionsHelper,
    offsetRect: offsetRect,
    clientRect: clientRect,
    nodesToArray: nodesToArray,
    getClosest: getClosest,
    getNode: getNode,
    parseAttributeBoolean: parseAttributeBoolean,
    scrollbarWidth: getScrollbarWidth(),
    getTemplateFromUrl: getTemplateFromUrl
  };
  return service;






  function getTemplateFromUrl(templateUrl, callback) {
    var template;

    template = $templateCache.get(templateUrl);
    if (template === undefined) {
      $templateRequest(templateUrl).then(function (_template) {
        callback(_template);
      });
    } else {
      // fix for template cache cahcing the entire response not just the string
      callback(template);
    }
  }



  function getScrollbarWidth() {
    var div = angular.element('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>');
    // Append our div, do our calculation and then remove it
    angular.element($document[0].body).append(div);
    var w1 = div[0].clientWidth;
    div.css('overflow-y', 'scroll');
    var w2 = div[0].clientWidth;
    div.remove();
    return (w1 - w2);
  }


  function getClosest(el, tagName, onlyParent) {
    if (el instanceof angular.element) el = el[0];
    tagName = tagName.toUpperCase();
    if (onlyParent) el = el.parentNode;
    if (!el) return null;
    do {
      if (el.nodeName === tagName) {
        return el;
      }
      el = el.parentNode;
    } while (el !== null);
    return null;
  }


  function nodesToArray(nodes) {
    nodes = nodes || [];

    var results = [];
    for (var i = 0; i < nodes.length; ++i) {
      results.push(nodes.item(i));
    }
    return results;
  }


  function valueToCss(value) {
    if (value === undefined) { return undefined; }
    if (isNaN(value)) { return value; }
    else { return value + 'px'; }
  }


  function toCss (raw) {
    var css = { };
    var lookups = 'left top right bottom width height x y min-width min-height max-width max-height';

    angular.forEach(raw, function (value,key) {
      if ( angular.isUndefined(value) ) { return; }

      if ( lookups.indexOf(key) >= 0 ) {
        css[key] = value + 'px';
      } else {
        switch (key) {
          case 'transition':
            convertToVendor(key, $brConstant.CSS.TRANSITION, value);
          break;

          case 'transform':
            convertToVendor(key, $brConstant.CSS.TRANSFORM, value);
          break;

          case 'transformOrigin':
            convertToVendor(key, $brConstant.CSS.TRANSFORM_ORIGIN, value);
          break;
        }
      }
    });

    return css;

    function convertToVendor(key, vendor, value) {
      vendor.split(' ').forEach(function (key) {
        css[key] = value;
      });
    }
  }

  function nextTick (callback, digest) {
		var timeout = service.nextTick.timeout;
		var queue = service.nextTick.queue || [];

		//-- add callback to the queue
		queue.push(callback);

		//-- set default value for digest
		if (digest === null) digest = true;

		//-- store updated digest/queue values
		service.nextTick.digest = service.nextTick.digest || digest;
		service.nextTick.queue = queue;

		//-- either return existing timeout or create a new one
		return timeout || (service.nextTick.timeout = $timeout(processQueue, 0, false));

		/**
		* Grab a copy of the current queue
		* Clear the queue for future use
		* Process the existing queue
		* Trigger digest if necessary
		*/
		function processQueue () {
			var queue = service.nextTick.queue;
			var digest = service.nextTick.digest;

			service.nextTick.queue = [];
			service.nextTick.timeout = null;
			service.nextTick.digest = false;

			queue.forEach(function (callback) { callback(); });

			if (digest) $rootScope.$digest();
		}
	}


  function valueOnUse (scope, key, getter) {
    var value = null, args = Array.prototype.slice.call(arguments);
    var params = (args.length > 3) ? args.slice(3) : [ ];

    Object.defineProperty(scope, key, {
      get: function () {
        if (value === null) value = getter.apply(scope, params);
        return value;
      }
    });
  }



  function fakeNgModel () {
		return {
			$fake: true,
			$parsers: [],
			$formatters: [],
			$viewChangeListeners: [],
      $validators: {},
			$render: angular.noop,

			$setViewValue: function(value) {
				this.$viewValue = value;
				this.$render(value);
				this.$viewChangeListeners.forEach(function(cb) { cb(); });
			},
			$isEmpty: function(value) {
				return (''+value).length === 0;
			}
		};
	}



  /**
   * @ngdoc method
   * @name $brUtil#debounce
   * @function
   *
   * @description
   * Limits a function to only be called once every (x) amount of ms no matter how many times it is called
   * The function will be called at the end of the time given.
   * This differs from Throttle because throttle will not make the last call
   *
   * @param {function} func - function to be called
   * @param {number} wait - milliseconds
   * @param {scope=} scope - apply this object
   * @param {boolean=} invokeApply - skips dirty cheking if false
   *
   * @return {function} - you call this function inplace of the original function
   */
  function debounce(func, wait, scope, invokeApply) {
		var timer;

		return function debounced () {
			var context = scope,
			args = Array.prototype.slice.call(arguments);

			$timeout.cancel(timer);
			timer = $timeout(function () {
				timer = undefined;
				func.apply(context, args);
			}, wait || 10, invokeApply );
		};
	}



  /**
   * @ngdoc method
   * @name $brUtil#throttle
   * @function
   *
   * @description
   * Limits a function to only be called once every (x) amount of seconds
   * The function will only be called if no function has been called wihtin the delay
   * This differes from debounced because bebounced will always execute one last call
   *
   * @param {function} func - function to be called
   * @param {number} delay - milliseconds
   *
   * @return {function}
   */
  function throttle(func, delay) {
      var recent;

      return function throttled () {
        var context = this;
        var args = arguments;
        var now = Date.now();

        if (!recent || (now - recent > delay)) {
          func.apply(context, args);
          recent = now;
        }
      };
    }



  /**
   * @ngdoc method
   * @name $brUtil#nextUid
   * @function
   *
   * @description
   * Genreates a unique uid
   *
   * @return {string}
   */
  function nextUid() {
		var index = nextUniqueId.length;
		var digit;

		while(index) {
			index--;
			digit = nextUniqueId[index].charCodeAt(0);

			if (digit == 57 /*'9'*/) {
				nextUniqueId[index] = 'A';
				return nextUniqueId.join('');
			}

			if (digit == 90  /*'Z'*/) {
				nextUniqueId[index] = '0';
			} else {
				nextUniqueId[index] = String.fromCharCode(digit + 1);
				return nextUniqueId.join('');
			}
		}

		nextUniqueId.unshift('0');
		return nextUniqueId.join('');
	}




	function clientRect(element, offsetParent, isOffsetRect) {
		var node = getNode(element);
		offsetParent = getNode(offsetParent || node.offsetParent || document.body);
		var nodeRect = node.getBoundingClientRect();

		// The user can ask for an offsetRect: a rect relative to the offsetParent,
		// or a clientRect: a rect relative to the page
		var offsetRect = isOffsetRect ?
		offsetParent.getBoundingClientRect() :
		{ left: 0, top: 0, width: 0, height: 0 };

		return {
			left: nodeRect.left - offsetRect.left + offsetParent.scrollLeft,
			top: nodeRect.top - offsetRect.top + offsetParent.scrollTop,
			width: nodeRect.width,
			height: nodeRect.height
		};
	}

  function getNode(el) {
    if (el === undefined) { return undefined; }
    return el[0] || el;
  }

	function offsetRect(element, offsetParent) {
		return  clientRect(element, offsetParent, true);
	}





  /**
   * @typedef ngOptionsHelper
   * @type Object
   *
   * @property {function} getLabel - Return the label set by using 'for'. Pass in value
   * @property {function} getViewValue - Return the value set my 'as' by passing in the full value
   * @property {function} getValues - Returns the data set
   * @property {function} getTrackBy - Returns the track by value by passing a full value
   */

  /**
   * @name ngOptionsHelper
   * @function
   *
   * @description
   * Returns a set o function for you to access the data in your ngOptions
   *
   * @param {string} optionsExp - The [ng-options] string
   * @param {scope} scope - The scope that contains the ng options data
   *
   * @return {ngOptionsHelper}
   *
   */
  function ngOptionsHelper (optionsExp, scope) {
    // 1: value expression (valueFn)
    // 2: label expression (displayFn)
    // 3: group by expression (groupByFn)
    // 4: disable when expression (disableWhenFn)
    // 5: array item variable name
    // 6: object item key variable name
    // 7: object item value variable name
    // 8: collection expression
    // 9: track by expression
    var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/;
    var match = optionsExp.match(NG_OPTIONS_REGEXP);

    var valueName = match[5] || match[7];

    // The variable name for the key of the item in the collection
    var keyName = match[6];

    // An expression that generates the viewValue for an option if there is a label expression
    var selectAs = / as /.test(match[0]) && match[1];

    // An expression that is used to track the id of each object in the options collection
    var trackBy = match[9];

    // An expression that generates the viewValue for an option if there is no label expression
    var valueFn = $parse(match[2] ? match[1] : valueName);
    var selectAsFn = selectAs && $parse(selectAs);
    var viewValueFn = selectAsFn || valueFn;
    var trackByFn = trackBy && $parse(trackBy);
    var displayFn = $parse(match[2] || match[1]);
    // var groupByFn = $parse(match[3] || '');
    // var disableWhenFn = $parse(match[4] || '');
    var valuesFn = $parse(match[8]);


    var getTrackByValueFn = trackBy ?
      function(value, locals) { return trackByFn(scope, locals); } :
      function getHashOfValue(value) { return hashKey(value); };



    return {
      getLabel: getLabel,
      getViewValue: getViewValue,
      getValues: getValues,
      getTrackBy: getTrackBy
    };



    // --- Public ----


    function getLabel (value) {
      if (selectAs !== false) {
        return getSelectLabel(value) || undefined;
      }
      return displayFn(scope, getLocals(value));
    }

    function getViewValue (value) {
      return viewValueFn(scope, getLocals(value));
    }

    function getValue (value) {
      return valueFn(scope, getLocals(value));
    }

    function getTrackBy (value) {
      return trackByFn(scope, getLocals(value));
    }

    function getSelectAs (value) {
      return selectAsFn(scope, getLocals(value));
    }

    function getValues () {
      return valuesFn(scope);
    }




    // --- Private ----

    function getLocals (value) {
      var local = {};
      local[valueName] = value;
      return local;
    }

    function hashKey (obj) {
      var key = obj && obj.$$hashKey;

      if (key) {
        if (typeof key === 'function') {
          key = obj.$$hashKey();
        }
        return key;
      }

      key = objType + ':' + obj;

      return key;
    }


    function getSelectLabel (value) {
      var locals;
      var index = 0;
      var optionValues = valuesFn(scope) || [];
      var optionValuesLength = optionValues.length;

      for (index; index < optionValuesLength; index++) {
        locals = getLocals(optionValues[index]);

        if (viewValueFn(scope, locals) === value) {
          return displayFn(scope, locals);
        }
      }
    }
  }

  function parseAttributeBoolean(value, negatedCheck) {
    return value === '' || !!value && (negatedCheck === false || value !== 'false' && value !== '0');
  }

}
