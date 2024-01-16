import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Profiles } from '../../../api/profiles';
import { Keyboard } from 'ionic-native';
import template from './register.html';
import termsOfUseModal from './termsOfUseModal.html';


import { Notifications } from '../../../api/notifications';

class Register {
  constructor($scope, $reactive, $stateParams, $state, $mdDialog, $mdMedia, viewService, $window) {
    'ngInject';

    $reactive(this).attach($scope);


    this.$mdDialog = $mdDialog;
    this.$mdMedia = $mdMedia;
    this.$state = $state;
    this.viewService = viewService;
    this.$window = $window;

    this.credentials = {
      username: $stateParams.username,
      email: '',
      password: ''
    };

    this.tmpBirthdate = undefined;

    this.profile = {
      zipCode: undefined,
      birthdate: undefined,
      gender: undefined,
      profileImage: undefined,
      agreeToTerms: undefined
    };

    this.error = '';
  }

  viewHandler(route, params) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'back';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  register() {

    // validate username
    if (!this.credentials.username) {
       console.log('here')
      this.error = {};
      this.error.reason = "Please enter a valid username";
      return;
    }

    if (!this.viewService.isAtLeastLengthN(this.credentials.username, 5)) {
      this.error = {};
      this.error.reason = "Please enter a valid username (5+ length)";
      return;
    }

    if (!this.viewService.isLessThanLengthN(this.credentials.username, 35)) {
      this.error = {};
      this.error.reason = "Please enter a valid username (<35 length)";
      return;
    }

    // validate email
    if (!this.credentials.email) {
      this.error = {};
      this.error.reason = "Please enter a valid email";
      return;
    }

    if (!this.viewService.isValidEmail(this.credentials.email)) {
      this.error = {};
      this.error.reason = "Please enter a valid email";
      return;
    }

    // validate password
    if (!this.credentials.password) {
      this.error = {};
      this.error.reason = "Please enter a valid password";
      return;
    }

    if (!this.viewService.isAtLeastLengthN(this.credentials.password, 8)) {
      this.error = {};
      this.error.reason = "Please enter a valid password (8+ length)";
      return;
    }

    if (!this.viewService.containsLowerCase(this.credentials.password)) {
      this.error = {};
      this.error.reason = "Please enter a valid password (lower case and upper case)";
      return;
    }

    if (!this.viewService.containsUpperCase(this.credentials.password)) {
      this.error = {};
      this.error.reason = "Please enter a valid password (lower case and upper case)";
      return;
    }

    if (!this.viewService.containsSpecialCharacter(this.credentials.password)) {
      this.error = {};
      this.error.reason = "Please enter a valid password (must contain at least 1 special character)";
      return;
    }

    if (!this.viewService.isLessThanLengthN(this.credentials.password, 35)) {
      this.error = {};
      this.error.reason = "Please enter a valid password (<35 length)";
      return;
    }

    this.credentials.email = this.viewService.trimInput(this.credentials.email);

    Accounts.createUser(this.credentials,
      this.$bindToContext((err) => {
        if (err) {
          this.error = err;
        } else {
          var kc = new this.$window.Keychain();
          var kcValue = JSON.stringify({
            username: this.credentials.username,
            password: this.credentials.password,
          });
          kc.setForKey(() => {
          }, () => {
          }, "IDB-KEY", "IDB APP", kcValue);
          
          this.createProfile();

          Notifications.insert({
            owner: Meteor.userId(),
            journalReminder: true,
            syncReminder: true
          });

          cordova.plugins.notification.local.schedule([
            {
              id: 2000,
              title: "IBD AWARE: Add A Journal Entry",
              text: 'How are your feeling today? Complete a survey to track your progress.',
              foreground: true,
              trigger: {
                every: {
                  hour: 7,
                  minute: 0,
                  second: 0
                }
              }
            }
          ])

          cordova.plugins.notification.local.schedule([
            {
              id: 2001,
              title: 'IBD AWARE: Sync Your Device',
              text: 'Add or sync your device with the app. We recommend syncing every 8-12 hrs.',
              foreground: true,
              trigger: {
                every: {
                  hour: 14,
                  minute: 0
                }
              }
            },
            {
              id: 2002,
              title: 'IBD AWARE: Sync Your Device',
              text: 'Add or sync your device with the app. We recommend syncing every 8-12 hrs.',
              foreground: true,
              trigger: {
                every: {
                  hour: 21,
                  minute: 0
                }
              }
            }
          ])


          this.viewService.nextDirection = 'forward';
          this.$state.go('introSlides');
        }
      })
    );

  }

  open(event) {
    this.$mdDialog.show({
      controller($scope, $mdDialog) {
        'ngInject';

        this.close = () => {
          $mdDialog.hide();
        }
      },
      controllerAs: 'termsOfUseModal',
      controller: function($scope, $mdDialog, $state, viewService) {
        'ngInject';

        $scope.done = () => {
          $mdDialog.hide();
        }
      },
      template: termsOfUseModal,
      targetEvent: event,
      parent: angular.element(document.body),
      clickOutsideToClose: false,
      fullscreen: false
    });
  }

  createProfile() {

    this.profile.birthdate = new Date(this.tmpBirthdate);
    // add owner
    this.profile.owner = Meteor.userId();
    // commit to mongo
    Profiles.insert(this.profile);

  }

  setGender(gender) {
    if (gender === 'Male') {
      $('#femaleButton').removeClass('perm-activated');
      $('#otherButton').removeClass('perm-activated');
      $('#maleButton').addClass('perm-activated');
    } else if(gender === 'Female') {
      $('#maleButton').removeClass('perm-activated');
      $('#otherButton').removeClass('perm-activated');
      $('#femaleButton').addClass('perm-activated');
    } else if (gender === 'Other') {
      $('#maleButton').removeClass('perm-activated');
      $('#femaleButton').removeClass('perm-activated');
      $('#otherButton').addClass('perm-activated');
    }
    this.profile.gender = gender;
  }

}

const name = 'register';

// create a module
export default angular.module(name, [
  angularMeteor,
  uiRouter
])
  .component(name, {
    template,
    controllerAs: name,
    controller: Register
  })
  .config(config)
  .run(run);

function config($stateProvider) {
  'ngInject';
  $stateProvider.state('register', {
    url: '/register',
    params: {
      username: ''
    },
    template: '<ion-view cache-view="false" can-swipe-back="false" hide-nav-bar="true">' +
              '<register></register>' +
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
