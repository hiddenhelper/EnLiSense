import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import { Dialogs } from 'ionic-native';

import { Meteor } from 'meteor/meteor';
import { Keyboard } from 'ionic-native';
import template from './login.html';

class Login {
  constructor($scope, $reactive, $state, $ionicViewSwitcher, viewService, $window) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;
    this.$ionicViewSwitcher = $ionicViewSwitcher;
    this.$window = $window;

    this.credentials = {
      username: '',
      password: ''
    };

    this.error = undefined;

    var storage = this.$window.localStorage;
    var faceIDStatus = storage.getItem("faceid"); // get face id enable status from storage
    // storage.setItem(key, value) // Pass a key name and its value to add or update that key.
    // storage.removeItem(key) // Pass a key name to remove that key from storage.


    this.enableFaceID = faceIDStatus === "true" ? true : false;
    this.isFaceKeyAvailable = false;
    var kc = new this.$window.Keychain();
    kc.getForKey((value) => {
      if (value) {
        console.log("Key:" + value);
        this.isFaceKeyAvailable = true;
      }
    }, () => {
    }, "IDB-KEY", "IDB APP")
  }

  changeFaceIDToggle () {
    var storage = this.$window.localStorage;
    storage.setItem("faceid", this.enableFaceID ? "true" : "false") // Pass a key name and its value to add or update that key.
  }

  viewHandler(route, params) {

    // check if logged in
    if (!Meteor.status().connected) {
      this.error = undefined;
      Dialogs.alert(
        "There seems to be no Internet connection. Please check your connection and try again.",
        "Error",
        "OK");
    } else {
      // forward, back, enter, exit, swap
      this.viewService.nextDirection = 'forward';

      // Grab the last view info & transition back
      this.$state.go(route, params);
    }
  }

  login() {

    // clear exist red warning outline
    $('.login-input-container').removeClass('j-border-color-red');
    $('.password-input-container').removeClass('j-border-color-red');

    // check username
    if (this.credentials.username.length < 6) {
      $('.login-input-container').addClass('j-border-color-red');
      this.error = {'message': "Please enter a username longer than 6 characters"};
      return;
    }
    if (this.credentials.username.length > 34) {
      $('.login-input-container').addClass('j-border-color-red');
      this.error = {'message': "Please enter a username shorter than 34 characters"};
      return;
    }

    // check password
    if (this.credentials.password.length < 6) {
      $('.password-input-container').addClass('j-border-color-red');
      this.error = {'message': "Please enter a password longer than 6 characters"};
      return;
    }
    if (this.credentials.password.length > 34) {
      $('.password-input-container').addClass('j-border-color-red');
      this.error = {'message': "Please enter a password shorter than 34 characters"};
      return;
    }

    // check if logged in
    if (!Meteor.status().connected) {
      this.error = undefined;
      Dialogs.alert(
        "There seems to be no Internet connection. Please check your connection and try again.",
        "Error",
        "OK");
    } else {
      this.$ionicViewSwitcher.nextDirection("forward");
      Meteor.loginWithPassword(this.credentials.username, this.credentials.password,
          this.$bindToContext((err) => {
            if (err) {
              this.error = {'message': "Username / Password combination not found"};
            } else {
              if (this.enableFaceID) {
                var kc = new this.$window.Keychain();
                var kcValue = JSON.stringify({
                  username: this.credentials.username,
                  password: this.credentials.password,
                });
                kc.setForKey(() => {
                }, () => {
                }, "IDB-KEY", "IDB APP", kcValue);
              }
              
              this.error = undefined;
              this.$state.go('home');
            }
          })
        );
    }
  }

  loginWithFaceID() {
    this.$window.Fingerprint.isAvailable(() => {
      this.$window.Fingerprint.show({
        description: "FaceID/TouchID Validation"
      }, () => {
        var kc = new this.$window.Keychain();
        kc.getForKey((value) => {
          console.log("Key:" + value);
          var result = JSON.parse(value);
          Meteor.loginWithPassword(result.username, result.password,
            this.$bindToContext((err) => {
              if (err) {
                alert("Username / Password combination not found");
              } else {
                this.$state.go('home');
              }
            })
          );
        }, () => {
          alert("Key is not available in keychain");
        }, "IDB-KEY", "IDB APP")
      }, (error) => {
        alert("Authentication invalid " + error.message);
      });
    }, (error) => {
      alert(error.message);
    });
  }
}

const name = 'login';

// create a module
export default angular.module(name, [
  angularMeteor,
  uiRouter
])
  .component(name, {
    template,
    controllerAs: name,
    controller: Login,
    bindings: {
      tabsIsHidden: '='
    }
  })
  .config(config)
  .run(run);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('login', {
      url: '/login',
      template: '<ion-view title="Login" hide-nav-bar="true" cache-view="false">' +
                '<login></login>' +
                '</ion-view>'
    });
}

function run($ionicPlatform) {
  'ngInject';

  Meteor.startup(() => {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(Keyboard) {
      Keyboard.disableScroll(true);
      Keyboard.hideKeyboardAccessoryBar(false);
    }
    if(window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
}
