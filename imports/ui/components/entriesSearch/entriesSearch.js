import _ from 'underscore';
import angular from 'angular';
import angularMeteor from 'angular-meteor';
import utilsPagination from 'angular-utils-pagination';
//import { Meteor } from 'meteor/meteor';
//import { Counts } from 'meteor/tmeasday:publish-counts';

import { BarcodeScanner } from 'ionic-native';
import { Keyboard } from 'ionic-native';
import template from './entriesSearch.html';

import { Entries } from '../../../api/entries';
import { name as StackEntryService } from '../../services/stackEntryService';
import { name as NoSearchItemsMessage } from '../noSearchItemsMessage/noSearchItemsMessage';


class EntriesSearch {
  constructor($scope, $reactive, $stateParams, $state, stackEntryService, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$state = $state;
    this.viewService = viewService;
    this.type = $stateParams.type;
    this._ = _;
    this.perPage = 12;
    this.page = 1;
    this.sort = { name: 1 };
    this.searchTerm = $stateParams.searchTerm;
    this.stackEntryService = stackEntryService;

    // If returning back from add item or details then do not need to add new
    if ($stateParams.back === false) {

      // create search object
      this.searchItem = {
        'route':'entriesSearch',
        'searchTerm': this.getReactively('searchTerm'),
        'barcode': undefined,
        'selected':[]
      }

      tmpParams = $stateParams;
      tmpParams.searchTerm = this.searchItem.searchTerm;
      stackEntryService.add(this.searchItem, tmpParams);

      // Hard copy incase user cancels -> we can rollback
      if (stackEntryService.stack[stackEntryService.stack.length-2] && stackEntryService.stack[stackEntryService.stack.length-2].data.selected) {
        this.searchItem.selected = JSON.parse(JSON.stringify(stackEntryService.stack[stackEntryService.stack.length-2].data.selected));
      } else {
        console.debug("Error creating hard copy of data.selected");
      }

    // else use existing searchItem from stack
    } else {

      this.searchItem = this.stackEntryService.stack[this.stackEntryService.stack.length-1].data;

    }

    this.autorun(() => {
      // Add search object to stack
      this.searchItem.searchTerm = this.getReactively('searchTerm');

      tmpParams = $stateParams;
      tmpParams.searchTerm = this.searchItem.searchTerm;

      stackEntryService.remove();
      stackEntryService.add(this.searchItem, tmpParams);
    });

    /*
    this.subscribe('entries', () => [{
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.perPage),
        sort: this.getReactively('sort')
      }, this.getReactively('searchTerm')
    ]);
    */

    this.helpers({
      entries() {

        this.getReactively('searchTerm')

        let selector = {};

        if (typeof this.searchTerm === 'string' && this.searchTerm.length) {
          selector = {$and: [{ $or: [
              {name: {
                  $regex: `.*${this.searchTerm}.*`,
                  $options : 'i'
                }
              },
              {barcode: {
                  $regex: `.*${this.searchTerm}.*`,
                  $options : 'i'
                }
              },
              {genericName: {
                  $regex: `.*${this.searchTerm}.*`,
                  $options : 'i'
                }
              }
            ]}
          ,{type: $stateParams.type}]}
        } else {
          selector = {$and: [{name: {
              $regex: `.*$AAAA~12345!~BBBB.*`,
              $options : 'i'
            }
          },{
            type: $stateParams.type
          }]};
        }

        return Entries.find(selector, {
          limit: parseInt(this.perPage),
          skip: parseInt((this.getReactively('page') - 1) * this.perPage),
          sort: this.getReactively('sort')
        })
      }
      /*,
      entriesCount() {
        return Counts.get('numberOfEntries');
      }*/
    });

    this.autorun(() => {
      this.getReactively('entries');
      if (this.entries) {
        this.entriesCount = this.entries.length;
      }
    });

  }

  pageChanged(newPage) {
    this.page = newPage;
  }

  sortChanged(sort) {
    this.sort = sort;
  }

  scanBarcode() {
    if (Meteor.isCordova) {
      BarcodeScanner.scan().then((barcodeData) => {

        // set searchTerm
        this.searchTerm = barcodeData.text;
        this.searchItem.barcode = barcodeData.text;

      }, (err) => {
        // An error occurred
        console.debug(err);
      });
    }
  }

  clearSearch() {
    this.searchTerm = '';
  }

  checkboxHandler(direction, id) {

    if (!this.searchItem.selected) {
      return;
    }

    if (direction === true || direction === 'y') {
      this.searchItem.selected.push({'_id': id});
    } else {
      this.searchItem.selected = _.without(this.searchItem.selected, _.findWhere(this.searchItem.selected, {'_id': id}));
    }

  }

  viewHandler(route, params) {

    if(!params) {
      params = {}
    }

    // Save current selected
    if (this.searchItem) {
      this.stackEntryService.stack[this.stackEntryService.stack.length-1].data.selected = this.searchItem.selected;
    }

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  done() {

    // console.log(this.stackEntryService.stack)

    // Now user has committed we update the main object
    this.stackEntryService.stack[this.stackEntryService.stack.length-2].data.selected = this.searchItem.selected;

    // Remove current search item from stack
    this.stackEntryService.remove();

    // Reset selected
    delete this.searchItem;

    if (this.stackEntryService.stack.length === 0) {

      this.viewHandler('journal', {});

    } else {

      // Redirect to next state (previous object in stack)
      route = this.stackEntryService.stack[this.stackEntryService.stack.length-1].data.route;
      params = {}
      if (route === 'entryAdd'){
        params = {new: false};
      } else if (route === 'entriesItem' || route === 'entryDetails') {
        params = {_id: this.stackEntryService.stack[this.stackEntryService.stack.length-1].data._id}
      }
      params.type = this.type;

      this.viewHandler(route, params);

    }
  }
}

const name = 'entriesSearch';

// create a module
export default angular.module(name, [
  angularMeteor,
  utilsPagination,
  StackEntryService,
  NoSearchItemsMessage
])
  .component(name, {
    template,
    controllerAs: name,
    controller: EntriesSearch
  })
  .config(config)
  .run(run);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('entriesSearch', {
      url: '/entriesSearch',
      params: {
        back: false,
        searchTerm: '',
        type: undefined
      },
      template: '<ion-view hide-back-button="false" cache-view="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-buttons side="right">' +
                '  <button class="button today-button" ng-click="viewHandler(\'entryAdd\',{ \'new\':true, \'type\': \'{{ type }}\' })">' +
                '    <p>New</p>' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 90%;">Search {{ type }}</span>' +
                '</ion-nav-title>' +
                '  <entries-search></entries-search>' +
                '</ion-view>',
      controller: function($scope, $state, $stateParams, viewService, stackEntryService) {

        $scope.type = $stateParams.type;

        $scope.viewHandler = function(route, params) {

          if(!params) {
            params = {}
          }

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'forward';

          // Grab the last view info & transition back
          $state.go(route, params);
        }


        $scope.goBackHandler = function() {

          // remove current
          stackEntryService.remove();

          // get previous info
          route = stackEntryService.stack[stackEntryService.stack.length-1].data.route;
          params = stackEntryService.stack[stackEntryService.stack.length-1].params;
          params.type = $stateParams.type;
          if (route === 'entryAdd'){
            params.new = false;
          }

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo(route, params);

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

function run($ionicPlatform) {
  'ngInject';

  Meteor.startup(() => {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(Keyboard) {
      Keyboard.disableScroll(true);
      Keyboard.hideKeyboardAccessoryBar(false);
    }
    if(window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
}
