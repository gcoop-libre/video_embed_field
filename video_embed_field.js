/**
 * Implements hook_field_formatter_view().
 */
function video_embed_field_field_formatter_view(entity_type, entity, field, instance, langcode, items, display) {
  try {
    var content = {};
    $.each(items, function(delta, item) {
        var src = item.video_url.replace('watch?v=', 'embed/');
        var width = drupalgap_max_width();
        var height = width * .75;
        var attrs = {
          width: width,
          height: height,
          src: src,
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
    var src = variables.video_url.replace('watch?v=', 'embed/');
    var width = drupalgap_max_width();
    var height = width * .75;
    var attrs = {
      width: width,
      height: height,
      src: src,
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
