import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { EmailComposer } from 'ionic-native';
import { Meteor } from 'meteor/meteor';

import { Accounts } from 'meteor/accounts-base';

import template from './more.html';
import { File } from 'ionic-native';

import { name as ProfileEdit } from '../profileEdit/profileEdit';
import { name as SocialHistory } from '../socialHistory/socialHistory';
import { name as NotificationEdit } from '../notificationEdit/notificationEdit';
import { name as PrivacyNotice } from '../privacyNotice/privacyNotice';
import { name as ConditionsList } from '../conditionsList/conditionsList';
import { name as DeviceDetails } from '../deviceDetails/deviceDetails';
import { name as AvatarImage } from '../avatarImage/avatarImage';
import { name as Clinician } from '../clinician/clinician';
import { name as UserFeedback } from '../userFeedback/userFeedback';
import { name as TemperatureEdit } from '../temperatureEdit/temperatureEdit';

class More {
  constructor($scope, $reactive, $state, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    this.version = '0.2.8';

  }

  sendSupportEmail() {
    if (Meteor.isCordova) {

      Meteor.startup(() => {

        this.email = {
          to: 'pr@enlisense.com',
          subject: 'EnLiSense Support (' + Meteor.user().username + ')',
          body: 'Please enter your message below',
          isHtml: true
        };

        EmailComposer.open(this.email);

      })
    }
  }

  createReport() {

  }

  sendReportEmail() {
    if (Meteor.isCordova) {

      Meteor.startup(() => {

        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];

        var date = new Date();
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        this.email = {
          subject: Meteor.user().username + '\'s Jānaru (' + monthNames[monthIndex] + ' ' + day + ', ' + year + ')',
          body: 'Please enter your message below',
          isHtml: true
        };

        EmailComposer.open(this.email);

      })
    }
  }

  viewHandler(route) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route);
  }

  logout() {
    Accounts.logout();

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    this.$state.go('login');
  }

}

const name = 'more';

// create a module
export default angular.module(name, [
  angularMeteor,
  ProfileEdit,
  SocialHistory,
  NotificationEdit,
  PrivacyNotice,
  DeviceDetails,
  ConditionsList,
  AvatarImage,
  Clinician,
  UserFeedback,
  TemperatureEdit
])
  .component(name, {
    template,
    controllerAs: name,
    controller: More
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('more', {
      url: '/more',
      template: '<ion-view hide-back-button="true" can-swipe-back="false">' +
                ' <ion-nav-buttons side="left" ng-click="more.viewHandler(\'home\')">' +
                '   <avatar-image></avatar-image>' +
                ' </ion-nav-buttons>' +
                ' <ion-nav-buttons side="right">' +
                '   <div class="header-conn-icon" layout="row" layout-align="start center" style="color: white;" ng-if="moreState.connected">' +
                '      <i class="icon ion-connection-bars" style="font-size: 20px; margin-right: 10px;"></i>' +
                '   </div>' +
                ' </ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">My Settings</span>' +
                '</ion-nav-title>' +
                '<more></more>' +
                '</ion-view>',
      controller: function($rootScope, $scope, $reactive, viewService) {

        'ngInject';

        $reactive(this).attach($scope);

        this.status = Meteor.status();
        this.autorun(() => {
          this.getReactively('status');
          this.connected = Meteor.status().connected;
        });


      },
      controllerAs: 'moreState',
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
