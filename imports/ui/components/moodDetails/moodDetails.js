import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './moodDetails.html';

import { Moods } from '../../../api/moods';

class MoodDetails {
  constructor($stateParams, $scope, $reactive, $state, viewService, viewCacheService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;
    this._id = $stateParams._id;
    this.warning = $stateParams.warning;
    this.moodId = $stateParams.moodId;
    this.moodIds = [];
    this.viewCacheService = viewCacheService;

    this.mood = Moods.findOne({
      _id: $stateParams.moodId
    });

  }

  save() {

    Moods.update({
      _id: this.mood._id
    }, {
      $set: {
        label: this.mood.label,
        notes: this.mood.notes
      }
    });

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('moodsList',{_id:this._id, cached:true});
  }

  restore() {

    Moods.update({
      _id: this.mood._id
    }, {
      $set: {
        label: this.mood.label,
        notes: this.mood.notes,
        valid: true,
      }
    });

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('moodsList',{_id:this._id, cached:true});
  }

  drop() {

    this.viewCacheService.moodItem.moods = _.without(this.viewCacheService.moodItem.moods, _.findWhere(this.viewCacheService.moodItem.moods, {
      _id: this.mood._id
    }));

    // Moods.remove({_id: this.mood._id});
    Moods.update({
      _id: this.mood._id
    }, {
      $set: {
        valid: false
      }
    });

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('moodsList',{_id:this._id, cached:true});
  }

  goBack() {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'back';

    // always transition back to more
    this.$state.transitionTo('moodsList',{_id:this._id, cached:true});

  }

}

const name = 'moodDetails';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
    template,
    controllerAs: name,
    controller: MoodDetails
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('moodDetails', {
      url: '/moodDetails',
      params: {
        moodId: '',
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
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Mood Details</span>' +
                '</ion-nav-title>' +
                '<mood-details></mood-details>' +
                '</ion-view>',
      controller: function($scope, $state, $stateParams, viewService) {
        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('moodsList', {_id:$stateParams._id, cached:true});
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
