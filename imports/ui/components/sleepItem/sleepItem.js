import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './sleepItem.html';

import { Items } from '../../../api/items';
import { name as DisplayDateFilter } from '../../filters/displayDateFilter';
import { name as DisplayTimeFilter } from '../../filters/displayTimeFilter';


class SleepItem {
  constructor($scope, $reactive, $stateParams, $state, viewService, journalDateService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this._id = $stateParams._id;
    this.copy = $stateParams.copy;
    this.viewService = viewService;
    this.journalDateService = journalDateService;

    this.datetimeSettings = {
        theme: 'auto',
        display: 'bottom',
        buttons: ['cancel','set',{
          text: 'Now',
          cssClass: 'now-btn',
          handler: 'now'
        }],
        dateWheels: '|D M d|',
        steps: {
            minute: 5
        }
    };

    this.scrollerSettings = {
      theme: 'ios',
      display: 'bottom',
      minWidth: 200
    };

    this.sleepOptions = [
      {'label': 'Excellent', 'value': 'Excellent'},
      {'label': 'Good', 'value': 'Good'},
      {'label': 'Fair', 'value': 'Fair'},
      {'label': 'Poor', 'value': 'Poor'},
      {'label': 'Restless', 'value': 'Restless'}
    ]

    //const initSymptoms = Symptoms.find({})
    //console.log(initSymptoms);
    if (this._id && this.copy === false) {

      this.subscribe('items');
      this.helpers({
        item() {
          return Items.findOne({
            _id: this._id
          });
        }
      });

    } else if (this._id && this.copy === true) {

      this.item = Items.findOne({_id: $stateParams._id});
      delete this.item._id;

    } else {

      let d = new Date(this.journalDateService.currentDate);
      d.setHours(d.getHours() - 8);

      this.item = {
        'entryTimestamp': this.journalDateService.currentDate,
        'sleepTimestamp': d,
        'entryType': 'Sleep',
        'quality': 0,
        'duration': 0,
        'notes': ''
      }
    }
  }

  submit() {
    this.item.owner = Meteor.userId();
    this.item.duration = Math.abs(this.item.sleepTimestamp.getTime() - this.item.entryTimestamp.getTime()) / 3600000.0;

    /*
    let self = this;
    this.viewService.geoLocation(function(res){
      self.item.location = res;

      self.journalDateService.currentDate = self.item.entryTimestamp;

      Items.insert(self.item);
      self.reset();

      // forward, back, enter, exit, swap
      self.viewService.nextDirection = 'forward';

      // always transition back to more
      self.$state.transitionTo('journal');
    });
    */

    this.journalDateService.currentDate = this.item.entryTimestamp;

    Items.insert(this.item);
    this.reset();

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('journal');


  }

  update() {

    this.item.duration = Math.abs(this.item.sleepTimestamp.getTime() - this.item.entryTimestamp.getTime()) / 3600000.0;

    this.journalDateService.currentDate = this.item.entryTimestamp;

    // Update mongo
    Items.update({
      _id: this.item._id
    }, {
      $set: {
        entryTimestamp: this.item.entryTimestamp,
        sleepTimestamp: this.item.sleepTimestamp,
        entryType: this.item.entryType,
        quality: this.item.quality,
        duration: this.item.duration,
        notes: this.item.notes
      }
    });

    // Reset all values
    let d = new Date();
    d.setHours(d.getHours() - 8);
    this.item = {
      'entryTimestamp': new Date(),
      'sleepTimestamp': d,
      'entryType': 'Sleep',
      'quality': '0',
      'duration': 0,
      'notes': ''
    }

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('journal');
  }

  drop() {

    // Remove from mongo
    Items.remove({_id: this.item._id});

    // Reset all values
    let d = new Date();
    d.setHours(d.getHours() - 8);
    this.item = {
      'entryTimestamp': new Date(),
      'sleepTimestamp': d,
      'entryType': 'Sleep',
      'quality': '0',
      'duration': 0,
      'notes': ''
    }

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('journal');
  }

  reset() {
    this.item = {};
  }

  goBack() {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'back';

    // always transition back to more
    this.$state.transitionTo(this.viewService.tabForDirection);

  }
}


const name = 'sleepItem';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  DisplayTimeFilter,
  'mobiscroll-datetime',
  'mobiscroll-scroller'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: SleepItem
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('sleepItem', {
      url: '/sleepItem',
      params: {
        _id: undefined,
        copy: false
      },
      template: '<ion-view hide-back-button="false" cache-view="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-buttons side="right">' +
                '  <button class="button j-header-copy-button" ng-click="copy()" ng-if="copyButton">' +
                '    <p>Copy</p>' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Sleep</span>' +
                '</ion-nav-title>' +
                '<sleep-item></sleep-item>' +
                '</ion-view>',
      controller: function($scope, $state, $stateParams, viewService) {

        $scope._id = $stateParams._id;
        $scope.copyButton = false;

        if ($stateParams._id !== undefined && $stateParams.copy === false) {
          $scope.copyButton = true;
        }

        $scope.copy = function() {

          viewService.nextDirection = 'forward';

          // always transition back to more
          $state.transitionTo('sleepItem',{'copy': true, '_id': $stateParams._id});

        }

        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo(viewService.tabForDirection);
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
