import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';

import { Meteor } from 'meteor/meteor';

import template from './passwordReset.html';

class PasswordReset {
  constructor($rootScope, $scope, $reactive, $state, $stateParams, $window, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    console.log($stateParams)

    $rootScope.footerIsVisible = false;

    this.viewService = viewService
    this.$state = $state;
    this.$window = $window;
    this.resetPasswordToken = $stateParams.token;
    this.credentials = {};
    this.error = undefined;
    this.complete = false;

  }

  reset() {

    // validate password are equal
    th = this;
    if (this.credentials.password) {
      Accounts.resetPassword(this.resetPasswordToken, this.credentials.password, function(err) {
        if (err) {
          th.error = err;
        } else {
          th.complete = true;
        }
      })
    }

  }

  home() {

    this.viewService.nextDirection = 'forward';
    this.$window.location.href = 'http://www.enlisense.com';

  }

}

const name = 'passwordReset';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: PasswordReset
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('passwordReset', {
      url: '/passwordReset/{token}',
      template: '<password-reset></password-reset>'
    });
}
