/**
 * @ngdoc module
 * @name spinner
 */
angular
  .module('brMaterial')
  .directive('brSpinner', spinnerDirective);



/**
  * @ngdoc directive
  * @name brSpinner
  * @module spinner
  *
  * @description
  * `<br-spinner>` is a animated spinner that can be used with or without a percentage
  *
  * @param {number=} br-diameter - Used to scale the spinner based on 100px
  * @param {number=} br-value - the percentage (0-100)
  *
  * @usage
  * #### Class Names
  *  - `br-primary` - Themes primary color
  *  - `br-accent` - Themes accent color
  *  - `br-warn` - Themes warn color
  *
  * <hljs lang="html">
  * <br-spinner br-diameter="40"></br-spinner>
  * </hljs>
  */
spinnerDirective.$inject = ['$brTheme', '$brUtil'];
function spinnerDirective ($brTheme, $brUtil) {
  var DEFAULT_SCALING = 0.5;
  var DEFAULT_PROGRESS_SIZE = 100;

   var directive = {
    restrict: 'E',
    scope: true,
    template: '<div class="br-spinner-container">'+
      '<div class="br-spinner-inner">'+
        '<div class="br-spinner-left">'+
          '<div class="br-half-circle"></div>'+
        '</div>'+
        '<div class="br-spinner-right">'+
          '<div class="br-half-circle"></div>'+
        '</div>'+
      '</div>'+
    '</div>',
    link: link
  };
  return directive;



  function link (scope, element, attr) {
    $brTheme(element);

    var hasValue = attr.brValue || attr.value || undefined;
    var leftCircle = angular.element(element[0].querySelector('.br-spinner-left > .br-half-circle'));
    var rightCircle = angular.element(element[0].querySelector('.br-spinner-right > .br-half-circle'));


    element.css($brUtil.toCss({
      transform : 'scale(' + getDiameterRatio() + ')'
    }));

    if (hasValue !== undefined) {
      element.addClass('br-has-value');
      watchAttributes();
    }

    function watchAttributes () {
      var attrName = attr.brValue ? 'brValue' : 'value';

      attr.$observe(attrName, function (value) {
        animatePercent(clamp(value));
      });
    }




    function animatePercent (value) {
      var rightStyles = {};
      var rightValue = 135;

      if (value <= 50) {
        rightStyles.transition = 'transform 0.1s linear';
        rightValue = value / 50 * 180 - 45;
      }
      rightStyles.transform = 'rotate(' + rightValue + 'deg)';



      var leftValue = -45;
      var leftStyles = {};

      if (value >= 50) {
        leftStyles.transition = 'transform 0.1s linear';
        leftValue = (value - 50) / 50 * 180 - 45;
      }
      leftStyles.transform = 'rotate(' + leftValue + 'deg)';

      leftCircle.css($brUtil.toCss(leftStyles));
      rightCircle.css($brUtil.toCss(rightStyles));
    }



    function getDiameterRatio () {
      if (attr.brDiameter === undefined) { return DEFAULT_SCALING; }

      var match = /([0-9]*)%/.exec(attr.brDiameter);
      var value = Math.max(0, (match && match[1] / 100) || parseFloat(attr.brDiameter));

      return  (value > 1) ? value / DEFAULT_PROGRESS_SIZE : value;
    }


    function clamp (value) {
      return Math.max(0, Math.min(value || 0, 100));
    }
  }

}
