/**
 * Implements hook_field_formatter_view().
 */
function video_embed_field_field_formatter_view(entity_type, entity, field, instance, langcode, items, display) {
  try {

    //dpm(entity_type);
    //dpm(entity);
    //dpm(field);
    //dpm(instance);
    //dpm(langcode);
    //dpm(items);
    //dpm(display);

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

