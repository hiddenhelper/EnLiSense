import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import template from './symptomAdd.html';

import { Symptoms } from '../../../api/symptoms';
import { Conditions } from '../../../api/conditions';

class SymptomAdd {
  constructor($scope, $reactive, $stateParams, $state, viewService, viewCacheService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.symptom = {
      'label':'',
      'notes':'',
      'condition':'',
      'score': 0,
      'valid': true
    };

    this.$state = $state;
    this.viewService = viewService;
    this._id = $stateParams._id;

    this.scrollerSettings = {
      theme: 'ios',
      display: 'bottom',
      minWidth: 200
    };

    this.helpers({
      conditions(){
        return Conditions.find({owner: Meteor.userId()});
      }
      /*,
      conditionsCount() {
        return Counts.get('numberOfConditions');
      }*/
    });

    this.autorun(() => {
      this.getReactively('conditions');
      if (this.conditions) {
        this.conditionsCount = this.conditions.length;
      }
    });
  }

  submit() {

    this.symptom.owner = Meteor.userId();
    Symptoms.insert(this.symptom);

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.go('symptomsList',{_id:this._id, cached:true});

    this.reset()

  }

  reset() {
    this.symptom = {
      'label':'',
      'notes':'',
      'score': 0,
      'valid': true
    };
  }

  goBack() {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'back';

    // always transition back to more
    this.$state.transitionTo('symptomsList');

  }
}

const name = 'symptomAdd';

// create a module
export default angular.module(name, [
  angularMeteor,
  'mobiscroll-select'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: SymptomAdd
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('symptomAdd', {
      url: '/symptomAdd',
      params:{ _id: undefined },
      template: '<ion-view hide-back-button="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Add Symptom</span>' +
                '</ion-nav-title>' +
                '<symptom-add></symptom-add>' +
                '</ion-view>',
      controller: function($scope, $state, $stateParams, viewService) {
        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('symptomsList', {_id:$stateParams._id, cached:true});

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
