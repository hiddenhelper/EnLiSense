import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './socialHistory.html';
import { SocialHistories } from '../../../api/socialHistories';

class SocialHistory {

  constructor($scope, $reactive, $state, viewService){
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$state = $state;
    this.viewService = viewService;

    // this.subscribe('socialHistory');
    this.helpers({
      socialHistory() {
        return SocialHistories.findOne({owner: Meteor.userId()});
      }
    });

    feetValues = [];
    for (var i = 0; i <= 10; i += 1) {
      feetValues.push({
        display: i,
        value: i
      });
    }

    relationshipValues = [
      {display: 'Single', value: 'Single'},
      {display: 'Married', value: 'Married'},
      {display: 'Divorced', value: 'Divorced'},
      {display: 'Widowed', value: 'Widowed'},
      {display: 'Partnered', value: 'Partnered'}
    ];

    this.relationshipScrollerSettings = {
        theme: 'ios',
        display: 'bottom',
        width: 200,
        wheels: [
            [{
                circular: false,
                data: relationshipValues,
                label: 'Relationship'
            }]
        ],
        showLabel: true,
        minWidth: 130,
        formatValue: function (data) {
          return data[0];
        },
    };

    housingTypeValues = [
      {display: 'Home', value: 'Home'},
      {display: 'Assisted Living', value: 'Assisted Living'}
    ];

    this.housingTypeScrollerSettings = {
        theme: 'ios',
        display: 'bottom',
        width: 200,
        wheels: [
            [{
                circular: false,
                data: housingTypeValues,
                label: 'Housing Type'
            }]
        ],
        showLabel: true,
        minWidth: 130,
        formatValue: function (data) {
          return data[0];
        },
    };

    smokeValues = [
      {display: 'None', value: 'None'},
      {display: 'Social', value: 'Social'},
      {display: '1 pack a week', value: '1 pack a week'},
      {display: '2+ packs a week', value: '2+ packs a week'},
      {display: 'Pack-a-day', value: 'Pack-a-day'},
    ];

    this.currentSmokerScrollerSettings = {
        theme: 'ios',
        display: 'bottom',
        width: 200,
        wheels: [
            [{
                circular: false,
                data: smokeValues,
                label: 'How much?'
            }]
        ],
        showLabel: true,
        minWidth: 130,
        formatValue: function (data) {
          return data[0];
        },
    };

    formerSmokerValues = [
      {display: 'No', value: 'No'},
      {display: 'Yes', value: 'Yes'}
    ];

    this.formerSmokerScrollerSettings = {
        theme: 'ios',
        display: 'bottom',
        width: 200,
        wheels: [
            [{
                circular: false,
                data: formerSmokerValues,
                label: 'Former smoker?'
            }]
        ],
        showLabel: true,
        minWidth: 130,
        formatValue: function (data) {
          return data[0];
        },
    };
  }


  update() {

    // new entry
    if (!this.socialHistory._id) {
      this.socialHistory.owner = Meteor.userId();
      SocialHistories.insert(this.socialHistory);
    } else {
      SocialHistories.update({
        _id: this.socialHistory._id
      }, {
        $set: {
          relationship: this.socialHistory.relationship,
          housingType: this.socialHistory.housingType,
          occupation: this.socialHistory.occupation,
          currentSmoker: this.socialHistory.currentSmoker,
          formerSmoker: this.socialHistory.formerSmoker
        }
      });
    }

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always goes back to more
    this.$state.transitionTo('more');
  }

}

const name = 'socialHistory';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: SocialHistory
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('socialHistory', {
      url: '/socialHistory',
      template: '<ion-view cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Social History</span>' +
                '</ion-nav-title>' +
                '<social-history></social-history>' +
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
