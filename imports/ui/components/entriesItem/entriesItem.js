import _ from 'underscore';
import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './entriesItem.html';

import { name as DisplayDateFilter } from '../../filters/displayDateFilter';
import { name as DisplayTimeFilter } from '../../filters/displayTimeFilter';
import { name as StackEntryService } from '../../services/stackEntryService';

import { Entries } from '../../../api/entries';
import { Items } from '../../../api/items';

class EntriesItem{
  constructor($scope, $reactive, $stateParams, $state, viewService, stackEntryService, $ionicListDelegate, journalDateService, categoriesService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.viewService = viewService;
    this.$scope = $scope;
    this.$state = $state;
    this.$ionicListDelegate = $ionicListDelegate;
    this.stackEntryService = stackEntryService;
    this.journalDateService = journalDateService;
    this._id = $stateParams._id;
    this.copy = $stateParams.copy;
    this.type = $stateParams.type;

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

    this.exerciseOptions = [
      {'label': 'Cooldown', 'value': 'Cooldown'},
      {'label': 'Core Training', 'value': 'Core Training'},
      {'label': 'Dance', 'value': 'Dance'},
      {'label': 'Elliptical', 'value': 'Elliptical'},
      {'label': 'Functional Strength Training', 'value': 'Functional Strength Training'},
      {'label': 'High Intensity Interval Training', 'value': 'High Intensity Interval Training'},
      {'label': 'Hiking', 'value': 'Hiking'},
      {'label': 'Indoor Cycle', 'value': 'Indoor Cycle'},
      {'label': 'Indoor Run', 'value': 'Indoor Run'},
      {'label': 'Indoor Walk', 'value': 'Indoor Walk'},
      {'label': 'Kickboxing', 'value': 'Kickboxing'},
      {'label': 'Multisport', 'value': 'Multisport'},
      {'label': 'Open Water Swim', 'value': 'Open Water Swim'},
      {'label': 'Outdoor Cycle', 'value': 'Outdoor Cycle'},
      {'label': 'Outdoor Walk', 'value': 'Outdoor Walk'},
      {'label': 'Pilates', 'value': 'Pilates'},
      {'label': 'Pool Swim', 'value': 'Pool Swim'},
      {'label': 'Rower', 'value': 'Rower'},
      {'label': 'Stair Stepper', 'value': 'Stair Stepper'},
      {'label': 'Tai Chi', 'value': 'Tai Chi'},
      {'label': 'Traditional Strength Training', 'value': 'Traditional Strength Training'},
      {'label': 'Yoga', 'value': 'Yoga'}
    ]

    this.sampleCollectedOptions = [
      {'label': 'Stool', 'value': 'Stool'},
      {'label': 'Saliva', 'value': 'Saliva'},
      {'label': 'Urine', 'value': 'Urine'},
      {'label': 'Blood', 'value': 'Blood'},
      {'label': 'Other', 'value': 'Other'}
    ]

    this.selectScollerSettings = {
      theme: 'ios',
      display: 'bottom',
      minWidth: 200,
      data: categoriesService['Meal']
    };

    this.selectScollerSettingsI = {
      theme: 'ios',
      display: 'bottom',
      minWidth: 200,
      data: categoriesService["Intensity"]
    };

    this.subscribe('item')

    // (1)  If returning to existing item (update)
    if ($stateParams._id || stackEntryService.stack.length > 0 && stackEntryService.stack[0].data) {

      // copy existing item
      if ($stateParams.copy === true) {
        this.item = stackEntryService.stack[0].data;
        delete this.item._id;
        stackEntryService.empty();
      // coming back to item already open
      } else if (stackEntryService.stack.length > 0) {
        this.item = stackEntryService.stack[0].data;
        stackEntryService.empty();
      } else {
        this.item = Items.findOne($stateParams._id);
      }


      // init working item once ready
      let init = false;
      this.autorun(() => {
        this.getReactively('items');
        this.getReactively('entries');

        if (this.item && init === false) {
          // console.log('inner item');
          if (this.item.selected.length > 0) {
            childIds = this.item.selected.map( function(p){ return p._id });
            this.item.selected = Entries.find({_id:{$in:childIds}}, {fields: {'_id':1,'name':1,'brand':1}}).fetch();
          }
          init = true;

          this.item.edit = true;

          params = $stateParams;
          params.copy = false;

          // add existing item to stack
          stackEntryService.add(this.item, JSON.parse(JSON.stringify(params)));

        }
      });

    // (2) Add new item to start stack if init
    } else {

      this.initItem(this.type);
      stackEntryService.add(this.item, JSON.parse(JSON.stringify($stateParams)));

    }

  }

  catMeal(meal) {
    this.item.meal = meal;
  }

  removeContentsFromItem(_id) {

    // hide delete button
    this.$ionicListDelegate.closeOptionButtons();

    // remove from children
    this.stackEntryService.stack[0].data.selected = _.without(this.stackEntryService.stack[0].data.selected, _.findWhere(this.stackEntryService.stack[0].data.selected, {
      _id:_id
    }));

  }

  submit() {

    //this.journalDateService.currentDate = this.item.entryTimestamp;

    // Submit the item to mongo
    let self = this;
    this.item.children = this.item.selected;
    this.item.owner = Meteor.userId();

    Items.insert(self.item);

    // reset stack
    self.stackEntryService.empty();

    self.viewHandler('journal', {});

    // Reset all values
    self.initItem();

    /*
    let self = this;
    this.viewService.geoLocation(function(res){
      self.item.location = res;

      Items.insert(self.item);

      // reset stack
      self.stackEntryService.empty();

      self.viewHandler('journal', {});

      // Reset all values
      self.initItem();
    });
    */

  }

  update() {

    //this.journalDateService.currentDate = this.item.entryTimestamp;

    // Update mongo
    this.item.children = this.item.selected;

    // Update mongo
    Items.update({
      _id: this.item._id
    }, {
      $set: {
        entryTimestamp: this.item.entryTimestamp,
        entryType: this.item.entryType,
        name: this.item.name,
        meal: this.item.meal,
        children: this.item.children,
        selected: this.item.selected,
        notes: this.item.notes,
        duration: this.item.duration,
        intensity: this.item.intensity,
        deliveredToLabDate: this.item.deliveredToLabDate,
        collectionStorage: this.item.collectionStorage,
        collectionMethods: this.item.collectionMethods,
        sampleCollected: this.item.sampleCollected,
        exerciseType: this.item.exerciseType
      }
    });

    // reset stack
    this.stackEntryService.empty();

    this.viewHandler('journal', {});

    // Reset all values
    this.initItem();

  }

  drop() {

    // Remove from mongo
    Items.remove({_id: this.item._id});

    // reset stack
    this.stackEntryService.empty();

    this.viewHandler('journal', {});

    // Reset all values
    this.initItem();
  }

  viewHandler(route, params) {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  initItem() {
    // Reset all values
    this.item = {
      'route': 'entriesItem',
      'entryTimestamp': new Date(),
      'entryType': this.type,
      'name': '',
      'meal': '',
      'children': [],
      'selected': [],
      'notes': '',
      'edit': false,
      'duration': '',
      'intensity': '',
      'deliveredToLabDate': '',
      'collectionStorage': '',
      'collectionMethods': '',
      'sampleCollected': '',
      'exerciseType': ''
    }
  }

}

const name = 'entriesItem';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  DisplayTimeFilter,
  StackEntryService,
  'mobiscroll-datetime'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: EntriesItem
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('entriesItem', {
      url: '/entriesItem',
      params: {
        _id: undefined,
        copy: false,
        type: undefined
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
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">{{ viewTitle }}s</span>' +
                '</ion-nav-title>' +
                '  <entries-item></entries-item>' +
                '</ion-view>',
      controller: function($scope, $stateParams, $state, viewService, stackEntryService) {

        $scope._id = $stateParams._id;
        $scope.viewTitle = $stateParams.type;
        $scope.copyButton = false;

        if ($stateParams._id !== undefined && $stateParams.copy === false) {
          $scope.copyButton = true;
        }

        $scope.copy = function() {

          viewService.nextDirection = 'forward';

          // always transition back to more
          $state.transitionTo('entriesItem',{'copy': true, '_id': $stateParams._id, 'type': $stateParams.type});

        }


        $scope.goBackHandler = function() {

          stackEntryService.empty();

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
