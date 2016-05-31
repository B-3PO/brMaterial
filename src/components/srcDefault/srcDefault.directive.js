/**
 * @ngdoc module
 * @name srcDefault
 */
angular
  .module('brMaterial')
  .directive('brSrcDefault', brSrcDefaultDirective);


/**
  * @ngdoc directive
  * @name brSrcDefault
  * @module srcDefault
  *
  * @description
  * `[br-src-default]` will place a 1x1px blank image into a img element if there is an error loading. You can also pass in an image to use as the default
  *
  * @usage
  * <hljs lang="html">
  * <img src="someURL" br-src-default />
  * </hljs>
  */
function brSrcDefaultDirective() {
  var oneXOneData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQTg1NDY2NTNFRDkxMUU1QjhDQzlGRUI3MjRCMDM1MiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQTg1NDY2NjNFRDkxMUU1QjhDQzlGRUI3MjRCMDM1MiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBBODU0NjYzM0VEOTExRTVCOENDOUZFQjcyNEIwMzUyIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjBBODU0NjY0M0VEOTExRTVCOENDOUZFQjcyNEIwMzUyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+7sGYZAAAABBJREFUeNpi+P//PwNAgAEACPwC/tuiTRYAAAAASUVORK5CYII=';


  var directive = {
    restrict: 'A',
    link: link
  };
  return directive;


  function link(scope, element, attrs) {
    element.bind('load', function(e) {
			var src = angular.element(this).attr("src");
			if (src !== oneXOneData && src !== oneXOneData) {
				element.attr('style', 'width: 100%;');
			}
		});

    element.bind('error', function() {
      angular.element(this).attr("src", attrs.brSrceDefault || oneXOneData);
      element.attr('style', 'height: 0px;');
    });
  }
}
