var _vefMediaFiles = {};
var vefYouTubeAccessToken = null;

function video_embed_field_youtube_enabled() {
  return drupalgap.settings.views_embed_field && drupalgap.settings.views_embed_field.youtube;
}

function theme_video_embed_field_upload_progress(variables) {
  return '<div ' + drupalgap_attributes(variables.attributes) + '></div>';
}

function theme_video_embed_field_record_button(variables) {
  return bl('Record video', null, {
    attributes: variables.attributes
  });
}

function theme_video_embed_field_choose_button(variables) {
  return bl('Choose video', null, {
    attributes: variables.attributes
  });
}

/**
 * Returns an array of views_embed_field field names.
 */
function video_embed_field_get_fields() {
  return drupalgap_field_info_fields_from_type('video_embed_field');
}

/**
 * Given a field type, this will return an array of field names matching that type or null if none are found.
 * @param {String} type The type of field.
 * @returns {Array|null}
 */
function drupalgap_field_info_fields_from_type(type) {
  // @TODO move to DrupalGap core.
  var field_names = [];
  var fields = drupalgap_field_info_fields();
  for (var field_name in fields) {
    if (!fields.hasOwnProperty(field_name)) { continue; }
    if (fields[field_name].type && fields[field_name].type == type) {
      field_names.push(fields[field_name].field_name);
    }
  }
  return empty(field_names) ? null : field_names;
}

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

/**
 * Implements hook_field_widget_form().
 */
function video_embed_field_field_widget_form(form, form_state, field, instance, langcode, items, delta, element) {
  try {

    element.type = 'textfield';
    //if (drupalgap.settings.mode != 'phonegap' || !video_embed_field_youtube_enabled()) { return; }

    var element_id = element['und'][delta].id;

    // Progress indicator.
    element.suffix += theme('video_embed_field_upload_progress', {
      attributes: { id: element_id + '-vef-upload-progress' }
    });

    // Record button.
    var onclick = "vefVideoRecordClick('" + form.id + "', '" + field.field_name + "', " + delta + ", '" + element_id + "')";
    element.suffix += theme('video_embed_field_record_button', {
      attributes: {
        id: element_id + '-vef-record-button',
        'data-icon': 'video',
        'data-theme': 'b',
        onclick: onclick
      }    
    });

    // Choose video button.
    var onclick = "vefVideoChooseClick('" + element_id + "')";
    element.suffix += theme('video_embed_field_choose_button', {
      attributes: {
        id: element_id + '-vef-choose-button',
        'data-icon': 'search',
        'data-theme': 'b',
        onclick: onclick
      }
    });

  }
  catch (error) { console.log('video_embed_field_field_widget_form - ' + error); }
}

/**
 * Implements hook_form_alter().
 */
//function video_embed_field_form_alter(form, form_state, form_id) {
//
//  // Only operate on the node edit form, for now.
//  if (form_id != 'node_edit') { return; }
//  var vef_field_names = video_embed_field_get_fields();
//
//}

/**
 * Implements hook_assemble_form_state_into_field().
 */
function video_embed_field_assemble_form_state_into_field(entity_type, bundle, form_state_value, field, instance, langcode, delta, field_key) {
  try {
    field_key.value = "video_url";
    var result = form_state_value;
    return result;
  }
  catch (error) {
    console.log('video_embed_field_assemble_form_state_into_field - ' + error);
  }
}

var _vefVideoChooseElementID = null;
function vefVideoChooseClick(element_id) {
  vefAuthorizeWithGoogle(function() {
    _vefVideoChooseElementID = element_id;
    navigator.camera.getPicture(vefVideoChooseSuccess, vefVideoChooseError, { quality: 100,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: Camera.MediaType.VIDEO
    });
  });
}
function vefVideoChooseSuccess(imageURI) {
  // @WARNING there is a bug here: https://github.com/apache/cordova-plugin-camera/pull/160
  // You need to use the unofficial camera plugin for the fix, for now.
  // @TODO this is the kind of path we are looking for: file:/storage/extSdCard/DCIM/Camera/20160308_104133.mp4
  console.log(imageURI);
  vefUploadVideo(imageURI, _vefVideoChooseElementID);
}
function vefVideoChooseError(message) {
  if (message = 'Selection cancelled.') { return; }
  alert(message);
}

/**
 * 
 */
function vefVideoRecordClick(form_id, field_name, delta, element_id) {

  //if (!_vefMediaFiles[form_id]) { _vefMediaFiles[form_id] = {}; }
  //if (!_vefMediaFiles[form_id][field_name]) { _vefMediaFiles[form_id][field_name] = {}; }
  //if (!_vefMediaFiles[form_id][field_name][delta]) { _vefMediaFiles[form_id][field_name][delta] = {}; }

  if (drupalgap.settings.mode != 'phonegap') {
    drupalgap_alert('Video upload does not work in web app mode!');
    return;
  }

  //if ($('#edit-node-edit-title').val() == '') {
  //  drupalgap_alert(t('Enter a video title first.'));
  //  return;
  //}

  /**
   * SECOND
   */

  // After authenticating with Google, show the video widget.
  var videoWidget = function() {

    // Show Cordova's video browser.
    navigator.device.capture.captureVideo(
        function(mediaFiles) {
          var i, path, len;
          for (i = 0, len = mediaFiles.length; i < len; i += 1) {

            // Grab the local path to the video file, set it aside, and begin the upload.
            //_vefMediaFiles[form_id][field_name][delta] = path;
            vefUploadVideo(mediaFiles[i].fullPath, element_id, mediaFiles[i]);

          }
        },
        function(error) {
          switch (error.code) {
            case 3: // Cancel button
              break;
            default:
              navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
              break;
          }
        },
        { limit:1 }
    );

  };

  /**
   * FIRST
   */

  // Let's first authorize with Google...
  vefAuthorizeWithGoogle(videoWidget);

}

function vefAuthorizeWithGoogle(success) {

  // If we already have a token, just open the video widget.
  // @TODO this token expires a lot quicker than we expected, ~60 minutes, maybe we can set a larger expire time?
  //if (vefYouTubeAccessToken) {
  //  success();
  //  return;
  //}

  // We don't have a token, so we need to get permission from the user and call Google...

  // Build the auth options for Google.
  // @TODO client_id should be retrieved from backend
  var authOptions = {
    client_id: drupalgap.settings.video_embed_field.youtube.client_id,
    redirect_uri: 'http://localhost',
    scope: 'https://www.googleapis.com/auth/youtube'
  };

  // Make the authorization call to Google...
  vef_googleapi.authorize(authOptions).done(function(data) {

    // Set aside the access token, save it to local storage so the user doesn't need to agree again later, then launch
    // the video widget.
    vefYouTubeAccessToken = data.access_token;
    window.localStorage.setItem("vefYouTubeAccessToken", vefYouTubeAccessToken);
    success();

  });
}

function vefUploadVideo(fileURL, element_id, mediaFile) {

  try {
    // @see https://developers.google.com/youtube/v3/docs/videos/insert
    // @see https://github.com/youtube/api-samples/tree/master/javascript

    console.log('building meta data');
    var metadata = {
      snippet: {
        title: drupalgap.settings.title + ' - ' + time(),
        //description: $('#description').text(),
        //tags: this.tags,
        categoryId: 22
      },
      status: {
        privacyStatus: 'unlisted'
      }
    };

    console.log('building file upload');
    var options = new FileUploadOptions();
    options.fileKey = 'file';
    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = 'video/mpg';
    options.chunkedMode = false;
    options.headers = {
      Authorization: 'Bearer ' + vefYouTubeAccessToken
    };
    //options.params = {
    //  "": {
    //    snippet: {
    //      title: 'Video title',
    //      description: 'Video description',
    //      tags: 'Video tags',
    //      categoryId: 22
    //    },
    //    status: {
    //      privacyStatus: 'unlisted'
    //    }
    //  }
    //};
    options.params = {
      part: Object.keys(metadata).join(',')
    };

    // Hide the buttons.
    $('#' + element_id + '-vef-record-button').hide();
    $('#' + element_id + '-vef-choose-button').hide();

    console.log('building file transfer');
    // Start the file transfer.
    var ft = new FileTransfer();
    ft.upload(
        fileURL,
        'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status',
        function (data) {
          drupalgap_alert(t('Video successfully uploaded to YouTube.'), {
            title: t('Upload complete'),
            buttonName: t('OK'),
            alertCallback: function() {
              var response = JSON.parse(data.response);
              var watchURL = 'https://www.youtube.com/watch?v=' + response.id;
              $('#' + element_id).val(watchURL);
            }
          });
        },
        function (e) {
          drupalgap_alert(t('Sorry, the video upload failed!'));
          console.log(JSON.stringify(e));
        },
        options,
        true
    );

    console.log('progress indicator');
    // Upload the progress message along the way.
    ft.onprogress = function (progressEvent) {
      var percent = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2);
      $('#' + element_id + '-vef-upload-progress').html('Uploading to YouTube: ' + percent + '%');
    };
  }
  catch (error) {
    console.log('vefUploadVideo - ' + error);
  }

}

// @see http://stackoverflow.com/questions/23930744/how-to-use-google-login-api-with-cordova-phonegap
var vef_googleapi = {
  authorize: function(options) {

    var deferred = $.Deferred();

    // Build the OAuth consent page URL.
    var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
      client_id: options.client_id,
      redirect_uri: options.redirect_uri,
      response_type: 'code',
      scope: options.scope
    });

    // Open the OAuth consent page in the InAppBrowser
    var authWindow = cordova.InAppBrowser.open(authUrl, '_blank', 'location=no,toolbar=no');


    // The recommendation is to use the redirect_uri "urn:ietf:wg:oauth:2.0:oob"
    // which sets the authorization code in the browser's title. However, we can't
    // access the title of the InAppBrowser.
    //
    // Instead, we pass a bogus redirect_uri of "http://localhost", which means the
    // authorization code will get set in the url. We can access the url in the
    // loadstart and loadstop events. So if we bind the loadstart event, we can
    // find the authorization code and close the InAppBrowser after the user
    // has granted us access to their data.
    authWindow.addEventListener('loadstart', function(event) {
      console.log(JSON.stringify(event));
      var url = event.url;
      var code = /\?code=(.+)$/.exec(url);
      var error = /\?error=(.+)$/.exec(url);
      console.log(url);
      console.log(code);
      console.log(error);

      if (code || error) {
        //Always close the browser when match is found
        authWindow.close();
      }

      if (code) {
        //Exchange the authorization code for an access token
        $.post('https://accounts.google.com/o/oauth2/token', {
          code: code[1],
          client_id: options.client_id,
          //client_secret: options.client_secret,
          redirect_uri: options.redirect_uri,
          grant_type: 'authorization_code'
        }).done(function(data) {
          deferred.resolve(data);
          console.log(JSON.stringify(data));

          //$("#loginStatus").html('Name: ' + data.given_name);
        }).fail(function(response) {
          deferred.reject(response.responseJSON);
        });
      } else if (error) {
        //The user denied access to the app
        deferred.reject({
          error: error[1]
        });
      }
    });

    return deferred.promise();
  }
};

