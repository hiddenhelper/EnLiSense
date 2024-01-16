import _ from 'underscore';
import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';

import template from './moodsList.html';

import { Items } from '../../../api/items';
import { Moods } from '../../../api/moods';
import { name as DisplayDateFilter } from '../../filters/displayDateFilter';
import { name as DisplayTimeFilter } from '../../filters/displayTimeFilter';
import { name as MoodAdd } from '../moodAdd/moodAdd';
import { name as MoodDetails } from '../moodDetails/moodDetails';

class MoodsList {
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
    this.moodIds = [];

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

    this.moodOptions = [
      {'label': 'Positive - High', 'value': 'Positive - High'},
      {'label': 'Positive - Low', 'value': 'Positive - Low'},
      {'label': 'Negative - Low', 'value': 'Negative - Low'},
      {'label': 'Negative - High', 'value': 'Negative - High'}
    ]

    let go = false;

    if (this._id) {

      // If existing item - test if moods in item.moods and adjust slider init
      if (this.cached === true){

        this.item = this.viewCacheService.moodItem;

        for (i in this.viewCacheService.moodItem.moods) {
          if (parseInt(this.viewCacheService.moodItem.moods[i].score) > 0) {
            this.moodIds.push(this.viewCacheService.moodItem.moods[i]._id);
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

          if (this.item && init === false) {
            init = true;

            if ($stateParams.copy === true) {
              delete this.item._id;
            }

            this.viewCacheService.moodItem = this.item;

            for (i in this.item.moods) {
              if (parseInt(this.item.moods[i].score) > 0) {
                this.moodIds.push(this.item.moods[i]._id);
              }
            }
            go = true;
          }
        });
      }

    } else {

      this.item = {
        'entryTimestamp': new Date(),
        'entryType': 'Mood',
        'mood': '',
        'moods': [],
        'notes': ''
      }

      if (this.cached === true){
        this.item = this.viewCacheService.moodItem;
      }

      this.viewCacheService.moodItem = this.item;

      go = true;
    }

    /*
    this.autorun(() => {
      this.getReactively('moodIds');
      this.subscribe('moods', () => [{sort: {label: 1}}, this.moodIds]);
    });
    */

    this.helpers({
      moods() {
        return Moods.find({
          '$and':[
            {owner: Meteor.userId()}
          ,{'$or':[
            { valid: true },
            { _id: { '$in': this.moodIds} }
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
      this.getReactively('moods');

      if (this.moods.length > 0 && go === true) {

          for (j in this.moods) {
            for (i in this.viewCacheService.moodItem.moods) {
              val = this.viewCacheService.moodItem.moods[i];
              if (this.moods[j]._id === val._id) {
                this.moods[j].score = val.score;
                break;
              }
            }
          }

        this.viewCacheService.moodItem.moods = JSON.parse(JSON.stringify(this.moods));
      }
    });

  }

  viewHandler(route, params) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  submit(moodList) {

    this.item.owner = Meteor.userId();
    for (i in moodList) {
      delete moodList[i]['$$hashKey'];
      delete moodList[i]['owner'];
    }
    this.item.moods = moodList;

    /*
    let self = this;
    this.viewService.geoLocation(function(res){
      self.item.location = res;

      //self.journalDateService.currentDate = self.item.entryTimestamp;

      Items.insert(self.item);

      // forward, back, enter, exit, swap
      self.viewService.nextDirection = 'forward';

      // always transition back to more
      self.$state.transitionTo('journal');

      self.reset();
    });
    */
    Items.insert(this.item);

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('journal');

    this.reset();


  }

  update(moodList) {

    for (i in moodList) {
      delete moodList[i]['$$hashKey'];
      delete moodList[i]['owner'];
    }
    this.item.moods = moodList;

    //this.journalDateService.currentDate = this.item.entryTimestamp;

    // Update mongo
    Items.update({
      _id: this.item._id
    }, {
      $set: {
        entryTimestamp: this.item.entryTimestamp,
        entryType: this.item.entryType,
        moods: this.item.moods,
        notes: this.item.notes
      }
    });

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('journal');

    this.reset();
  }

  dropButton() {

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
      'entryType': 'Moods',
      'moods': [],
      'notes': ''
    }

    this.viewCacheService.moodItem.moods = [];
  }

  drop(moodId) {

    this.viewCacheService.moodItem.moods = _.without(this.viewCacheService.moodItem.moods, _.findWhere(this.viewCacheService.moodItem.moods, {
      _id: moodId
    }));

    Moods.remove({_id: moodId});

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


const name = 'moodsList';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  DisplayTimeFilter,
  MoodAdd,
  MoodDetails,
  'mobiscroll-datetime'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: MoodsList
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('moodsList', {
      url: '/moodsList',
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
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Moods</span>' +
                '</ion-nav-title>' +
                '<moods-list></moods-list>' +
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
          $state.transitionTo('moodsList',{'copy': true, '_id': $stateParams._id});

        }

        $scope.goBackHandler = function() {

          // Reset values
          viewCacheService.moodItem = [];

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
