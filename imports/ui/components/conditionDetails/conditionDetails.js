import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './conditionDetails.html';

import { Conditions } from '../../../api/conditions';
import { name as DisplayDateFilter } from '../../filters/displayDateFilter';

class ConditionDetails {
  constructor($scope, $reactive, $stateParams, $state, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    this.condition = Conditions.findOne({
      _id: $stateParams._id
    });

    this.dateScrollerSettings = {
      theme: 'ios',
      display: 'bottom',
      max: new Date()
    }

  }

  drop() {

    Conditions.remove({ _id: this.condition._id });

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go('conditionsList');
  }

  save() {
    Conditions.update({
      _id: this.condition._id
    }, {
      $set: {
        label: this.condition.label,
        firstNoticedDate: this.condition.firstNoticedDate,
        dignosedDate: this.condition.dignosedDate,
        severity: this.condition.severity,
        notes: this.condition.notes
      }
    });

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go('conditionsList');

  }
}

const name = 'conditionDetails';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  'mobiscroll-datetime'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: ConditionDetails
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('conditionDetails', {
      url: '/conditionDetails',
      params: {
        _id: undefined
      },
      template: '<ion-view title="Condition Details" hide-back-button="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Condition Details</span>' +
                '</ion-nav-title>' +
                '<condition-details></condition-details>' +
                '</ion-view>',
      controller: function($scope, $state, viewService) {
        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('conditionsList');
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
