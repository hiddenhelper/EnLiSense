import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './moodAdd.html';

import { Moods } from '../../../api/moods';

class MoodAdd {
  constructor($scope, $reactive, $stateParams, $state, viewService, viewCacheService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.mood = {
      'label':'',
      'notes':'',
      'score': 0,
      'valid': true
    };

    this.$state = $state;
    this.viewService = viewService;
    this._id = $stateParams._id;
  }

  submit() {

    this.mood.owner = Meteor.userId();
    Moods.insert(this.mood);

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.go('moodsList',{_id:this._id, cached:true});

    this.reset()

  }

  reset() {
    this.mood = {
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
    this.$state.transitionTo('moodsList');

  }
}

const name = 'moodAdd';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
    template,
    controllerAs: name,
    controller: MoodAdd
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('moodAdd', {
      url: '/moodAdd',
      params:{ _id: undefined },
      template: '<ion-view hide-back-button="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Add Mood</span>' +
                '</ion-nav-title>' +
                '<mood-add></mood-add>' +
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
