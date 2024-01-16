import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './vitalsItem.html';

import { Items } from '../../../api/items';
import { DisplayPreferences } from '../../../api/displayPreferences';


import { name as DisplayDateFilter } from '../../filters/displayDateFilter';
import { name as DisplayTimeFilter } from '../../filters/displayTimeFilter';
import { name as DisplayFtoCFilter } from '../../filters/displayFtoCFilter';

class VitalsItem {
  constructor($scope, $reactive, $stateParams, $state, viewService, journalDateService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;
    this._id = $stateParams._id;
    this.copy = $stateParams.copy;
    this.journalDateService = journalDateService;

    //const initSymptoms = Symptoms.find({})
    //console.log(initSymptoms);

    this.subscribe('displayPreferences');
    this.helpers({
      displayPreferences() {
        return DisplayPreferences.findOne({});
      }
    });

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

    this.systolicNumpadSettings = {
        theme: 'ios',
        display: 'bottom',
        template: 'ddd',
        fill: 'rtl',
        default: 0,
        disabled: false,
        buttons: ['set','cancel'],
        allowLeadingZero: false
    }

    this.diastolicNumpadSettings = {
        theme: 'ios',
        display: 'bottom',
        template: 'ddd',
        fill: 'rtl',
        default: 0,
        disabled: false,
        buttons: ['set','cancel']
    }

    this.temperatureNumpadSettings = {
        theme: 'ios',
        display: 'bottom',
        template: 'ddd',
        fill: 'rtl',
        default: 0,
        disabled: false,
        buttons: ['set','cancel']
    }

    feetValues = [];
    for (var i = 0; i <= 10; i += 1) {
      feetValues.push({
        display: i,
        value: i
      });
    }

    inchValues = [];
    for (var i = 1; i <= 12; i += 1) {
      inchValues.push({
        display: i,
        value: i
      });
    }
    this.heightScrollerSettings = {
        theme: 'ios',
        display: 'bottom',
        width: 150,
        wheels: [
            [{
                circular: false,
                data: feetValues,
                label: 'feet'
            }, {
                circular: false,
                data: inchValues,
                label: 'inches'
            }]
        ],
        showLabel: true,
        minWidth: 130,
        formatValue: function (data) {
          return {'heightFeet':data[0], 'heightInches':data[1]};
        },
    };

    this.weightNumpadSettings = {
        theme: 'ios',
        display: 'bottom',
        template: 'ddd',
        fill: 'rtl',
        default: 0,
        disabled: false,
        buttons: ['set','cancel']
    }

    this.heartRateNumpadSettings = {
        theme: 'ios',
        display: 'bottom',
        template: 'ddd',
        fill: 'rtl',
        default: 0,
        disabled: false,
        buttons: ['set','cancel']
    }

    /*
    this.settings = {
        theme: 'ios',
        display: 'bottom',
        preset: 'decimal',
        scale: 0,
        max: 9999
    };
    */

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

      this.item = {
        'entryTimestamp': this.journalDateService.currentDate,
        'entryType': 'Vitals',
        'bloodPressure':{
          'bloodPressureSystolic': 0,
          'bloodPressureDiastolic': 0
        },
        'heartRate': 0,
        'height': {
          'heightFeet':0,
          'heightInches':0
        },
        'temperature': 0,
        'weight': 0,
        'notes': ''
      }
    }
  }

  submit() {

    this.item.owner = Meteor.userId();

    /*
    let self = this;
    this.viewService.geoLocation(function(res){
      self.item.location = res;

      Items.insert(self.item);
      self.reset();

      // forward, back, enter, exit, swap
      self.viewService.nextDirection = 'forward';

      // always transition back to more
      self.$state.transitionTo('journal');
    })
    */

    Items.insert(this.item);
    this.reset();

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('journal');

  }

  update() {

    // Update mongo
    Items.update({
      _id: this.item._id
    }, {
      $set: {
        entryTimestamp: this.item.entryTimestamp,
        entryType: this.item.entryType,
        bloodPressure: this.item.bloodPressure,
        heartRate: this.item.heartRate,
        height: this.item.height,
        weight: this.item.weight,
        temperature: this.item.temperature,
        notes: this.item.notes
      }
    });

    // Reset all values
    this.item = {
      'entryTimestamp': new Date(),
      'entryType': 'Vitals',
      'bloodPressure':{
        'bloodPressureSystolic': 0,
        'bloodPressureDiastolic': 0
      },
      'heartRate': 0,
      'height': {
        'heightFeet':0,
        'heightInches':0
      },
      'temperature': 0,
      'weight': 0,
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
    this.reset();

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('journal');

  }

  reset() {
    this.item = {
      'entryTimestamp': new Date(),
      'entryType': 'Vitals',
      'bloodPressure':{
        'bloodPressureSystolic': 0,
        'bloodPressureDiastolic': 0
      },
      'heartRate': 0,
      'height': {
        'heightFeet':0,
        'heightInches':0
      },
      'temperature': 0,
      'weight': 0,
      'notes': ''
    }
  }

  goBack() {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'back';

    // always transition back to more
    this.$state.transitionTo(this.viewService.tabForDirection);

  }
}


const name = 'vitalsItem';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  DisplayTimeFilter,
  DisplayFtoCFilter,
  'mobiscroll-datetime',
  'mobiscroll-scroller',
  'mobiscroll-numpad'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: VitalsItem
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('vitalsItem', {
      url: '/vitalsItem',
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
                '  <button class="button j-header-copy-button" ng-click="copy()" ng-if="_id !== undefined">' +
                '    <p>Copy</p>' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Vitals</span>' +
                '</ion-nav-title>' +
                '<vitals-item></vitals-item>' +
                '</ion-view>',
      controller: function($scope, $state, $stateParams, viewService) {

        $scope._id = $stateParams._id;

        $scope.copy = function() {

          viewService.nextDirection = 'forward';

          // always transition back to more
          $state.transitionTo('vitalsItem',{'copy': true, '_id': $stateParams._id});

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
