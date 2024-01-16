import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './insightsList.html';

import { SocialSharing } from 'ionic-native';
import { ActionSheet } from 'ionic-native';
import { name as AvatarImage } from '../avatarImage/avatarImage';

import { Insights } from '../../../api/insights';

class InsightsList {
  constructor($scope, $reactive, $rootScope, $ionicSlideBoxDelegate, $mdDialog, $mdMedia) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.slideIndex = 0;
    this.$mdDialog = $mdDialog;
    this.$mdMedia = $mdMedia;

    this.selected = '';
    this.limit = 10;

    $scope.type = undefined;

    this.subscribe('insights', () => [{
        limit: parseInt(this.getReactively('limit')),
        sort: { insightTimestamp: 1 }
      }, $scope.getReactively('type')
    ]);

    this.helpers({
      insights() {
        return Insights.find({}, {
          sort : { insightTimestamp: 1 }
        })
      },
      insightsCount() {
        return Counts.get('numberOfInsights');
      }
    });

		$scope.onSlideMove = function(data){
      if (data.index === 0) {
        $scope.type = undefined;
      } else if (data.index === 1) {
        $scope.type = 'Symptoms';
      } else if (data.index === 2) {
        $scope.type = 'Food';
      } else if (data.index === 3) {
        $scope.type = 'Drink';
      } else if (data.index === 4) {
        $scope.type = 'Medication';
      } else {
        $scope.type = 'Exercise';
      }
    };

    this.status = Meteor.status();
    this.autorun(() => {
      this.getReactively('status');
      this.connected = Meteor.status().connected;
    });
  }

  popup(_id, insightTitle, insightMessage) {

    updateInsight = this.updateInsight;

    if (Meteor.isCordova) {
      Meteor.startup(function() {

        let buttonLabels = [
          "Share Insight via...",
          "Remove Insight"
        ];
        let subject = "Janaru Insight: " + insightTitle;
        let message = insightMessage + " \n\nShared from Janaru App (http://janaru.io)";

        ActionSheet.show({
          'buttonLabels': buttonLabels,
          'addCancelButtonWithLabel': 'Cancel'
        }).then((buttonIndex: number) => {
          if (buttonIndex === 1) {

            ActionSheet.hide({}, function(success) {
              SocialSharing.share(message, subject);
            }, function(error){
              console.debug(error);
            });

          } else if (buttonIndex === 2 ) {

            updateInsight(_id);

          }
        });

      });
    }

  }

  updateInsight(_id) {
    Insights.update({
      _id: _id
    }, {
      $set: {
        hidden: true
      }
    });
  }


  loadMore() {

    if (this.limit < 100) {
      this.limit += 5;
    }
    this.$scope.$broadcast('scroll.infiniteScrollComplete');

  }

  reset() {

    this.subscribe('insights', () => [{
        limit: parseInt(this.getReactively('limit')),
        sort: this.getReactively('sort')
      }, this.$scope.getReactively('type')
    ]);

    this.$scope.$broadcast('scroll.refreshComplete');

  }

  slideChanged(index) {
    this.slideIndex = index;
  };

}

const name = 'insightsList';

// create a module
export default angular.module(name, [
  angularMeteor,
  'ngAnimate',
  'tabSlideBox',
  AvatarImage
])
  .component(name, {
  template,
  controllerAs: name,
  controller: InsightsList
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('insightsList', {
      url: '/insightsList',
      template: '<ion-view hide-back-button="true" can-swipe-back="false" cache-view="true">' +
                ' <ion-nav-buttons side="left">' +
                '   <avatar-image></avatar-image>' +
                ' </ion-nav-buttons>' +
                '<ion-nav-buttons side="right">' +
                '  <button class="button-clear header-back-button" ng-click="removeSample()" ng-if="count > 0">' +
                '    <i class="ion-ios-trash-outline" style="font-size: 16px; padding-right: 5px;"></i>Sample' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Insights</span>' +
                '</ion-nav-title>' +
                '<insights-list></insights-list>' +
                '</ion-view>',
      controller: function($scope, $stateParams, $rootScope, $timeout) {

        $scope.count = 0;
        var s = $scope;

        run = function() {
          Meteor.call('sampleInsightsCount',function(err, val){
            if (err) {
              console.debug(err);
            }
            $timeout(function(){
              s.count = val;
              //s.$apply();
            })
          });
        }
        run();

        $rootScope.$on("sample-insights-created", function(val){
          run();
        });

        $scope.removeSample = function() {
          Meteor.call('removeSampleInsights');
          $scope.count = 0;
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
