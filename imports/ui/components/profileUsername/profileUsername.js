import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './profileUsername.html';

class ProfileUsername {

  constructor($scope, $reactive, $state, viewService, $window){
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$state = $state;
    this.viewService = viewService;
    this.$window = $window;

    Meteor.startup(() => {
      this.currentUsername = Meteor.user().username;
    });
    this.newUsername = '';

    this.status = Meteor.status();
    this.autorun(() => {
      this.getReactively('status');
      this.connected = Meteor.status().connected;
    });
  }

  update() {

    this.changeUsername();
    Meteor.startup(() => {
      this.currentUsername = Meteor.user().username;
    });

    this.newUsername = '';

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always goes back to more
    this.$state.transitionTo('profileEdit');
  }

  changeUsername() {
    Meteor.call('changeUsername', this.newUsername,
      (error) => {
        if (error) {
          console.debug('Oops, unable to update username!');
        } else {
          console.debug('Username updated!');

          // update keychain
          var kc = new this.$window.Keychain();
          kc.getForKey((value) => {
            console.log("Key:" + value);
            var result = JSON.parse(value);
            result.username = this.newUsername;
            kc.setForKey(() => {
            }, () => {
            }, "IDB-KEY", "IDB APP", JSON.stringify(result));
          }, () => {
          }, "IDB-KEY", "IDB APP");
        }
      }
    );
  }

}

const name = 'profileUsername';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: ProfileUsername
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('profileUsername', {
      url: '/profileUsername',
      template: '<ion-view cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Change Username</span>' +
                '</ion-nav-title>' +
                '<profile-username></profile-username>' +
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
