import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { Dialogs } from 'ionic-native';

import { name as CurrentDateDisplay } from '../currentDateDisplay/currentDateDisplay';

import { Support } from '../../../api/support';
import { SupportLikes } from '../../../api/supportLikes';

import 'ionic-sdk/release/js/ionic';
import 'ionic-sdk/release/js/ionic-angular';
import 'ionic-sdk/release/css/ionic.css';

import '@angular/compiler';
import '@ionic/angular';

import template from './mySupport.html';


class MySupport {
  constructor($rootScope, $window, $scope, $reactive, $stateParams, $state, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.currentDate = new Date();

    this.$state = $state;
    this.viewService = viewService;
    this.likeClass = false
    $scope.likeList = {}
    $scope.objectID = undefined

    this.subscribe('support');
    this.helpers({
      support() {
        return Support.find({},{ sort: { articleID: -1 }})
      }
    })

    this.subscribe('supportLikes');
    this.helpers({
      supportLikes() {
        return SupportLikes.findOne({"owner": Meteor.userId()})
      }
    })


    this.autorun(() => {

      this.getReactively('supportLikes');

      if (this.supportLikes && this.supportLikes._id) {
        $scope.objectID = this.supportLikes._id
        $scope.likeList = this.supportLikes.likeArray
      }

    });

    $scope.open = function(url) {
      console.log(url)
      cordova.InAppBrowser.open(url, '_blank', 'toolbarposition=top');
      return false;
    }


    $scope.likeHandler = function(supportArticleId) {

      if ($scope.likeList[supportArticleId] == true) {

        $scope.likeList[supportArticleId] = false
        result = $scope.likeList[supportArticleId]

      } else if ($scope.likeList[supportArticleId] == false) {

        $scope.likeList[supportArticleId] = true
        result = $scope.likeList[supportArticleId]

      } else {

        $scope.likeList[supportArticleId] = true
        result = true

      }

      if ($scope.objectID !== undefined) {
        SupportLikes.update({_id: $scope.objectID}, {$set: {"likeArray": $scope.likeList}})
      } else {
        $scope.objectID = SupportLikes.insert({"likeArray": $scope.likeList, "owner": Meteor.userId()})
      }

      return result
    }


  }

  viewHandler(route) {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route);
  }

}

const name = 'mySupport';

// create a module
export default angular.module(name, [
  angularMeteor,
  CurrentDateDisplay,
  'accounts.ui',
  'ionic',
  'ngCordova'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: MySupport
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('mySupport', {
      url: '/mySupport',
      template: '<ion-view can-swipe-back="false">' +
                ' <ion-nav-buttons side="left" ng-click="mySupport.viewHandler(\'home\')">' +
                '   <avatar-image></avatar-image>' +
                ' </ion-nav-buttons>' +
                '<ion-nav-buttons side="right">' +
                '   <div class="header-conn-icon" layout="row" layout-align="start center" style="color: white;" ng-if="connected">' +
                '     <i class="icon ion-connection-bars" style="font-size: 20px; margin-right: 10px;"></i>' +
                '   </div>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">My Support</span>' +
                '</ion-nav-title>' +
                '<my-support></my-support>' +
                '</ion-view>',
      controller: function($reactive, $scope, $state) {

        $reactive(this).attach($scope);

        this.status = Meteor.status();
        this.autorun(() => {
          this.getReactively('status');
          $scope.connected = Meteor.status().connected;
        });

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
