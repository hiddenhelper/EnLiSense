import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './profilePassword.html';

class ProfilePassword {

  constructor($scope, $reactive, $state, viewService, $window){
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$state = $state;
    this.viewService = viewService;
    this.$window = $window;

    this.currentPassword = '';
    this.newPassword = '';
    this.error = false;

    this.status = Meteor.status();
    this.autorun(() => {
      this.getReactively('status');
      this.connected = Meteor.status().connected;
    });
  }

  update() {

    Accounts.changePassword(this.currentPassword, this.newPassword,
      (error) => {
        if (error) {

          $('#currentPassword').addClass('warning');

          this.error = true;

          this.currentPassword = '';
          this.newPassword = '';

        } else {
          console.debug('Password updated!');

          // update keychain
          var kc = new this.$window.Keychain();
          kc.getForKey((value) => {
            console.log("Key:" + value);
            var result = JSON.parse(value);
            result.password = this.newPassword;
            kc.setForKey(() => {
            }, () => {
            }, "IDB-KEY", "IDB APP", JSON.stringify(result));
          }, () => {
          }, "IDB-KEY", "IDB APP");

          this.currentPassword = '';
          this.newPassword = '';
          this.error = false;

          // forward, back, enter, exit, swap
          this.viewService.nextDirection = 'forward';

          // always goes back to more
          this.$state.transitionTo('profileEdit');
        }
      });

  }

}

const name = 'profilePassword';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: ProfilePassword
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('profilePassword', {
      url: '/profilePassword',
      template: '<ion-view cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Change Password</span>' +
                '</ion-nav-title>' +
                '<profile-password></profile-password>' +
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
