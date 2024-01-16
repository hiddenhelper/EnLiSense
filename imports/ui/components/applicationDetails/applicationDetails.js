import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './applicationDetails.html';

class ApplicationDetails {

  constructor($scope, $reactive, $state, viewService){
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$state = $state;
    this.viewService = viewService;

  }


  done() {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always goes back to more
    this.$state.transitionTo('more');
  }

}

const name = 'applicationDetails';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: ApplicationDetails
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('applicationDetails', {
      url: '/applicationDetails',
      template: '<ion-view cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Application Details</span>' +
                '</ion-nav-title>' +
                '<application-details></application-details>' +
                '</ion-view>',
      controller: function($scope, $state, viewService) {
        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('more');
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
