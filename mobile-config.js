App.accessRule('*');
App.accessRule('http://*');
App.accessRule('https://*');

// development: com.enlisense.app
// meteor build --directory ~/code/enlisense-app --mobile-settings settings.json --server "https://dev.enlisense-app.com/"

// production com.enlisense.prod
// meteor build --directory ~/code/enlisense-app --mobile-settings settings.json --server "https://prod.enlisense-app.com/"

App.info({
  id: 'com.enlisense-app.dev',
  version: '0.2.0',
  name: 'IBD AWARE DEV',
  description: 'Advanced medical tracking',
  author: 'AWARE by EnLiSense',
  email: 'pr@enlisense.com',
  website: 'http://www.enlisense.com'
});

App.setPreference('orientation' ,'portrait');
App.setPreference('AutoHideSplashScreen' ,'false');
App.setPreference('ShowSplashScreenSpinner' ,'false');
App.setPreference('SplashScreen', 'screen');
App.setPreference('SplashScreenDelay', '100'); // 150
App.setPreference('FadeSplashScreen', 'true');
App.setPreference('FadeSplashScreenDuration', '1.0');
App.setPreference('StatusBarOverlaysWebView', 'true');
App.setPreference('StatusBarStyle', 'lightcontent');
App.setPreference('KeyboardShrinksView', 'true');
App.setPreference('HideKeyboardFormAccessoryBar', 'true');
App.setPreference('KeyboardResize', 'true');
App.setPreference('KeyboardResizeMode', 'native');
App.setPreference('KeyboardStyle', 'light');

//App.setPreference('StatusBarOverlaysWebView', 'true');
//App.setPreference('StatusBarBackgroundColor', '#3498db');
//App.setPreference('StatusBarStyle', 'default');

App.icons({
  "iphone_2x": "resources/icons/iphone_2x.png", // 120x120
  "iphone_3x": "resources/icons/iphone_3x.png", // 180x180
  "ipad": "resources/icons/ipad.png", // 76x76
  "ipad_2x": "resources/icons/ipad_2x.png", // 152x152
  "ipad_pro": "resources/icons/ipad_pro.png", // 167x167
  "ios_settings": "resources/icons/ios_settings.png", // 29x29
  "ios_settings_2x": "resources/icons/ios_settings_2x.png", // 58x58
  "ios_settings_3x": "resources/icons/ios_settings_3x.png", // 87x87
  "ios_spotlight": "resources/icons/ios_spotlight.png", // 40x40
  "ios_spotlight_2x": "resources/icons/ios_spotlight_2x.png", // 80x80
  "android_mdpi": "resources/icons/android_mdpi.png", // 48x48
  "android_hdpi": "resources/icons/android_hdpi.png", // 72x72
  "android_xhdpi": "resources/icons/android_xhdpi.png", // 96x96
  "android_xxhdpi": "resources/icons/android_xxhdpi.png", // 144x144
  "android_xxxhdpi": "resources/icons/android_xxxhdpi.png" // 192x192
});

App.launchScreens({
  "iphone_2x": "resources/splashes/iphone_2x.png", // 640x490
  "iphoneX_portrait": "resources/splashes/iphone6p_portrait.png", // 2208x1242
  "iphone5": "resources/splashes/iphone5.png", // 640x1136
  "iphone6": "resources/splashes/iphone6.png", // 750x1334
  "iphone6p_portrait": "resources/splashes/iphone6p_portrait.png", // 2208x1242
  "iphone6p_landscape": "resources/splashes/iphone6p_landscape.png", // 2208x1242
  "ipad_portrait": "resources/splashes/ipad_portrait.png", // 768x1024
  "ipad_portrait_2x": "resources/splashes/ipad_portrait_2x.png", // 1536x2048
  "ipad_landscape": "resources/splashes/ipad_landscape.png", // 1024x768
  "ipad_landscape_2x": "resources/splashes/ipad_landscape_2x.png", // 2048x1536
  "android_mdpi_portrait": "resources/splashes/android_mdpi_portrait.png", // 320x480
  "android_mdpi_landscape": "resources/splashes/android_mdpi_landscape.png", // 480x320
  "android_hdpi_portrait": "resources/splashes/android_hdpi_portrait.png", // 480x800
  "android_hdpi_landscape": "resources/splashes/android_hdpi_landscape.png", // 800x480
  "android_xhdpi_portrait": "resources/splashes/android_xhdpi_portrait.png", // 720x1280
  "android_xhdpi_landscape": "resources/splashes/android_xhdpi_landscape.png", // 1280x720
  "android_xxhdpi_portrait": "resources/splashes/android_xxhdpi_portrait.png", // 1080x1440
  "android_xxhdpi_landscape": "resources/splashes/android_xxhdpi_landscape.png" // 1440x1080
})

App.configurePlugin('cordova-plugin-camera', {
  NSCameraUsageDescription: 'profile photo',
  NSPhotoLibraryUsageDescriptionentry: 'profile photo'
});

App.configurePlugin('cordova-plugin-ble-central', {
  NSBluetoothPeripheralUsageDescription: 'Bluetooth allows the app to connect to Enlisense device',
  NSBluetoothAlwaysUsageDescription: 'Bluetooth allows the app to connect to Enlisense device'
});


App.configurePlugin('cordova-plugin-camera', {
  CAMERA_USAGE_DESCRIPTION: 'profile photo',
  PHOTOLIBRARY_USAGE_DESCRIPTION: 'profile photo'
});

App.configurePlugin('phonegap-plugin-push', {
  SENDER_ID: 123456789
});

App.configurePlugin('cordova-plugin-fingerprint-aio', {
  NSFaceIDUsageDescription: "Use Biometrics for Authentication"
});


App.appendToConfig(`<platform name="ios">
  <allow-navigation href="*" />
  <config-file parent="NSAppTransportSecurity" platform="ios" target="*-Info.plist">
    <dict>
      <key>NSAllowsArbitraryLoads</key>
      <true/>
    </dict>
  </config-file>
  <config-file parent="UIStatusBarHidden" platform="ios" target="*-Info.plist">
    <true/>
  </config-file>
  <config-file parent="UIViewControllerBasedStatusBarAppearance" platform="ios" target="*-Info.plist">
    <false/>
  </config-file>
  <config-file parent="NSCameraUsageDescription" platform="ios" target="*-Info.plist">
    <string>Login / Image</string>
  </config-file>
  <config-file parent="NSPhotoLibraryUsageDescription" platform="ios" target="*-Info.plist">
    <string>Login / Image</string>
  </config-file>
  <config-file parent="UIRequiresFullScreen" platform="ios" target="*-Info.plist">
    <true/>
  </config-file>
  <config-file parent="NSBluetoothAlwaysUsageDescription" platform="ios" target="*-Info.plist">
    <string>Bluetooth allows the app to connect to Enlisense device</string>
  </config-file>
  <config-file parent="NSBluetoothPeripheralUsageDescription" platform="ios" target="*-Info.plist">
    <string>Bluetooth allows the app to connect to Enlisense device</string>
  </config-file>
  <config-file parent="UIBackgroundModes" platform="ios" target="*-Info.plist">
    <array>
    <string>bluetooth-central</string>
    </array>
  </config-file>
  <feature name="TouchID">
    <param name="ios-package" value="TouchID" />
  </feature>
  <config-file parent="NSFaceIDUsageDescription" target="*-Info.plist">
    <string>Use Biometrics for Authentication</string>
  </config-file>
</platform>`)

let associatedDomainsConfigFor = (file) => `
  <config-file target="${file}" parent="com.apple.developer.associated-domains">
    <array>
      <string>webcredentials:https://dev.enlisense-app.com</string>
    </array>
  </config-file>`;

App.appendToConfig(`
<platform name="ios">
  ${associatedDomainsConfigFor("*-Debug.plist")}
  ${associatedDomainsConfigFor("*-Release.plist")}
</platform>
`);
