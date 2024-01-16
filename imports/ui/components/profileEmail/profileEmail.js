import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './profileEmail.html';

import { name as DisplayEmailFilter } from '../../filters/displayEmailFilter';

class ProfileEmail {

  constructor($scope, $reactive, $state, viewService){
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$state = $state;
    this.viewService = viewService;

    this.error = false;

    this.currentEmail = '';
    if (Meteor.user().emails && Meteor.user().emails.length > 0) {
      this.currentEmail = Meteor.user().emails[0].address;
    }
    this.newEmail = '';

    this.status = Meteor.status();
    this.autorun(() => {
      this.getReactively('status');
      this.connected = Meteor.status().connected;
    });
  }

  update() {

    Meteor.call('changeEmail', this.currentEmail, this.newEmail,
      (error) => {
        if (error) {
          console.log(error);
          $('#currentPassword').addClass('warning');

          this.error = true;

          this.reset();
        } else {
          //console.debug('Email updated!');
          this.reset();
          this.error = false;

          // forward, back, enter, exit, swap
          this.viewService.nextDirection = 'forward';

          // always goes back to more
          this.$state.transitionTo('profileEdit');
        }
      }
    );
  }

  reset() {
    if (Meteor.user().emails.length > 0) {
      this.currentEmail = Meteor.user().emails[0].address;
    } else {
      this.currentEmail = '';
    }
    this.newEmail = '';
  }

}

const name = 'profileEmail';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayEmailFilter
])
  .component(name, {
  template,
  controllerAs: name,
  controller: ProfileEmail
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('profileEmail', {
      url: '/profileEmail',
      template: '<ion-view cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Change Email</span>' +
                '</ion-nav-title>' +
                '<profile-email></profile-email>' +
                '</ion-view>',
      controller: function($scope, $state, viewService) {
        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('profileEdit');
        }
      },
      resolve: {
        currentUser($q) {
          if (Meteor.userId() === null) {
            return $q.reject('AUTH_REQUIRED');
          } else {
            return $q.resolve();
          }
        }
      }
    });
}
