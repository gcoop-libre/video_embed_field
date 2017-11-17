/**
 * Implements hook_field_formatter_view().
 */
function video_embed_field_field_formatter_view(entity_type, entity, field, instance, langcode, items, display) {
  try {
    var content = {};
    $.each(items, function(delta, item) {
        var video_id = _video_embed_field_get_youtube_id(item.video_url); //item.video_url.replace('watch?v=', 'embed/');
        var width = drupalgap_max_width();
        var height = width * .75;
        var attrs = {
          width: width,
          height: height,
          src: 'http://www.youtube.com/embed/' + video_id,
          frameborder: '0',
          allowfullscreen: null
        };
        content[delta] = {
          markup: '<iframe ' + drupalgap_attributes(attrs) + '></iframe>'
        };
    });
    return content;
  }
  catch (error) { console.log('video_embed_field_field_formatter_view - ' + error); }
}

function video_embed_field_field_widget_form (form, form_state, field, instance, langcode, items, delta, element) {
  try {
    // Change it to a textfield input.
    items[delta].type = 'textfield';

    // Determine either the default value or item value, if either, then set the attribute value.
    var value = '';
    if (instance.default_value && instance.default_value.length) {
      value = instance.default_value[0].video_url;
    }
    if (items[delta].item && items[delta].item.video_url) {
      value = items[delta].item.video_url;
    }
    items[delta].options.attributes.value = value;

  }
  catch (error) {
    console.log('video_embed_field_field_widget_form - ' + error);
  }
}

/**
 *
 */
function theme_video_embed_field(variables) {
  try {
    var html = '';
    var video_id = _video_embed_field_get_youtube_id(variables.video_url); //.replace('watch?v=', 'embed/');
    var width = drupalgap_max_width();
    var height = width * .75;
    var attrs = {
      width: width,
      height: height,
      src: 'http://www.youtube.com/embed/' + video_id,
      frameborder: '0',
      allowfullscreen: null
    };
    html = '<iframe ' + drupalgap_attributes(attrs) + '></iframe>';
    return html;
  }
  catch (error) { console.log('theme_video_embed_field - ' + error); }
}

/**
 * Implements hook_assemble_form_state_into_field().
 */
function video_embed_field_assemble_form_state_into_field(entity_type, bundle, form_state_value, field, instance, langcode, delta, field_key, form) {
  try {
    field_key.value = "video_url";
    return form_state_value;
  }
  catch (error) { console.log('video_embed_field_form_state_into_field - ' + error); }
}





/**
 * Calculates the min index for use in finding the id of a youtube video.
 *
 * @param string $pos1
 *   The first index.
 * @param string $pos2
 *   The second index.
 *
 * @return string
 *   The min index.
 */
function _video_embed_get_min(pos1, pos2) {
  if (!pos1) {
    return pos2;
  }
  else if (!pos2) {
    return pos1;
  }
  else {
    return Math.min(pos1, pos2);
  }
}

/**
 * Helper function to get the youtube video's id.
 *
 * @param string $url
 *   The video URL.
 *
 * @return string|bool
 *   The video ID, or FALSE in case the ID can't be retrieved from the URL.
 */
function _video_embed_field_get_youtube_id(url) {
  // Find the ID of the video they want to play from the url.
  if (url.toLowerCase().indexOf('http://') >= 0) {
    url = url.substr(7);
  }
  else if (url.toLowerCase().indexOf('https://') >= 0) {
    url = url.substr(8);
  }

  var pos2;
  var pos = url.toLowerCase().indexOf('v=');
  if (pos >= 0) {
    pos += 2;
    pos2 = url.indexOf('&', pos);
    pos_hash = url.indexOf('#', pos);

    pos2 = _video_embed_get_min(pos2, pos_hash);
  }
  else {
    pos = url.indexOf('/');
    if (pos >= 0) {
      pos++;
      pos2 = url.indexOf('?', pos);
      pos_hash = url.indexOf('#', pos);

      pos2 = _video_embed_get_min(pos2, pos_hash);
    }
  }

  if (pos < 0) {
    return FALSE;
  }
  else {
    if (pos2 > 0) {
      id = url.substr(pos, pos2 - pos);
    }
    else {
      id = url.substr(pos);
    }
  }
  return id;
}
