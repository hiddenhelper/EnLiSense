/* global cordova device */
import bowser from 'bowser';
import { Meteor } from 'meteor/meteor';

export const isElectron = () => /Electron/.test(navigator.userAgent);


export const hasCordovaPlugin = (id) => {
  if (!Meteor.isCordova) return false;
  const plugins = cordova.require('cordova/plugin_list').metadata;
  return Object.prototype.hasOwnProperty.call(plugins, id);
};

export const webkitOverflowScrolling = (value) =>
  bowser.ios
    ? {
        '-webkit-overflow-scrolling': value,
        // force rerender where webkit-overflow-scrolling prevents them for some reason
        willChange: 'transform',
      }
    : {};

export const isChrome = () => bowser.chrome;

export const isBrowserSupported = () => isElectron() || bowser.chrome || bowser.mobile || bowser.tablet;

export const isInternetExplorer = () => bowser.msie;

export const isCordovaOrMobile = () => bowser.mobile || bowser.tablet || Meteor.isCordova;

export const isMobileBrowser = () => (bowser.mobile || bowser.tablet) && !Meteor.isCordova;

export const isDesktop = () => !isCordovaOrMobile() && !isSmartglass();

export const isAndroid = () => bowser.android;

export const isIos = () => bowser.ios;

export const isSafari = () => bowser.safari;

export const isIosCordova = () => Meteor.isCordova && isIos();

export const isAndroidCordova = () => Meteor.isCordova && isAndroid();

export const isTablet = () => bowser.tablet;

export const isHandlet = () => bowser.mobile;

export const isConferenceSupported = () => {
  if (Meteor.isCordova) return true;
  if (!bowser.ios && bowser.chrome && bowser.check({ chrome: '52' })) return true;
  if (bowser.samsungBrowser && bowser.check({ samsungBrowser: '5' })) return true;

  return false;
};

export const isDesktopChromeBrowser = () => isDesktop() && bowser.chrome && !isElectron();

// add "|| device.model === 'x86_64'" to test iPhone X in simulator ¯\_(ツ)_/¯
export const isIPhoneX = () => device.model.match('iPhone10,([3,6])|iPhone11|iPhone12,(?![8])|iPhone13|iPhone14');

export const isIPhoneXApp = () => Meteor.isCordova && isIPhoneX();

export const isAndroidChromeBrowser = () => isMobileBrowser() && bowser.android && bowser.chrome;

export const isAndroidSamsungBrowser = () => isMobileBrowser() && bowser.android && bowser.samsungBrowser;

export const isIosBrowser = () => isMobileBrowser() && bowser.ios;

export const isBrowser = () =>
  !isSmartglass() && !Meteor.isCordova && (isMobileBrowser() || (bowser.chrome && !isElectron()));

export const isWebViewSufficient = () => !isMobileBrowser() && bowser.check({ chrome: '65' });

export const isChromeLessV66 = () => bowser.chrome && !bowser.check({ chrome: '66' });

export const isChromeHigherOrEqual71 = () => bowser.chrome && Number.parseInt(bowser.version, 10) >= 71;

export const androidBetween44And56 = () => bowser.android && bowser.version > 44 && bowser.version < 56;

export const isChromeNotificationSupported = () => isElectron() || (bowser.blink && !isCordovaOrMobile());
