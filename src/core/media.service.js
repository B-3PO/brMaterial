/**
 * @ngdoc module
 * @name media
 */
angular
  .module('brMaterial')
  .factory('$brMedia', brMediaFactory);



/**
 * @ngdoc service
 * @name $brMedia
 * @module media
 *
 * @description
 * `$brMedia` provides boolean values for queries its given
 *
 * ### Available Queries
 * - `sm` - (max-width: 599px)
 * - `md` - (max-width: 959px)
 * - `lg` - (max-width: 1199px)
 *
 * @usage
 * <hljs lang="js">
 * vm isSmall = $brMedia('sm');
 * vm isMedium = $brMedia('md');
 * vm isLarge = $brMedia('lg');
 * </hljs>
 */
brMediaFactory.$inject = ['$brConstant', '$rootScope', '$window'];
function brMediaFactory ($brConstant, $rootScope, $window) {
  var queries = {};
  var mqls = {};
  var results = {};
  var normalizeCache = {};


  return $brMedia;

  function $brMedia(query) {
    var validated = queries[query];
    if (angular.isUndefined(validated)) {
      validated = queries[query] = validate(query);
    }

    var result = results[validated];
    if (angular.isUndefined(result)) {
      result = add(validated);
    }

    return result;
  }



  function validate(query) {
    return $brConstant.MEDIA[query] ||
           ((query.charAt(0) !== '(') ? ('(' + query + ')') : query);
  }


  function add(query) {
    var result = mqls[query] = $window.matchMedia(query);
    result.addListener(onQueryChange);
    return (results[result.media] = !!result.matches);
  }

  function onQueryChange(query) {
    $rootScope.$evalAsync(function() {
      results[query.media] = !!query.matches;
    });
  }
}
