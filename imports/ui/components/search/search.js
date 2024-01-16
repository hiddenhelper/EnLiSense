import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { BarcodeScanner } from 'ionic-native';

import template from './search.html';
import { name as AvatarImage } from '../avatarImage/avatarImage';
import { Entries } from '../../../api/entries';

class Search {
  constructor($scope, $reactive, $state, $rootScope, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.viewService = viewService;

    this.perPage = 20;
    this.page = 1;
    this.sort = { name: 1 };
    $scope.searchTerm = '';
    this.$state = $state;
    this.btnSmallStyle = {};
    this.$scope = $scope;

    $scope.$on('search-term-broadcast', function(val, searchTerm){
      $scope.searchTerm = searchTerm;
    });

    this.subscribe('entries', () => [{
        limit: parseInt(this.perPage),
        skip: parseInt((this.getReactively('page') - 1) * this.perPage),
        sort: this.getReactively('sort')
      }, $scope.getReactively('searchTerm')
    ]);

    this.helpers({
      entries() {
        $scope.getReactively('searchTerm');

        let selector = {};

        if (typeof $scope.searchTerm === 'string' && $scope.searchTerm.length) {
          selector = { $or: [
            {name: {
                $regex: `.*${$scope.searchTerm}.*`,
                $options : 'i'
              }
            },
            {barcode: {
                $regex: `.*${$scope.searchTerm}.*`,
                $options : 'i'
              }
            }
          ]}
        } else {
          selector.name = {
            $regex: `.*$AAAA~12345!~BBBB.*`,
            $options : 'i'
          };
        }


        return Entries.find(selector, {
          limit: parseInt(this.perPage),
          skip: parseInt((this.getReactively('page') - 1) * this.perPage),
          sort: this.getReactively('sort')
        }).fetch()
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

    /*
    this.entriesWithScores = [];

    this.autorun(() => {
      this.getReactively('entries');
      this.entriesWithScores = this.appendScores(this.entries);
    });
    */

    this.status = Meteor.status();
    this.autorun(() => {
      this.getReactively('status');
      this.connected = Meteor.status().connected;
    });

  }

  viewHandler(route, params) {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);

  }

  pageChanged(newPage) {
    this.page = newPage;
  }

  sortChanged(sort) {
    this.sort = sort;
  }

  appendScores(updateItem){

    iter = 0;
    th = this;

    var count = updateItem.length;

    for (j in updateItem) {
      this.riskEngineScore(updateItem[j]._id, Meteor.userId(),function(error, res) {
        if (res) {
          score = JSON.parse(JSON.stringify(res.entryResults.score));
          updateItem[iter].score = score;
          th.setCircleColor(th.btnSmallStyle, iter, score);
          iter++;
        }
      })
    }

    return updateItem;

  }

  setCircleColor(obj, index, score) {
    if (!score || score < 1 || score > 10) {
      obj['_' + index] = {"background-color":this.viewService.gradientColors[5]};
    } else {
      obj['_' + index] = {"background-color":this.viewService.gradientColors[score]};
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

const name = 'search';

// create a module
export default angular.module(name, [
  angularMeteor,
  'ngAnimate',
  AvatarImage
])
  .component(name, {
  template,
  controllerAs: name,
  controller: Search
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('search', {
      url: '/search',
      params: {
        _id: undefined,
        searchTerm: ''
      },
      template: '<ion-view hide-back-button="true" cache-view="false" can-swipe-back="false" hide-nav-bar="false" title="">' +
                '<ion-nav-buttons side="left">' +
                '    <span style="z-index:30;">' +
                '  <button class="button-clear header-back-button" ng-click="viewHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '    </span>' +
                '</ion-nav-buttons>' +
                '  <ion-nav-buttons class="title title-center header-item" side="primary">' +
                '    <span class="bar bar-header nav-bar-title" style="z-index:20;">' +
                '      <div class="item-input-inset" style="width:100%; margin-left: 70px; margin-right: 35px;" ng-if="cordova">' +
                '       <div class="item-input-wrapper textbox-search">     ' +
                '          <input type="search" placeholder="Search" ng-model="$parent.$parent.searchTerm" class="ng-pristine ng-untouched ng-valid ng-empty" aria-invalid="false" style="width: 100%;">' +
                '          <div ng-if="$parent.$parent.searchTerm !== \'\'" class="j-search-box-icon-cont" style="padding-right: 5px; padding-left: 5px;" layout="row" layout-align="center center" ng-click="clearSearch()">' +
                '            <i class="ion-ios-close" style="font-size: 18px; color: #9f9f9f;"></i>' +
                '          </div>' +
                '        </div> ' +
                '      </div>' +
                '      <div class="item-input-inset" style="width:100%; margin-left: 70px; margin-right: 0px; position: relative;" ng-if="!cordova">' +
                '        <div class="item-input-wrapper textbox-search">' +
                '          <input type="search" placeholder="Search" ng-model="$parent.$parent.searchTerm" class="ng-pristine ng-untouched ng-valid ng-empty" aria-invalid="false" style="width: 100%;">' +
                '          <div ng-if="$parent.$parent.searchTerm !== \'\'" class="j-search-box-icon-cont" style="padding-right: 5px; padding-left: 5px;" layout="row" layout-align="center center" ng-click="clearSearch()">' +
                '            <i class="ion-ios-close" style="font-size: 18px; color: #9f9f9f;"></i>' +
                '          </div>' +
                '        </div>' +
                '      </div>' +
                '    </span>' +
                '  </ion-nav-buttons>' +
                '  <ion-nav-buttons side="right" >' +
                '    <span class="button button-small" ng-click="scanBarcode()" ng-if="cordova" style="z-index: 21;">' +
                '      <i class="ion-ios-barcode-outline barcode-icon" style="font-size: 32px; "></i>' +
                '    </span>' +
                '  </ion-nav-buttons>' +
                '  <search></search>' +
                '</ion-view>',
      controller: function($scope, $rootScope, $reactive, $stateParams, $state, viewService) {

        $scope.searchTerm = $stateParams.searchTerm;
        $scope.cordova = Meteor.isCordova;

        $scope.$watch('searchTerm', function(newValue, oldValue) {
          $scope.$broadcast('search-term-broadcast',newValue);
        });

        $scope.clearSearch = () => {
          $scope.searchTerm = '';
          $scope.$broadcast('search-term-broadcast','');
        }

        $scope.viewHandler = () => {

          console.log('viewHandler')

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('journal');

        }

        $scope.scanBarcode = () => {

          if (Meteor.isCordova) {
            BarcodeScanner.scan().then((barcodeData) => {
              // Success! Barcode data is here
              // console.debug(barcodeData.text);

              // set searchTerm
              $scope.$broadcast('search-term-broadcast',barcodeData.text);

              viewService.searchTerm = barcodeData.text;

            }, (err) => {
              // An error occurred
              console.debug(err);
            });
          }
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
