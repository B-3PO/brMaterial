/**
 * @ngdoc module
 * @name icon
 */

angular
  .module('brMaterial')
  .directive('brIcon', brIconDirective);



/**
  * @ngdoc directive
  * @name brIcon
  * @module icon
  *
  * @description
  * `<br-icon>` will dispaly font icons.
  * You can add more font icons by using icomoon.io and creating a font icon set
  *
  * @param {pixels=} br-size - The size in pixels
  * @param {HEX=} br-color - The color. If you place icons in button they will inherit the buttons color
  * @param {string} br-font-icon - The values you can use
  *
  * - alarm
  * - schedule
  * - account_box
  * - add
  * - add_a_photo
  * - alarm_add
  * - add_alert
  * - add_box
  * - add_circle
  * - add_shopping_cart
  * - alarm_off
  * - announcement
  * - arrow_back
  * - arrow_downward
  * - arrow_forward
  * - arrow_upward
  * - close
  * - poll
  * - flag
  * - attach_file
  * - cloud_upload
  * - battery_alert
  * - battery_charging_full
  * - battery_std
  * - battery_unknown
  * - block
  * - turned_in
  * - phone
  * - cancel
  * - chat
  * - chat_bubble
  * - cloud_download
  * - photo_library
  * - edit
  * - payment
  * - crop
  * - crop_rotate
  * - dehaze
  * - not_interested
  * - done_all
  * - error
  * - event_available
  * - event_busy
  * - event_note
  * - favorite
  * - favorite_border
  * - filter_list
  * - question_answer
  * - forward
  * - help
  * - photo
  * - keyboard_arrow_down
  * - keyboard_arrow_left
  * - keyboard_arrow_right
  * - keyboard_arrow_up
  * - linear_scale
  * - local_bar
  * - local_cafe
  * - restaurant_menu
  * - local_drink
  * - shopping_cart
  * - local_offer
  * - room
  * - more_horiz
  * - more_vert
  * - notifications
  * - notifications_active
  * - notifications_none
  * - notifications_off
  * - notifications_paused
  * - pause
  * - play_arrow
  * - power_settings_new
  * - priority_high
  * - refresh
  * - search
  * - settings
  * - sort_by_alpha
  * - swap_horiz
  * - swap_vert
  * - zoom_in
  * - zoom_out
  * - zoom_out_map
  *
  * @usage
  * <hljs lang="html">
  *   <br-icon br-size="32" br-color="#666" br-font-icon="image"></br-icon>
  * </hljs>
  */
brIconDirective.$inject = ['iconService', '$brTheme'];
function brIconDirective (iconService, $brTheme) {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;



  function link (scope, element, attr) {
    $brTheme(element);

    element.addClass('br-icon');

    var size = '22px';

    // font icon
    if (attr.brFontIcon !== undefined && attr.brFontIcon !== '') {
      element.addClass(iconService.getClassName(attr.brFontIcon));

      if (attr.brColor !== undefined && attr.brColor !== '') {
        element.css('color', attr.brColor);
      }

      if (attr.brSize !== undefined && attr.brSize !== '') {
        size = attr.brSize.replace('px','') + 'px';
      }

      element.css('font-size', size);
      element.css('width', size);
      element.css('height', size);
    }


    // TODO : add svg srce
    // move this to service

  //   function loadByURL(url) {
  //    return $http
  //      .get(url, { cache: $templateCache })
  //      .then(function(response) {
  //        return angular.element('<div>').append(response.data).find('svg')[0];
  //      }).catch(announceNotFound);
  //  }
  }
}
