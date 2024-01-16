import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { EmailComposer } from 'ionic-native';
import { Meteor } from 'meteor/meteor';

import template from './privacyNotice.html';

class PrivacyNotice {

  constructor($scope, $reactive, $state, viewService){
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    this.email = {
      to: 'pr@enlisense.com',
      subject: 'EnLiSense Privacy Notice',
      body: 'Please enter your message below',
      isHtml: true
    };
  }

  sendEmail() {
    if (Meteor.isCordova) {
      EmailComposer.open(this.email);
    }
  }

  goBack() {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'back';

    // always transition back to more
    this.$state.transitionTo('more');

  }

}

const name = 'privacyNotice';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: PrivacyNotice
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('privacyNotice', {
      url: '/privacyNotice',
      template: '<ion-view can-swipe-back="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Back' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Privacy Notice</span>' +
                '</ion-nav-title>' +
                '<privacy-notice></privacy-notice>' +
                '</ion-view>',
      controller: function($scope, $state, viewService) {
        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('more');

        }
      },
      // resolve: {
      //   currentUser($q) {
      //     if (Meteor.userId() === null) {
      //       return $q.reject('AUTH_REQUIRED');
      //     } else {
      //       return $q.resolve();
      //     }
      //   }
      // }
    });
}
