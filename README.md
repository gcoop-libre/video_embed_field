# video_embed_field
The Video Embed Field module for DrupalGap

## Video Upload

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

