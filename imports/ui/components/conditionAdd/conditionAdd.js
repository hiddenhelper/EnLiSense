import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './conditionAdd.html';

import { Conditions } from '../../../api/conditions';
import { name as DisplayDateFilter } from '../../filters/displayDateFilter';

class ConditionAdd {
  constructor($scope, $reactive, $state, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    this.condition = {}
    this.reset();

    this.dateScrollerSettings = {
      theme: 'ios',
      display: 'bottom',
      max: new Date()
    }

  }

  reset() {
    this.condition = {
      'label': '',
      'firstNoticedDate': '',
      'dignosedDate': '',
      'firstRemissiondate': '',
      'lastFlareDate': '',
      'severity': 0,
      'notes': ''
    }
  }

  add() {

    this.condition.owner = Meteor.userId();
    Conditions.insert(this.condition);

    this.reset();

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go('conditionsList');

  }
}

const name = 'conditionAdd';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  'mobiscroll-datetime'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: ConditionAdd
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('conditionAdd', {
      url: '/conditionAdd',
      template: '<ion-view hide-back-button="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Add Condition</span>' +
                '</ion-nav-title>' +
                '<condition-add></condition-add>' +
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
