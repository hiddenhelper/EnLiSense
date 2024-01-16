import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import 'angular-spinner';

import template from './password.html';
import { Keyboard } from 'ionic-native';
import { name as ErrorMessageFilter } from '../../filters/errorMessageFilter';

class Password {
  constructor($scope, $reactive, $state, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    this.showloader = false;

    this.credentials = {
      email: ''
    };

    this.error = '';
  }

  viewHandler(route, params) {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'back';

    // Grab the last view info & transition back
    this.$state.go(route, params);

    this.error = '';
  }

  reset() {

    // Check if password if valid
    this.showloader = true;

    Accounts.forgotPassword(this.credentials, this.$bindToContext((err) => {
      if (err) {
        this.showloader = false;
        this.error = err;
      } else {

        // forward, back, enter, exit, swap
        this.viewService.nextDirection = 'forward';

        this.$state.go('login');

      }
    }));
  }
}

const name = 'password';

// create a module
export default angular.module(name, [
  angularMeteor,
  uiRouter,
  ErrorMessageFilter
])
  .component(name, {
    template,
    controllerAs: name,
    controller: Password
  })
  .config(config)
  .run(run);

function config($stateProvider) {
  'ngInject';

  $stateProvider.state('password', {
    url: '/password',
    template: '<ion-view cache-view="false" can-swipe-back="false" hide-nav-bar="true">' +
              '<password></password>' +
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
