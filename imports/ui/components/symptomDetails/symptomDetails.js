import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import template from './symptomDetails.html';

import { Symptoms } from '../../../api/symptoms';
import { Conditions } from '../../../api/conditions';

class SymptomDetails {
  constructor($stateParams, $scope, $reactive, $state, viewService, viewCacheService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;
    this._id = $stateParams._id;
    this.warning = $stateParams.warning;
    this.symptomId = $stateParams.symptomId;
    this.symptomIds = [];
    this.viewCacheService = viewCacheService;

    this.scrollerSettings = {
      theme: 'ios',
      display: 'bottom',
      minWidth: 200
    };

    this.symptom = Symptoms.findOne({
      _id: $stateParams.symptomId
    });

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

  save() {

    Symptoms.update({
      _id: this.symptom._id
    }, {
      $set: {
        label: this.symptom.label,
        notes: this.symptom.notes,
        condition: this.symptom.condition
      }
    });

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('symptomsList',{_id:this._id, cached:true});
  }

  restore() {

    Symptoms.update({
      _id: this.symptom._id
    }, {
      $set: {
        label: this.symptom.label,
        notes: this.symptom.notes,
        valid: true,
      }
    });

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('symptomsList',{_id:this._id, cached:true});
  }

  drop() {

    this.viewCacheService.symptomItem.symptoms = _.without(this.viewCacheService.symptomItem.symptoms, _.findWhere(this.viewCacheService.symptomItem.symptoms, {
      _id: this.symptom._id
    }));

    // Symptoms.remove({_id: this.symptom._id});
    Symptoms.update({
      _id: this.symptom._id
    }, {
      $set: {
        valid: false
      }
    });

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('symptomsList',{_id:this._id, cached:true});
  }

  goBack() {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'back';

    // always transition back to more
    this.$state.transitionTo('symptomsList',{_id:this._id, cached:true});

  }

}

const name = 'symptomDetails';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
    template,
    controllerAs: name,
    controller: SymptomDetails
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('symptomDetails', {
      url: '/symptomDetails',
      params: {
        symptomId: '',
        _id: undefined,
        warning: false
      },
      template: '<ion-view hide-back-button="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Symptom Details</span>' +
                '</ion-nav-title>' +
                '<symptom-details></symptom-details>' +
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
