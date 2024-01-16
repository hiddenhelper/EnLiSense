import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './userFeedback.html';
import { Feedback } from '../../../api/feedback';

class UserFeedback {

  constructor($scope, $reactive, $state, viewService){
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$state = $state;
    this.viewService = viewService;

    this.feedback = {}

    overallFeedbackValues = [
      {display: 'Love it', value: 'Love it'},
      {display: 'Like it', value: 'Like it'},
      {display: 'Hate it', value: 'Hate it'},
      {display: 'Needs improvements', value: 'Needs improvements'}
    ];


    this.overallFeedbackScrollerSettings = {
        theme: 'ios',
        display: 'bottom',
        wheels: [
            [{
                circular: false,
                data: overallFeedbackValues,
                label: ''
            }]
        ],
        minWidth: 200
    };

  }


  update() {

    this.feedback.owner = Meteor.userId();
    Feedback.insert(this.feedback);

    this.feedback = {}

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always goes back to more
    this.$state.transitionTo('more');
  }

}

const name = 'userFeedback';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: UserFeedback
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('userFeedback', {
      url: '/userFeedback',
      template: '<ion-view cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">User Feedback</span>' +
                '</ion-nav-title>' +
                '<user-feedback></user-feedback>' +
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
