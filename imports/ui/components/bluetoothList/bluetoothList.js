import _ from 'underscore';
import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './bluetoothList.html';

class BluetoothList {
  constructor($scope, $reactive, $state, viewService, bluetoothService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;
    this.bluetoothService = bluetoothService;

    foundDevices = new ReactiveVar('')
    viewService.foundDevices = foundDevices

    $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {

         if (toState.url === "/bluetoothList") {
           foundDevices.set('')
         }

    });



    if (Meteor.isCordova) {

      foundDevicesResults = []

      bluetoothService.refreshDeviceList(
        function(results) {
          foundDevicesResults.push(JSON.parse(results))
          foundDevices.set(foundDevicesResults);
        }
      )

    }

    this.helpers({
      devices: function() {
        return foundDevices.get();
      }
    });

    this.status = Meteor.status();
    this.autorun(() => {
      this.getReactively('status');
      $scope.connected = Meteor.status().connected;
    });

  }


  refresh() {

    foundDevices.set('')

    foundDevicesResults = []

    this.bluetoothService.refreshDeviceList(
      function(results) {
        foundDevicesResults.push(JSON.parse(results))
        foundDevices.set(foundDevicesResults);
      }
    )

  }


  viewHandler(route, params) {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    if (!params) {
      params = {}
    }

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

}


const name = 'bluetoothList';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
    template,
    controllerAs: name,
    controller: BluetoothList
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('bluetoothList', {
      url: '/bluetoothList',
      template: '<ion-view title="Devices" hide-back-button="false" cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Bluetooth List</span>' +
                '</ion-nav-title>' +
                '<bluetooth-list></bluetooth-list>' +
                '</ion-view>',
      controller: function($scope, $state, viewService, bluetoothService) {
        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('more');

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
