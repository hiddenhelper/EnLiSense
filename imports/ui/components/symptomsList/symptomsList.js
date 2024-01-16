import _ from 'underscore';
import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './symptomsList.html';

import { Items } from '../../../api/items';
import { Symptoms } from '../../../api/symptoms';
import { ConditionsState } from '../../../api/conditionsState';

import { name as DisplayDateFilter } from '../../filters/displayDateFilter';
import { name as DisplayTimeFilter } from '../../filters/displayTimeFilter';
import { name as SymptomAdd } from '../symptomAdd/symptomAdd';
import { name as SymptomDetails } from '../symptomDetails/symptomDetails';

class SymptomsList {
  constructor($scope, $reactive, $state, $stateParams, viewService, journalDateService, viewCacheService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;
    this._id = $stateParams._id;
    this.copy = $stateParams.copy;
    this.cached = $stateParams.cached;
    this.journalDateService = journalDateService;
    this.viewCacheService = viewCacheService;
    this.symptomIds = [];
    this.responses = {}
    this.responses['stoolType'] = undefined

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

    this.numpadSettings = {
        theme: 'ios',
        themeVariant: 'light',
        min: 1,
        max: 99,
        scale: 0,
        preset: 'decimal'
    };

    this.scrollerSettings = {
      theme: 'ios',
      display: 'bottom',
      minWidth: 200,
      multiline: 2
    };

    this.surveyData = {
      myState: '',
      stoolType: '',
      stoolFrequency: '',
      rectalBleeding: '',
      painLevel: '',
      iAmFeeling: '',
      score: 0
    }

    this.stoolTypeOptions = [
      {'label': 'Separate hard lumps, like nuts (hard to pass)', 'value': 1},
      {'label': 'Sausage-shaped but lumpy', 'value': 2},
      {'label': 'Like a sausage but with cracks on its surface', 'value': 3},
      {'label': 'Like a sausage or snake, smooth and soft', 'value': 4},
      {'label': 'Soft blobs with clear-cut edges (passed easily)', 'value': 5},
      {'label': 'Fluffy pieces with ragged edges, a mushy stool', 'value': 6},
      {'label': 'Watery, no solid pieces, entirely liquid', 'value': 7}
    ]

    this.stoolFrequencyOptions = [
      {'label': 'Normal, based on previous day', 'value': 0},
      {'label': '1-2 stools/day more than normal', 'value': 1},
      {'label': '3-4 stools/day more than normal', 'value': 2},
      {'label': '4+ stools/day more than normal', 'value': 3}
    ]

    this.rectalBleedingOptions = [
      {'label': 'No blood seen', 'value': 0},
      {'label': 'Blood with stool less than half the time', 'value': 1},
      {'label': 'Blood with stool half of the time or more', 'value': 2},
      {'label': 'Passing blood alone', 'value': 3}
    ]

    this.painLevelOptions = [
      {'label': 'None', 'value': 0},
      {'label': 'Mild', 'value': 1},
      {'label': 'Moderate', 'value': 2},
      {'label': 'Severe', 'value': 3}
    ]

    this.iAmFeelingOptions = [
      {'label': 'Very well', 'value': 0},
      {'label': 'Slightly below par', 'value': 1},
      {'label': 'Poor', 'value': 2},
      {'label': 'Very poor' ,'value': 3},
      {'label': 'Terrible' ,'value': 4}
    ]

    let go = false;

    this.subscribe('conditionsState');
    this.helpers({
      conditionsState() {
        return ConditionsState.findOne({
          archive: false
        });
      }
    });


    if (this._id) {

      // If existing item - test if symptoms in item.symptoms and adjust slider init
      if (this.cached === true){

        this.item = this.viewCacheService.symptomItem;

        for (i in this.viewCacheService.symptomItem.symptoms) {
          if (parseInt(this.viewCacheService.symptomItem.symptoms[i].score) > 0) {
            this.symptomIds.push(this.viewCacheService.symptomItem.symptoms[i]._id);
          }
        }

        go = true;

      } else {

        this.subscribe('items');
        this.helpers({
          item() {
            return Items.findOne({
              _id: this._id
            });
          }
        });

        let init = false;
        this.autorun(() => {
          this.getReactively('item');

          if (this.item && this.item.hasOwnProperty('surveyData')) {
            this.surveyData = this.item.surveyData
          }


          if (this.item && init === false) {
            init = true;

            if ($stateParams.copy === true) {
              delete this.item._id;
            }

            this.viewCacheService.symptomItem = this.item;

            for (i in this.item.symptoms) {
              if (parseInt(this.item.symptoms[i].score) > 0) {
                this.symptomIds.push(this.item.symptoms[i]._id);
              }
            }
            go = true;
          }
        });
      }

    } else {

      this.item = {
        'entryTimestamp': new Date(),
        'entryType': 'Symptom',
        'symptoms': [],
        'notes': ''
      }

      if (this.conditionsState && this.conditionsState.hasOwnProperty('myState')) {
        this.surveyData.myState = this.conditionsState.myState;
      }

      if (this.cached === true){
        this.item = this.viewCacheService.symptomItem;
      }

      this.viewCacheService.symptomItem = this.item;

      go = true;
    }

    /*
    this.autorun(() => {
      this.getReactively('symptomIds');
      this.subscribe('symptoms', () => [{sort: {label: 1}}, this.symptomIds]);
    });
    */

    this.helpers({
      symptoms() {
        return Symptoms.find({
          '$and':[
            {owner: Meteor.userId()}
          ,{'$or':[
            { valid: true },
            { _id: { '$in': this.symptomIds} }
          ]}
        ]
        },{
          fields:{
            owner:0
          }
        }, {
          sort: {label: 1}
        })
        //return Symptoms.find({},{sort: {label: 1}},);
      }
    });

    let first = true;
    this.autorun(() => {
      this.getReactively('symptoms');

      if (this.symptoms.length > 0 && go === true) {

          for (j in this.symptoms) {
            for (i in this.viewCacheService.symptomItem.symptoms) {
              val = this.viewCacheService.symptomItem.symptoms[i];
              if (this.symptoms[j]._id === val._id) {
                this.symptoms[j].score = val.score;
                break;
              }
            }
          }

        this.viewCacheService.symptomItem.symptoms = JSON.parse(JSON.stringify(this.symptoms));
      }
    });

  }

  calculateScore() {

    if (this.surveyData.myState === "Crohn's'") {
      // SUM of ((# of liquid or very soft stools i.e. type 6 or 7 x 2) + (Abdominal pain x 5))
      if (!this.surveyData.stoolFrequency || this.surveyData.stoolFrequency === '') {
        this.surveyData.stoolFrequency = 0
      }
      if (!this.surveyData.painLevel || this.surveyData.painLevel === '') {
        this.surveyData.painLevel = 0
      }
      this.surveyData.score = this.surveyData.stoolFrequency * 2.0 + this.surveyData.painLevel * 5.0
    } else {
      // SUM of (stool frequency + rectal bleeding)
      if (!this.surveyData.stoolFrequency || this.surveyData.stoolFrequency === '') {
        this.surveyData.stoolFrequency = 0
      }
      if (!this.surveyData.rectalBleeding || this.surveyData.rectalBleeding === '') {
        this.surveyData.rectalBleeding = 0
      }
      this.surveyData.score = this.surveyData.stoolFrequency + this.surveyData.rectalBleeding
    }

  }

  viewHandler(route, params) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  checkValues() {
    message = undefined
    if (this.surveyData.stoolType === ''){
      this.stoolTypeError = true
      return false
    } else {
      this.stoolTypeError = false
    }
    if (this.surveyData.stoolFrequency === ''){
      this.stoolFrequencyError = true
      return false
    } else {
      this.stoolFrequencyError = false
    }
    if (this.surveyData.rectalBleeding === ''){
      this.rectalBleedingError = true
      return false
    } else {
      this.rectalBleedingError = false
    }
    if (this.surveyData.painLevel === ''){
      this.painLevelError = true
      return false
    } else {
      this.painLevelError = false
    }
    if (this.surveyData.iAmFeeling === ''){
      this.iAmFeelingError = true
      return false
    } else {
      this.iAmFeelingError = false
    }
    return true
  }

  submit(symptomList) {

    if (this.checkValues() === true) {

      this.calculateScore()

      this.item.owner = Meteor.userId();
      for (i in symptomList) {
        delete symptomList[i]['$$hashKey'];
        delete symptomList[i]['owner'];
      }
      this.item.symptoms = symptomList;

      this.surveyData.myState = this.conditionsState.myState

      this.item.surveyData = this.surveyData

      /*
      let self = this;
      this.viewService.geoLocation(function(res){
        self.item.location = res;
        Items.insert(self.item);

        //self.journalDateService.currentDate = self.item.entryTimestamp;

        // forward, back, enter, exit, swap
        self.viewService.nextDirection = 'forward';

        // always transition back to more
        self.$state.transitionTo('journal');

        self.reset();
      });
      */

      Items.insert(this.item);

      //self.journalDateService.currentDate = self.item.entryTimestamp;

      // forward, back, enter, exit, swap
      this.viewService.nextDirection = 'forward';

      // always transition back to more
      this.$state.transitionTo('journal');

      this.reset();
    }

  }

  update(symptomList) {

    if (this.checkValues() === true) {

      this.calculateScore()

      for (i in symptomList) {
        delete symptomList[i]['$$hashKey'];
        delete symptomList[i]['owner'];
      }
      this.item.symptoms = symptomList;


      //this.journalDateService.currentDate = this.item.entryTimestamp;

      this.surveyData.myState = this.conditionsState.myState


      // Update mongo
      Items.update({
        _id: this.item._id
      }, {
        $set: {
          entryTimestamp: this.item.entryTimestamp,
          entryType: this.item.entryType,
          symptoms: this.item.symptoms,
          notes: this.item.notes,
          surveyData: this.surveyData
        }
      });

      // forward, back, enter, exit, swap
      this.viewService.nextDirection = 'forward';

      // always transition back to more
      this.$state.transitionTo('journal');

      this.reset();

    }
  }

  dropButton() {

    console.log(this.item)

    // Remove from mongo
    Items.remove({_id: this.item._id});

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('journal');

    this.reset();
  }

  reset() {
    this.item = {
      'entryTimestamp': new Date(),
      'entryType': 'Symptom',
      'symptoms': [],
      'notes': ''
    }

    this.viewCacheService.symptomItem.symptoms = [];
  }

  drop(symptomId) {

    this.viewCacheService.symptomItem.symptoms = _.without(this.viewCacheService.symptomItem.symptoms, _.findWhere(this.viewCacheService.symptomItem.symptoms, {
      _id: symptomId
    }));

    Symptoms.remove({_id: symptomId});

  }

  goBack() {

    // reset all value
    this.reset();

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'back';

    // always transition back to more
    this.$state.transitionTo(this.viewService.tabForDirection);

  }

  viewHandler(route, params) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }
}


const name = 'symptomsList';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  DisplayTimeFilter,
  SymptomAdd,
  SymptomDetails,
  'mobiscroll-select',
  'mobiscroll-datetime',
  'mobiscroll-numpad'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: SymptomsList
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('symptomsList', {
      url: '/symptomsList',
      params: {
        _id: undefined,
        cached: false,
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
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">My Symptoms</span>' +
                '</ion-nav-title>' +
                '<symptoms-list></symptoms-list>' +
                '</ion-view>',
      controller: function($scope, $state, $stateParams, viewService, viewCacheService) {

        $scope._id = $stateParams._id;
        $scope.copyButton = false;

        if ($stateParams._id !== undefined && $stateParams.copy === false) {
          $scope.copyButton = true;
        }

        $scope.copy = function() {

          viewService.nextDirection = 'forward';

          // always transition back to more
          $state.transitionTo('symptomsList',{'copy': true, '_id': $stateParams._id});

        }

        $scope.goBackHandler = function() {

          // Reset values
          viewCacheService.symptomItem = [];

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
