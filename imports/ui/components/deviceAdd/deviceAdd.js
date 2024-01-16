import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { BarcodeScanner } from 'ionic-native';
//import { BluetoothController } from 'ionic-native';
import { Dialogs } from 'ionic-native';

import template from './deviceAdd.html';

import { Profiles } from '../../../api/profiles';
import { Devices } from '../../../api/devices';
import { name as DisplayDateFilter } from '../../filters/displayDateFilter';

class DeviceAdd {
  constructor($rootScope, $scope, $reactive, $stateParams, $state, viewService, bluetoothService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    $scope.cordova = Meteor.isCordova;

    $state.device = this.resetJSON();

    this.error = undefined;

    $state.$rootScope = $rootScope

    $state.device.deviceAddress = $stateParams.deviceAddress
    $state.device.location = ""
    $state.device.deviceName= $stateParams.name
    $state.bluetoothService = bluetoothService
    $state.viewService = viewService
    viewService.device = $state.device

    console.log($state.device)

    this.subscribe('profile')

    this.helpers({
      profile() {
        return Profiles.findOne({});
      }
    });

    //this.loadingFlagAdd = true;
    $state.loadingFlagAdd = new ReactiveVar(true)

    this.helpers({
      loading: function() {
        return $state.loadingFlagAdd.get();
      }
    });

    $state.loaderMessageAddValue = new ReactiveVar('Preparing for device activation')
    this.helpers({
      loaderMessage: function() {
        return $state.loaderMessageAddValue.get();
      }
    });


    $state.resetFlag = new ReactiveVar(false)

    this.helpers({
      reset: function() {
        return $state.resetFlag.get();
      }
    });

    this.autorun(() => {
      this.getReactively('profile');

      if (this.profile) {

        $state.profile = this.profile
        $state.bleReaderAdd= this.bleReaderAdd
        $state.addFinish = this.addFinish


        $state.versionCommandFlag = false

        // connect
        bluetoothService.manageConnection(
          $stateParams.deviceAddress,
          function() {

            // subscribe
            bluetoothService.subscribe(
              $stateParams.deviceAddress,
              function(results) {

                // execute on first pass
                if (!$state.device.deviceID && !$state.device.firmwareID && $state.versionCommandFlag === false) {
                  console.log("writing version")
                  console.log($stateParams.deviceAddress)
                  $state.versionCommandFlag = true
                  bluetoothService.write($stateParams.deviceAddress, 'version');
                }

                $state.bleReaderAdd($state, results)
              }
            )
          }
        )

      }
    })

    this.dateScrollerSettings = {
      theme: 'ios',
      display: 'bottom',
      max: new Date()
    }

    locationValues = [
      {display: '', value: ''},
      {display: 'Left Wrist', value: 'Left Wrist'},
      {display: 'Left Arm', value: 'Left Arm'},
      {display: 'Left Shoulder', value: 'Left Shoulder'},
      {display: 'Right Wrist', value: 'Right Wrist'},
      {display: 'Right Arm', value: 'Right Arm'},
      {display: 'Right Shoulder', value: 'Right Shoulder'},
    ];

    this.locationSettings = {
        theme: 'ios',
        display: 'bottom',
        width: 200,
        wheels: [
            [{
                circular: false,
                data: locationValues,
                label: 'Location'
            }]
        ],
        showLabel: true,
        minWidth: 130,
        formatValue: function (data) {
          return data[0];
        },
    };


  }


  bleReaderAdd($state, data){

    console.log('bleReaderAdd')

    console.log(data)

    if (data.includes("v")){

      data = data.replace(/[\u0000-\u0008,\u000A-\u001F,\u007F-\u00A0]+/g,' ')
      data = data.replace(/(?:\r\n|\r|\n)/g,' ')
      var version = data.split(/\s+/)
      console.log(version)
      $state.device.deviceID = version[0]
      $state.device.firmwareID = version[1]
      $state.loadingFlagAdd.set(false)

    } else if (data.includes("erase")) {

      $state.device.owner = Meteor.userId()
      $state.bluetoothService.write($state.device.deviceAddress, $state.bluetoothService.buildHeader($state.device, $state.profile));

      $state.loaderMessageAddValue.set("(2/3) Data transfer complete. Reactivating Device")

    } else if (data.includes("header")) {

      $state.bluetoothService.write($state.device.deviceAddress, ":update");

      $state.loaderMessageAddValue.set("(3/3) Device activated and Sync complete")

    } else if (data.includes("dataOK")) {

      this.addFinish($state)

    } else if (data) {

      console.log(data)
    }

  }


  resetJSON() {
    return {
      'name': '',
      'studyID': '',
      'deviceID': '',
      'deviceAddress': '',
      'deviceName': '',
      'firmwareID': '',
      'sensorID': '',
      'date': '',
      'location': '',
      'sensor1': '',
      'sensor2': '',
      'sensor3': '',
      'sensor4': '',
      'qrCodeInformation': '',
      'qrCodeInformationParsed': ''
    }
  }

  add() {

    // check values exist
    if (!this.$state.profile.gender){
      this.$state.resetFlag.set(false)
      Dialogs.alert(
        "Please enter your gender in the profile section and try again.",
        "Error",
        "OK");
    } else if (!this.$state.profile.birthdate){
      this.$state.resetFlag.set(false)
      Dialogs.alert(
        "Please enter your birthdate in the profile section and try again.",
        "Error",
        "OK");
    } else if (!this.$state.device.location || this.$state.device.location === ""){
      this.$state.resetFlag.set(false)
      Dialogs.alert(
        "Please enter a device location and try again.",
        "Error",
        "OK");
    } else if (!this.$state.device.sensorID){
      this.$state.resetFlag.set(false)
      Dialogs.alert(
        "Please enter a sensor ID and try again.",
        "Error",
        "OK");
    } else if (!this.$state.device.sensor1 && !this.$state.device.sensor1 !== ''){
      this.$state.resetFlag.set(false)
      Dialogs.alert(
        "Please enter sensor 1 information and try again.",
        "Error",
        "OK");
    } else if (!this.$state.device.sensor2){
      this.$state.resetFlag.set(false)
      Dialogs.alert(
        "Please enter sensor 2 information and try again.",
        "Error",
        "OK");
    } else if (!this.$state.device.sensor3){
      this.$state.resetFlag.set(false)
      Dialogs.alert(
        "Please enter sensor 3 information and try again.",
        "Error",
        "OK");
    } else if (!this.$state.device.sensor4){
      this.$state.resetFlag.set(false)
      Dialogs.alert(
        "Please enter sensor 4 information and try again.",
        "Error",
        "OK");
    } else {

      this.$state.resetFlag.set(true)

      this.$state.device.owner = Meteor.userId();
      this.$state.device.header = this.$state.bluetoothService.buildHeader(this.$state.device, this.$state.profile)
      this.$state.device.date = Date.now()
      this.$state.device.archive = false

      this.$state.device._id = Devices.insert(this.$state.device);

      console.log(this.$state.device)

      this.$state.$rootScope.battRSSIflag = true;

      da_this_state = this.$state

      Meteor.setTimeout(function() {
        console.log("erase")
        da_this_state.bluetoothService.write(da_this_state.device.deviceAddress, 'erase');
      }, 1000)
      this.$state.loaderMessageAddValue.set("(1/3) Registering device")

      /*
      if (this.$state.resetFlag.get() === true) {
        this.$state.resetFlag.set(false)
        try {
          Devices.remove({
            _id: this.$state.device._id
          })
        } catch (e) {
          console.log(e)
        }
      }
      */

      //this.resetJSON();
    }
  }

  addFinish($state) {

    $state.resetFlag.set(false)

    $state.$rootScope.battRSSIflag = false;

    $state.bluetoothService.disconnect($state.device.deviceAddress)

    // forward, back, enter, exit, swap
    $state.viewService.nextDirection = 'forward';

    params = {
    }
    // Grab the last view info & transition back
    $state.go('deviceDetails', params);
  }


  scanQRCode() {
    if (Meteor.isCordova) {
      BarcodeScanner.scan().then((barcodeData) => {
        // Success! Barcode data is here
        console.debug("barcodeData.text");
        console.debug(barcodeData.text);

        // set searchTerm
        //$scope.$broadcast('search-term-broadcast',barcodeData.text);

        //viewService.searchTerm = barcodeData.text;
        this.$state.device.qrCodeInformation = barcodeData.text
        this.$state.device.qrCodeInformationParsed = barcodeData.text.split(/\s+/)


        this.$state.device.sensorID = this.$state.device.qrCodeInformationParsed[0]
        this.$state.device.sensor1 = this.$state.device.qrCodeInformationParsed[1]
        this.$state.device.sensor2 = this.$state.device.qrCodeInformationParsed[2]
        this.$state.device.sensor3 = this.$state.device.qrCodeInformationParsed[3]
        this.$state.device.sensor4 = this.$state.device.qrCodeInformationParsed[4]


      }, (err) => {
        // An error occurred
        console.debug(err);
      });
    } else {
      console.log("QR Code Reader!")
    }
  }

}

const name = 'deviceAdd';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  'mobiscroll-datetime'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: DeviceAdd
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('deviceAdd', {
      url: '/deviceAdd',
      params: {
        deviceAddress: undefined,
        name: undefined
      },
      template: '<ion-view hide-back-button="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Add Device</span>' +
                '</ion-nav-title>' +
                '<device-add></device-add>' +
                '</ion-view>',
      controller: function($scope, $state, viewService, bluetoothService) {

        $scope.goBackHandler = function() {

          // try to close bluetooth

          console.log("goBackHandler close address")

          try {
            Devices.remove({
              _id: $state.device._id
            })
          } catch (e) {
            console.log(e)
          }

          try {
            bluetoothService.disconnect(
              $state.device.deviceAddress,
              function(results){
                console.log(results)
              })
          } catch (e) {
            console.log(e)
          }


          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('home');

          $state.loadingFlagAdd.set(false)
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
