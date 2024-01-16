// @flow
import ResizeObserver from 'resize-observer-polyfill';

import { addStyle } from './styleHelper';
import {
  isIPhoneXApp,
  isAndroidChromeBrowser,
  isAndroidSamsungBrowser,
  isIosBrowser,
  isCordovaOrMobile,
  isIosCordova,
  isChromeHigherOrEqual71,
} from './browserChecks';

const Units = {
  height: 'px',
  width: 'px',
  top: 'px',
  right: 'px',
  bottom: 'px',
  left: 'px',
  scrollPadding: 'px',
};

const IPHONE_X_SAFE_AREA_PORTRAIT = {
  TOP: 44,
  RIGHT: 0,
  BOTTOM: 34,
  LEFT: 0,
};

const IPHONE_X_SAFE_AREA_LANDSCAPE = {
  TOP: 0,
  RIGHT: 44,
  BOTTOM: 24,
  LEFT: 44,
};

// https://stackoverflow.com/a/26878363
// add some spacing so that safari will trigger minimal ui at some point
// 20px (address bar's height in minimal state) + 44px (bottom menu)
// we just use 64 also for the samsung browser ¯\_(ツ)_/¯
const SCROLL_PADDING = isAndroidSamsungBrowser() ? 64 : 0;

const camelToDash = (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

export default class VirtualScreen {
  nodeObserver;

  resizeObserver;

  lastStyles;

  nodeObserverAnimationFrameID;

  resizeObserverAnimationFrameID;

  constructor() {
    this.lastStyles = {
      position: undefined,
      height: 0,
      width: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      scrollPadding: 0,
      boxShadow: undefined,
      transform: undefined,
      keyboardShowing: false,
    };

    this.nodeObserver = new ResizeObserver((entries) => {
      entries.forEach(({ contentRect: { width, height } }) => {
        this.nodeObserverAnimationFrameID = window.requestAnimationFrame(() => {
          this.setScreenStyle({ top: 0, width, height });
          window.scrollTo(0, 0);
        });
      });
    });

    // especially important on iOS window.addEventListener('resize') is unreliable
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeObserverAnimationFrameID = window.requestAnimationFrame(() => {
        this.onResize();
      });
    });

    if (isIPhoneXApp()) {
      window.addEventListener('keyboardWillShow', this.onKeyboardWillShow);
      window.addEventListener('keyboardWillHide', this.onKeyboardWillHide);
    }
  }

  onKeyboardWillShow = () => {
    this.setScreenStyle({ keyboardShowing: true });
  };

  onKeyboardWillHide = () => {
    this.setScreenStyle({ keyboardShowing: false });
  };

  observe() {
    const container = document.body;
    if (!container) throw new Error('could not attach virtualScreen to body: body not found');

    if (isAndroidChromeBrowser() || isAndroidSamsungBrowser()) {
      this.setScreenStyle({ height: window.innerHeight, width: window.innerWidth });
      window.addEventListener('resize', this.onResize);
      window.addEventListener('scroll', this.onScroll);
    } else if (isIosBrowser()) {
      // set to position fixed in order to block scrolling and rubber-band
      this.setScreenStyle({ position: 'fixed', height: window.innerHeight, width: window.innerWidth });
      this.resizeObserver.observe(container);
    } else if (isIosCordova()) {
      // this fixes scroll issues in iOS Xcode sdk 12 in conjunction with modals (especially the guest modal)
      // this is needed to determine the safe zones on iPhoneX+ as well
      this.setScreenStyle({ height: window.innerHeight, width: window.innerWidth });
      this.nodeObserver.observe(container);
    }
  }

  unobserve() {
    const container = document.body;
    if (!container) throw new Error('could not detach virtualScreen to body: body not found');

    if (isAndroidChromeBrowser() || isAndroidSamsungBrowser()) {
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('scroll', this.onScroll);
    } else if (isIosBrowser()) {
      this.resizeObserver.unobserve(container);
      this.resizeObserver.disconnect();
    } else if (isIosCordova()) {
      this.nodeObserver.unobserve(container);
      this.nodeObserver.disconnect();
    }

    if (isIPhoneXApp()) {
      window.removeEventListener('keyboardWillShow', this.onKeyboardWillShow);
      window.removeEventListener('keyboardWillHide', this.onKeyboardWillHide);
    }

    if (this.nodeObserverAnimationFrameID) window.cancelAnimationFrame(this.nodeObserverAnimationFrameID);
    if (this.resizeObserverAnimationFrameID) window.cancelAnimationFrame(this.resizeObserverAnimationFrameID);
  }

  onResize = () => {
    this.setScreenStyle({ top: 0, width: window.innerWidth, height: window.innerHeight });
    window.scrollTo(0, 0);
  };

  onScroll = () => {
    if (isAndroidChromeBrowser()) {
      window.scrollTo(0, 0);
    } else if (isAndroidSamsungBrowser()) {
      const { scrollY } = window;
      // if scrollY exceeds scrollPadding reset it, otherwise it would grow infinitely
      if (scrollY > SCROLL_PADDING) {
        this.setScreenStyle({ top: 0 });
        window.scrollTo(0, 0);
      } else if (scrollY >= 0) {
        this.setScreenStyle({ top: scrollY });
      }
    }
  };

  static getOrientation = (width, height) =>
    width > height ? 'landscape' : 'portrait';

  // eslint-disable-next-line no-unused-vars
  static applyScrollPadding = (props, lastStyles) => ({
    ...props,
    scrollPadding: SCROLL_PADDING,
  });

  static applySafeArea = (props, lastStyles) => {
    if (isIPhoneXApp()) {
      const safeArea =
        VirtualScreen.getOrientation(props.width || window.innerWidth, props.height || window.innerHeight) ===
        'portrait'
          ? IPHONE_X_SAFE_AREA_PORTRAIT
          : IPHONE_X_SAFE_AREA_LANDSCAPE;
      // single width or height doesn't seem to do the trick to cover the whole screen on orientation change animation
      const boxShadowSize = window.innerWidth > window.innerHeight ? window.innerWidth * 2 : window.innerHeight * 2;

      const safeAreaBottom = props.keyboardShowing ? 0 : safeArea.BOTTOM;

      let { height } = props;
      if (height === (lastStyles.height || 0) - safeAreaBottom) {
        // Use the last height because switching safeAreaBottom in the next if clause
        // will fire resize observer afterwards. This would lead to a recursive loop
        // when we subtract safeAreaBottom over and over again making the height shrink on every change.
        // This happens especially when switching between input fields while the keyboard is showing.
        height = lastStyles.height;
      } else if (height) {
        height = height - safeArea.TOP - safeAreaBottom;
      }

      return {
        ...props,
        top: safeArea.TOP,
        right: safeArea.RIGHT,
        bottom: safeAreaBottom,
        left: safeArea.LEFT,
        height,
        width: props.width ? props.width - safeArea.LEFT - safeArea.RIGHT : props.width,
        boxShadow: `0 0 0 ${boxShadowSize}px #000000`,
      };
    }

    return props;
  };

  // eslint-disable-next-line no-unused-vars
  static applyStackingContext = (props, lastStyles) => {
    // To avoid rendering issues introduced in chrome 71
    if (isCordovaOrMobile() && isChromeHigherOrEqual71()) {
      return {
        ...props,
        transform: undefined,
      };
    }

    return {
      ...props,
      transform: 'translateZ(0)',
    };
  };

  setScreenStyle = (props) => {
    const p = {
      ...this.lastStyles,
      ...props,
    };

    this.lastStyles = [
      VirtualScreen.applySafeArea,
      VirtualScreen.applyScrollPadding,
      VirtualScreen.applyStackingContext,
    ].reduce((acc, curr) => curr(acc, this.lastStyles), p);

    const styles = Object.keys(this.lastStyles)
      .map((key) => {
        if (key === 'keyboardShowing') return null;

        const value = this.lastStyles[key];

        if (value && key in Units) {
          // $FlowFixMe why flow why
          const unit = Units[key];
          return `--screen-${camelToDash(key)}: ${value}${unit}`;
        }
        if (value) {
          return `--screen-${camelToDash(key)}: ${value}`;
        }

        return null;
      })
      .filter((style) => typeof style === 'string')
      // $FlowFixMe filter checks for null or undefined
      .map((style) => `${style} !important;`);

    addStyle('virtual_screen', `:root { ${styles.join(' ')} }`);
  };
}
