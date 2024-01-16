import _ from 'underscore';
import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './conditionsList.html';

import { Conditions } from '../../../api/conditions';
import { ConditionsState } from '../../../api/conditionsState';

import { name as ConditionAdd } from '../conditionAdd/conditionAdd';
import { name as ConditionDetails } from '../conditionDetails/conditionDetails';

class ConditionsList {
  constructor($scope, $reactive, $state, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    this.myState = undefined
    this._id = undefined

    this.dateScrollerSettings = {
      theme: 'ios',
      display: 'bottom',
      max: new Date()
    }

    this.subscribe('conditions');
    this.subscribe('conditionsState');

    this.helpers({
      conditions() {
        return Conditions.find({});
      },
      conditionsState() {
        return ConditionsState.findOne({'archive': false});
      }
    });

    this.autorun(() => {
      this.getReactively('conditionsState');

      if (this.conditionsState) {
        this.myState = this.conditionsState.myState
        this._id = this.conditionsState._id
      }
    });

  }

  changeState(state) {
    if (state === this.myState) {
      this.myState = undefined
    } else {
      this.myState = state
    }
  }

  viewHandler(route, params) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    if (!params) {
      params = {}
    }

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  update() {

    if (this._id) {
      ConditionsState.update({_id: this._id},{$set:{'archive': true, 'removedTime': Date.now()}})
    }

    ConditionsState.insert({
      owner: Meteor.userId(),
      "myState": this.myState,
      'archive': false,
      'enteredTime': Date.now(),
      'removedTime': undefined,
      'firstNoticedDate': this.conditionsState.firstNoticedDate,
      'dignosedDate': this.conditionsState.dignosedDate,
      'lastFlareDate': this.conditionsState.lastFlareDate,
      'severity': this.conditionsState.severity
    })

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go('more');
  }

}


const name = 'conditionsList';

// create a module
export default angular.module(name, [
  angularMeteor,
  ConditionAdd,
  ConditionDetails
])
  .component(name, {
    template,
    controllerAs: name,
    controller: ConditionsList
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('conditionsList', {
      url: '/conditionsList',
      template: '<ion-view title="Conditions" hide-back-button="false" cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Conditions</span>' +
                '</ion-nav-title>' +
                '<conditions-list></conditions-list>' +
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
