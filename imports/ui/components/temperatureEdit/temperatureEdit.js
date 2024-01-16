import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './temperatureEdit.html';

import { DisplayPreferences } from '../../../api/displayPreferences';

class TemperatureEdit {
  constructor($scope, $state, $reactive, viewService){
    'ngInject';

    $reactive(this).attach($scope);

    this.viewService = viewService;
    this.$state = $state;

    this.temperature = {};

    this.subscribe('temperature');
    this.helpers({
      temperature() {
        return DisplayPreferences.findOne({});
      }
    });
  }

  update() {

    // new entry
    if (!this.temperature.hasOwnProperty('_id')) {
      this.temperature.owner = Meteor.userId();
      DisplayPreferences.insert(this.temperature);
    } else {
      DisplayPreferences.update({
        _id: this.temperature._id
      }, {
        $set: {
          celsius: this.temperature.celsius
        }
      });
    }

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always goes back to more
    this.$state.transitionTo('more');

  }

}

const name = 'temperatureEdit';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: TemperatureEdit
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('temperatureEdit', {
      url: '/temperatureEdit',
      template: '<ion-view can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 90%;">Display Preferences</span>' +
                '</ion-nav-title>' +
                '<temperature-edit></temperature-edit>' +
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
