import _ from 'underscore';
import angular from 'angular';
import angularMeteor from 'angular-meteor';
import chartjs from 'angular-chart.js';
import { Meteor } from 'meteor/meteor';
import 'angular-spinner';

import template from './entryProfile.html';

import { Entries } from '../../../api/entries';
import { Items } from '../../../api/items';
import { Choices } from '../../../api/choices';
import { NearestNeighbors } from '../../../api/nearestNeighbors';

import { name as DisplayDaysSinceFilter } from '../../filters/displayDaysSinceFilter';
import { name as DBService } from '../../services/dBService.js';

class EntryProfile {
  constructor($scope, $reactive, $stateParams, $timeout, $ionicScrollDelegate, $state, viewService, dBService, stackEntryService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$timeout = $timeout;
    this.$scope = $scope;
    this._ = _;
    this.viewService = viewService;
    this.$state = $state;
    this.item = Entries.findOne({_id: $stateParams._id});
    this.username = Meteor.user().username;
    this._id = $stateParams._id;
    this.stackEntryService = stackEntryService;
    this.limit = 5;
    this.parentLimit = 5;
    this.i = 0;
    /*
    this.autorun(() => {
      this.getReactively('item');
      this.updatedItem = this.updateChildren(this.item);
    });
    */
    this.showMessage = true;
    this.btnStyle = {};
    this.btnSmallStyle = {};
    this.btnSimilarStyle = {};
    this.showloader = true;

    this.errorCode = 1;

    this.groupBy = '7day';
    this.title = "Prior 7 days";

    // Temporary - Make this changable
    this.ownerDisplay = this.ownerDisplay(this.item.owner);
    this.dBserviceRes = dBService.countOccurance($stateParams._id);
    this.countOccurance = this.dBserviceRes.itemsCount;

    // Subscriptions
    // this.subscribe('image', () => [{sort: {entryTimestamp: -1}, limit: 1},this.getReactively('_id')]);
    this.subscribe('numberOfEntries', () => [$stateParams._id,{}]);
    this.subscribe('nearestNeighbors');

    this.helpers({
      /*
      image() {
        return Images.find({itemId: this._id},{sort: {entryTimestamp: -1}, limit: 1});
      },
      */
      similarItems() {
        //this.getReactively('item');
        return NearestNeighbors.find({_id: $stateParams._id});
      },
      parents() {
        return Entries.find({$and:[{_id:{$in: this.dBserviceRes.parentIds}},{_id:{$ne: this._id}}]} ,{sort: {entryTimestamp: 1}, limit:this.getReactively('parentLimit')});
      },
      entriesCount() {
        return Counts.get('numberOfEntriesCounter');
      },
      lastTenEntries() {
        this.getReactively('item');
        this.getReactively('dBserviceRes');

        let selector = {$and: [{owner: Meteor.userId()},{children: {$elemMatch: {_id: {$in: this.dBserviceRes.parentIds}}}}]};
        $timeout(function () { $ionicScrollDelegate.resize(); }, 100);
        return Items.find(selector, {sort: {entryTimestamp: -1}, limit:this.getReactively('limit')});
      },
      aggCounts() {
        this.getReactively('groupBy');

        t = this;

        d = new Date();
        if (t.groupBy === '7day') {
          d.setDate(d.getDate()-7);
        } else if (t.groupBy === '30day') {
          d.setDate(d.getDate()-30);
        } else if (t.groupBy === 'month') {
          d.setDate(d.getDate()-180);
        }

        let selector = {$and: [{entryTimestamp:{$gt:d}},{owner: Meteor.userId()},{children: {$elemMatch: {_id: {$in: this.dBserviceRes.parentIds}}}}]}
        let it = Items.find(selector,{}).fetch();

        if (it.length === 0) {
          return {'labels': undefined, 'counts': undefined, 'colors': undefined};
        }

        var groupedBy = _.groupBy(it, function(item) {
          if (t.groupBy === '7day') {
            return item.entryTimestamp.getDay();
          } else if (t.groupBy === '30day') {
            return item.entryTimestamp.getDate();
          } else if (t.groupBy === 'month') {
            return item.entryTimestamp.getMonth();
          }
        });

        let results = [];
        _.each(_.values(groupedBy), function(dates) {
          result = {};
          result.entryTimestamp = dates[0].entryTimestamp;
          if (t.groupBy === '7day') {
            result.index = dates[0].entryTimestamp.getDay();
            result.label = t.viewService.numToWeek[result.index];
          } else if (t.groupBy === '30day') {
            result.index = dates[0].entryTimestamp.getDate();
            result.label = result.index;
          } else if (t.groupBy === 'month') {
            result.index = dates[0].entryTimestamp.getMonth();
            result.label = t.viewService.numToMonth[result.index];
          }
          result.count = dates.length;
          results = results.concat(result);
        });


        // Create a set with dummy values to merge into
        // undefined count value fill missing
        let fullSets = [];
        if (t.groupBy === '7day') {
          // Imputation '7day'
          for (i=0; i < 7; i++){
            fullSet = {
             'entryTimestamp': new Date(d),
             'index': d.getDay(),
             'label': t.viewService.numToWeek[d.getDay()],
             'count': undefined,
             'color': '#3498db'
            }
            // itererate day forward
            d.setDate(d.getDate()+1);
            fullSets = fullSets.concat(fullSet);
          }

        } else if (t.groupBy === '30day') {
          // Imputation '30day'
          for (i=0; i < 30; i++){
            fullSet = {
             'entryTimestamp': new Date(d),
             'index': d.getDate(),
             'label': d.getDate(),
             'count': undefined,
             'color': '#3498db'
            }
            // itererate day forward
            d.setDate(d.getDate()+1);
            fullSets = fullSets.concat(fullSet);
          }

        } else if (t.groupBy === 'month') {
          // Imputation 'month'
          for (i=0; i < 7; i++){
            fullSet = {
             'entryTimestamp': new Date(d),
             'index': d.getMonth(),
             'label': t.viewService.numToMonth[d.getMonth()],
             'count': undefined,
             'color': '#3498db'
            }
            // itererate day forward
            d.setMonth(d.getMonth()+1);
            fullSets = fullSets.concat(fullSet);
          }
        }

        // fullSet LEFT JOIN results
        fullSets = this.mergeByProperty(fullSets, results, 'index');
        // sort list by entryTimestamp
        fullSets = _.sortBy(fullSets, function(val) { return val.entryTimestamp; });
        // extract labels
        labels = _.pluck(fullSets, 'label');
        // extract counts
        counts = _.pluck(fullSets, 'count');
        colors = _.pluck(fullSets, 'color');

        return {'labels': labels, 'counts': counts, 'colors': colors};
      }
    });


    this.autorun(() => {
      this.getReactively('similarItems');

      /*
      if (this.similarItems[0]) {
        for (i in this.similarItems[0].nearestNeighbors) {
          this.similarItems[0].nearestNeighbors[i] = Entries.findOne({_id: this.similarItems[0].nearestNeighbors[i]._id});
        }
        this.updatedSimilarItems = this.itemScore(this.similarItems[0].nearestNeighbors);
      }
      */
      if (this.similarItems && this.similarItems[0]) {
        for (i in this.similarItems[0].nearestNeighbors) {
          this.similarItems[0].nearestNeighbors[i] = Entries.findOne({_id: this.similarItems[0].nearestNeighbors[i]._id});
        }
        this.updatedSimilarItems = this.similarItems[0].nearestNeighbors;
      }


    });


    this.autorun(() => {
      this.getReactively('aggCounts');
      this.buildGraph();
    });

    this.subscribe('choices')

    this.helpers({
      choice() {
        return Choices.findOne({itemId: $stateParams._id});
      }
    });

    //this.choice = Choices.findOne({itemId: $stateParams._id});
    this.autorun(() => {
      this.getReactively('choice');

      if (this.choice && this.choice.selectedSafe === true) {
        $('#profile-button-safe').removeClass('profile-button-s');
        $('#profile-button-safe').addClass('profile-button-s-clicked');
      } else {
        $('#profile-button-safe').removeClass('profile-button-s-clicked');
        $('#profile-button-safe').addClass('profile-button-s');
      }

      if (this.choice && this.choice.selectedCaution === true) {
        $('#profile-button-caution').removeClass('profile-button-c');
        $('#profile-button-caution').addClass('profile-button-c-clicked');
      } else {
        $('#profile-button-caution').removeClass('profile-button-c-clicked');
        $('#profile-button-caution').addClass('profile-button-c');
      }
    });

    // Timeout for riskEngineScore
    /*
    th = this;
    Meteor.setTimeout(function(){
      if (th.showloader === true){
        th.showloader = false;
        th.$scope.$apply();
      }
    }, 3000);
    */

    /*
    Meteor.call('riskEngineScore', this._id, Meteor.userId(),
      (error, res) => {
        this.showloader = false;

        if (error) {
          console.log(error);
          this.$scope.$apply();
        } else {

          if (res.data.errorCode) {
            this.errorCode = res.data.errorCode;
            this.$scope.$apply();
          } else {
            this.combined = res.data.entryResults;
            this.symptoms = res.data.symptomResults;

            th = this;
            this.$timeout(function(){
              if (th.symptoms) {
                th.setCircleColor(th.btnStyle,0,th.combined.score);
                for (i in th.symptoms) {
                  score = th.symptoms[i].score;
                  if (!score) {
                    score = 5;
                  }
                  th.setCircleColor(th.btnStyle,parseInt(i)+1,parseInt(th.symptoms[i].score));
                }
              }
            });
          }
        }
      }
    );
    */

    //this.buildGraph();
  }

  viewMoreEntries() {
    this.limit += 5;
  }

  viewMoreParents() {
    this.parentLimit += 5;
  }

  mergeByProperty(arr1, arr2, prop) {

      a1 = arr1;
      a2 = arr2;
      _.each(a2, function(arr2obj) {
          var arr1obj = _.find(a1, function(arr1obj) {
              return arr1obj[prop] === arr2obj[prop];
          });

          //If the object already exist extend it with the new values from arr2, otherwise just add the new object to arr1
          arr1obj ? _.extend(arr1obj, arr2obj) : a1.push(arr2obj);
      });

      return a1;
  }

  buildGraph() {
    // 3 graph options: Last 6 month, Last 1 month, Last 1 week

    this.labels = this.aggCounts.labels;
    this.data = this.aggCounts.counts;
    this.colors = this.aggCounts.colors;
    this.series = [this.item.name];

    this.datasetOverride = [{ yAxisID: 'y-axis-1'}];
    this.options = {
      scales: {
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { min: 0}
          }
        ],
        xAxes: [
          {
            id: 'x-axis-1',
            ticks: {
              autoSkip: true,
              autoSkipPadding: 5,
              minRotation: 45,
              fontSize: 10
              }
          }
        ],
      }
    };
  }

  onClick() {
    this.i += 1;
    if (this.i === 3) {
      this.i = 0
    };
    if (this.i === 0) {
      this.groupBy = '7day';
      this.title = "Prior 7 days";
    } else if (this.i === 1) {
      this.groupBy = '30day';
      this.title = "Prior 30 days";
    } else if (this.i === 2) {
      this.groupBy = 'month';
      this.title = "Prior 6 months";
    }

    this.buildGraph();
  };

  setCircleColor(obj, index, score) {
    if (!score || score < 1 || score > 10) {
      obj['_' + index] = {"background-color":this.viewService.gradientColors[5]};
    } else {
      obj['_' + index] = {"background-color":this.viewService.gradientColors[score]};
    }
  }

  updateChildren(updateItem){

    if (updateItem.children.length > 0) {
      childIds = updateItem.children.map( function(p){ return p._id });
      updateItem.children = Entries.find({_id:{$in:childIds}}, {fields: {'_id':1,'name':1,'brand':1}}).fetch();
    }

    iter = 0;
    th = this;
    this.$timeout(function(){
      for (i in updateItem.children) {
        th.riskEngineScore(updateItem.children[i]._id, Meteor.userId(),function(error, res) {
          if (res) {
            updateItem.children[iter].score = res.entryResults.score;
            th.setCircleColor(th.btnSmallStyle, iter, res.entryResults.score);
            iter += 1;
          }
        })
      }
    })
    return updateItem;
  }

  itemScore(updateItem){

    th = this;
    this.$timeout(function(){
      itt = 0;

      for (i in updateItem) {
        th.riskEngineScore(updateItem[i]._id, Meteor.userId(),function(error, res) {
          if (res) {
            updateItem[itt].score = res.entryResults.score;
            th.setCircleColor(th.btnSimilarStyle, itt, res.entryResults.score);
            itt += 1;
          }
        })
      }
    })

    return updateItem;
  }

  buttonHandler(type, selected) {

    if (!this.choice) {
      this.choice = {
        'itemId': this._id,
        'owner': Meteor.userId()
      };
      if (type === "safe") {
        this.choice.selectedSafe = selected;
        this.choice.selectedCaution = false;
      } else {
        this.choice.selectedSafe = false;
        this.choice.selectedCaution = selected;
      }
      Choices.insert(this.choice);
      this.choice = Choices.findOne({itemId: this._id});
    } else if (type === "safe") {
      Choices.update({
        _id: this.choice._id
      }, {
        $set: {
          selectedSafe: selected
        }
      });
      this.choice = Choices.findOne({itemId: this._id});
    } else {
      Choices.update({
        _id: this.choice._id
      }, {
        $set: {
          selectedCaution: selected
        }
      });
      this.choice = Choices.findOne({itemId: this._id});
    }
  }

  editHandler() {

    // prep stack case of edit
    item = {};
    item.route = 'entryProfile';
    item._id = this._id;
    item.children = [];
    item.selected = [];

    this.stackEntryService.empty();
    this.stackEntryService.add(item, {_id: this._id});

    this.viewHandler('entryDetails', {_id: this._id});

  }

  viewHandler(route, params) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  ownerDisplay(ownerId) {
    if (ownerId === Meteor.userId()) {
      return Meteor.user().username;
    } else {
      return 'Private User';
    }
  }

  riskEngineScore(itemId, userId, cb) {

    Meteor.call('riskEngineScore', itemId, userId,
      (error, res) => {
        if (error) {
          cb(error, undefined);
        } else {
          cb(undefined, {'entryResults':res.data.entryResults, 'symptoms':res.data.symptomResults});
        }
      }
    );

  }

}

const name = 'entryProfile';

// create a module
export default angular.module(name, [
  angularMeteor,
  chartjs,
  DisplayDaysSinceFilter,
  DBService,
  'angularSpinner'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: EntryProfile
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('entryProfile', {
      url: '/entryProfile',
      params: {
        _id: "f2af88f640ee54093be064c0"
      },
      template: '<ion-view hide-back-button="false" cache-view="false" hide-nav-bar="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Search' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Item Profile</span>' +
                '</ion-nav-title>' +
                '  <entry-profile></entry-profile>' +
                '</ion-view>',
      controller: function($scope, $stateParams, $state, viewService) {
        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          $state.transitionTo('search', $stateParams);

          //$state.go('search', $stateParams);
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
