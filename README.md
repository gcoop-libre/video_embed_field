# video_embed_field
The Video Embed Field module for DrupalGap

## Video Upload to YouTube

### Prerequisite

There is a bug(s) with `cordova-plugin-camera` on Android when selecting a pre-existing video:

- https://github.com/apache/cordova-plugin-camera/pull/160

To get around this, uninstall the existing camera plugin and install the unofficial "bleeding edge" version:

```
cordova plugin remove cordova-plugin-camera
cordova plugin add cordova-plugin-camera-unofficial
```

The unofficial version may change over time, so a copy from 2016-03-08 should work until the pull request (and any related issues) mentioned above are resolved/merged.

### Installation

1. Go to console.developers.google.com
2. Create a new project, or use an existing one
3. Enable the Youtube Data API v3, then go to credentials
4. Create an Android API key with your package name and sha-1 cert fingerprint from your keystore
5. Copy the API key
6. Add the Google API Client Library for JavaScript to your app’s index.html file: https://developers.google.com/api-client-library/javascript/
7. Go back to console.developers.google.com and create another set of credentials for your Youtbue Data API v3, but this time make an “Oauth client ID”
8. configure the consent screen
9. then create an oauth client id for “Android”

```
cd cordova-www
touch oauth2callback
chmod 777 oauth2callback
```
