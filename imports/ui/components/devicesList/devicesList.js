import _ from 'underscore';
import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './devicesList.html';

import { Devices } from '../../../api/devices';

import { name as DeviceAdd } from '../deviceAdd/deviceAdd';
import { name as DeviceDetails } from '../deviceDetails/deviceDetails';
import { name as BluetoothList } from '../bluetoothList/bluetoothList';


class DevicesList {
  constructor($scope, $reactive, $state, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    //this.subscribe('devices');

    this.helpers({
      devices() {
        return Devices.find({});
      }
    });

    //this.devices = Devices.find({}).fetch();

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

  update() {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go('more');
  }

}


const name = 'devicesList';

// create a module
export default angular.module(name, [
  angularMeteor,
  DeviceAdd,
  DeviceDetails,
  BluetoothList
])
  .component(name, {
    template,
    controllerAs: name,
    controller: DevicesList
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('devicesList', {
      url: '/devicesList',
      template: '<ion-view title="Devices" hide-back-button="false" cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Devices</span>' +
                '</ion-nav-title>' +
                '<devices-list></devices-list>' +
                '</ion-view>',
      controller: function($scope, $state, viewService) {
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
