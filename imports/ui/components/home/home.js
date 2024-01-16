import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { Dialogs } from 'ionic-native';

import { name as CurrentDateDisplay } from '../currentDateDisplay/currentDateDisplay';

import 'ionic-sdk/release/js/ionic';
import 'ionic-sdk/release/js/ionic-angular';
import 'ionic-sdk/release/css/ionic.css';

import '@angular/compiler';
import '@ionic/angular';


import template from './home.html';


class Home {
  constructor($rootScope, $scope, $reactive, $stateParams, $state, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.currentDate = new Date();

    this.$state = $state;
    this.viewService = viewService;


    Meteor.subscribe('username');
    this.helpers({
      username() {
        if (Meteor.user() !== undefined) {
          return this.capitalizeFirstLetter(Meteor.user().username)
        } else {
          return ''
        }
      }
    })


    $(".owl-carousel").owlCarousel({
      center: true,
      margin:10,
      loop:true,
      autoWidth:true,
      items:4,
      autoplay:true,
      autoplayTimeout:6000,
      autoplayHoverPause:true
    });
  }

  viewHandler(route) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route);
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

const name = 'home';

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
    controller: Home
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('home', {
      url: '/home',
      template: '<ion-view can-swipe-back="false">' +
                ' <ion-nav-buttons side="left" ng-click="home.viewHandler(\'home\')">' +
                '   <avatar-image></avatar-image>' +
                ' </ion-nav-buttons>' +
                '<ion-nav-buttons side="right">' +
                '   <div class="header-conn-icon" layout="row" layout-align="start center" style="color: white;" ng-if="connected">' +
                '     <i class="icon ion-connection-bars" style="font-size: 20px; margin-right: 10px;"></i>' +
                '   </div>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">IBD AWARE</span>' +
                '</ion-nav-title>' +
                '<home></home>' +
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
