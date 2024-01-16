import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { Keyboard } from 'ionic-native';
import { Dialogs } from 'ionic-native';

import template from './deviceDetails.html';

import { Devices } from '../../../api/devices';
import { Profiles } from '../../../api/profiles';
import { Reports, ReportsContent } from '../../../api/devices';
import { name as DisplayDateFilter } from '../../filters/displayDateFilter';

class DeviceDetails {
  constructor($rootScope, $scope, $reactive, $stateParams, $state, viewService, bluetoothService) {
    'ngInject';


    $reactive(this).attach($scope);

    this.$rootScope = $rootScope;
    this.$state = $state;
    this.viewService = viewService;
    $state.viewService = viewService;
    $state.device = {};
    $state.deviceData = ''
    $state.update = true
    $state.bluetoothService = bluetoothService
    $state.bleReader = this.bleReader
    $rootScope.battRSSIflag = false
    $state.$rootScope = $rootScope
    $state.criticalError = true
    $state.criticalErrorBattery = true

    $state.loadingFlag = new ReactiveVar(false)
    this.helpers({
      loading: function() {
        return $state.loadingFlag.get();
      }
    });

    $state.loaderMessageValue = new ReactiveVar('(1/5) Preparing for device removal')
    this.helpers({
      loaderMessage: function() {
        return $state.loaderMessageValue.get();
      }
    });

    this.status = Meteor.status();
    this.autorun(() => {
      this.getReactively('status');
      $scope.connected = Meteor.status().connected;
    });

    this.helpers({
      device() {
        return Devices.findOne({'archive': false});
      }
    });


    this.helpers({
      profile() {
        return Profiles.findOne({});
      }
    });

    bleDriverInfo = this.bleDriverInfo

    this.autorun(() => {
      this.getReactively('profile');
      this.getReactively('device');

      if (this.device && $state.device.deviceAddress) {
        $state.device = this.device
        console.log(this.device)

        bleDriverInfo($state)
      }

    });

    $scope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams, options) {
      if (fromState.url === "/deviceDetails") {
        $state.criticalError = false
        $state.criticalErrorBattery = false
      }
    })

    $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {

         if (toState.url == "/deviceDetails") {
           $state.update = true

           $state.device = Devices.findOne({'archive': false});

           $rootScope.battRSSIflag = false

           $state.criticalError = true
           $state.criticalErrorBattery = true

           console.log($state.device.deviceAddress)
           if ($state.device && $state.device.deviceAddress) {
             bleDriverInfo($state)
           }
         }

    });

    $state.batteryLevel = new ReactiveVar('-')
    this.helpers({
      battery: function() {
        return $state.batteryLevel.get();
      }
    });

    this.autorun(() => {
      this.getReactively('battery');

      btl_tmp = this.battery.substring(0,this.battery.length-1)

      console.log(btl_tmp)

      try {
        btl_num = parseInt(btl_tmp)
        console.log(btl_num)

        if (btl_num <= 10) {
          Dialogs.alert(
            "Device battery level is critically low. Please charge immediately.",
            "Battery Low",
            "OK");
        }

      } catch(e) {
        console.log(e)
      }


    });

    $state.rssiValue = new ReactiveVar('-')
    this.helpers({
      rssi: function() {
        return $state.rssiValue.get();
      }
    })

    this.dateScrollerSettings = {
      theme: 'ios',
      display: 'bottom',
      max: new Date()
    }

    locationValues = [
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

  getAge(birthDate) {
    return Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)
  }

  bleDriverInfo($state) {

    console.log($state.device.deviceAddress)

    dd_state = $state

    if (dd_state.$rootScope.battRSSIflag === false) {

      // connect
      dd_state.bluetoothService.manageConnection(
        dd_state.device.deviceAddress,
        function() {

            Meteor.setTimeout(function(){

              if (dd_state.criticalErrorBattery !== false) {

                dd_state.bluetoothService.disconnect(dd_state.device.deviceAddress)

                Dialogs.alert(
                  "We have enountered a problem communicating with your device. Please try again. If the problem persists please contact pr@enlisense.com.",
                  "Error",
                  "OK").then(function() {
                    document.location.reload(true)
                  })
              }

            }, 50000);

            dd_state.bluetoothService.write(dd_state.device.deviceAddress, "battstatus");

            dd_state.bluetoothService.subscribe(
               dd_state.device.deviceAddress,
              function(results) {

                  if (results.includes("%")){
                    //console.log(uncodedData);
                    console.log('battery update');
                    console.log(results);
                    dd_state.batteryLevel.set(results)
                    dd_state.criticalErrorBattery = false
                  }


                  dd_state.bluetoothService.readRSSI(
                    dd_state.device.deviceAddress,
                    function(rssiValue) {
                      dd_state.rssiValue.set(rssiValue.toString() + " dBm")
                    }
                  );
                  dd_state.bluetoothService.write(dd_state.device.deviceAddress, "battstatus");


                  dd_state.bleReaderInfo(_)

              }
            )
          }
        )
      }
  }


  bleReader($state, data){

    dd_blereader_state = $state

    console.log("bleReader");
    console.log(data)

    function timeConverter(UNIX_timestamp){
      var a = new Date(UNIX_timestamp);
      var year = a.getFullYear();
      var month = ('0' + (a.getMonth() + 1)).slice(-2);
      var date = ('0' + a.getDate()).slice(-2);
      var hour = a.getHours();
      var min = a.getMinutes();
      var ampm = hour >= 12 ? 'PM' : 'AM';
      var time = month + '-' + date + '-' + year + '-' + hour + '-' + min + '-' + ampm ;
      return time;
    }

    deviceData = dd_blereader_state.deviceData

    /*
    deviceData = $state.deviceData
    device = $state.device
    btIssueCommand = $state.btIssueCommand
    address = device.deviceAddress
    unsubscribe= $state.unsubscribe
    close = this.close
    disconnect = this.disconnect
    */

    if (data.includes("erase")) {

      console.log("ERASE")

      dd_blereader_state.criticalError = false

      dd_blereader_state.loaderMessageValue.set("(5/5) Device erased succesfully. Preparing final data. (May take up to 30 seconds).")


      try {

        console.log("TRYING DISCONNECT")
        header = dd_blereader_state.device.name + " " + dd_blereader_state.device.deviceName + " "  + dd_blereader_state.device.sensorID;
        console.log(header)


        let dt = new Date()
        filename = timeConverter(dt) + "-" + dd_blereader_state.device.deviceName + "-" + dd_blereader_state.device.sensorID + ".txt"
        //currentReport = Reports.findOne({$and:[{"header":header},{"archive":false}]});

          //Meteor.call('currentReport', header, function(error, currentReport) {

          currentReport = dd_blereader_state.currentReportDeviceDetails
          console.log("*** currentReport ***")
          console.log(currentReport)
          console.log("*** currentReport ***")

            /*
              if (error) {
                console.log("currentReport error")
                consolge.log(error)
              } else {
                console.log("currentReport success")
                console.log(currentReport)
            */
                //Meteor.setTimeout(() => {

                  if (currentReport && currentReport.data && currentReport.data.length > 2) {

                    console.log("CURRENT REPORT PATH")

                    Reports.update({'_id':currentReport._id},{$set:{'filename': filename}})
                    Meteor.call('uploadFileToS3', currentReport.data, filename, header);

                    console.log("*** timeout ***")

                    Meteor.setTimeout(function(){

                      console.log("*** listUserReports ***")

                      Meteor.call('listUserReports');

                      Devices.update({
                        _id: dd_blereader_state.device._id
                      },{
                        $set:{"archive": true, "removalDate": Date.now()}
                      })

                      try {

                        dd_blereader_state.bluetoothService.disconnect(
                          dd_blereader_state.device.deviceAddress,
                          function(results){
                            console.log(results)
                          })
                      } catch (e) {

                        console.log(e)
                      }

                      dd_blereader_state.loadingFlag.set(false);
                      dd_blereader_state.deviceData = []

                      // forward, back, enter, exit, swap
                      dd_blereader_state.viewService.nextDirection = 'forward';

                      // Grab the last view info & transition back
                      dd_blereader_state.go('home');
                    }, 50000)

                  } else {

                    console.log("*** NON *** CURRENT REPORT PATH")

                    dd_blereader_state.loadingFlag.set(false);

                    Devices.update({
                      _id: dd_blereader_state.device._id
                    },{
                      $set:{"archive": true, "removalDate": Date.now()}
                    })

                      try {
                        dd_blereader_state.bluetoothService.disconnect(
                          dd_blereader_state.device.deviceAddress,
                          function(results){
                            console.log(results)
                          })
                      } catch (e) {
                        console.log(e)
                      }

                      dd_blereader_state.loadingFlag.set(false);
                      dd_blereader_state.deviceData = []

                      // forward, back, enter, exit, swap
                      dd_blereader_state.viewService.nextDirection = 'forward';

                      // Grab the last view info & transition back
                      dd_blereader_state.go('home');
                  }

                //}, 3000)

              //}
          //})


      } catch (e) {

        console.log("DISCONNECT ERROR")
        console.log(e)

        try {
          dd_blereader_state.bluetoothService.disconnect(
            dd_blereader_state.device.deviceAddress,
            function(results){
              console.log(results)
            })
        } catch (e) {
          console.log(e)
        }

        dd_blereader_state.loadingFlag.set(false);
        dd_blereader_state.deviceData = []

        // forward, back, enter, exit, swap
        dd_blereader_state.viewService.nextDirection = 'forward';

        // Grab the last view info & transition back
        dd_blereader_state.go('home');

      }

    } else if (data.includes("dataOK")) {

      console.log("DATAOK")

      dd_blereader_state.loaderMessageValue.set("(3/5) Data received. Saving to server.")

      dArray = dd_blereader_state.deviceData.split('\n')
      deviceData = []

      for(i = 0; i < dArray.length; i++ ) {
        if (dArray[i] !== '' && !dArray[i].includes("v") && !dArray[i].includes("%") && !dArray[i].includes("kB") && !dArray[i].includes(":")) {
          deviceData.push(dArray[i])
        }
      }
      console.log(deviceData)

      /*
      deviceDataPrep = []
      deviceData.forEach(function (row) {
        if (!row.includes("v") || !row.includes("k")) {
          deviceDataPrep.push(row.replace(/,\s*$/, ""))
        }
      });
      deviceDataString = deviceDataPrep.join('')
      deviceDataArray = deviceDataString.split("\r");
      deviceData = deviceDataArray.map(s => s.replace(/^,/, ''))
      */

      try {

        headerID = dd_blereader_state.device.name + " " + dd_blereader_state.device.deviceName + " "  + dd_blereader_state.device.sensorID
        Meteor.call('currentReport', headerID, function(error, currentReport) {

          Meteor.setTimeout(function(){

            if (error) {
              console.log("currentReport error")
              consolge.log(error)
            } else {

              if (!currentReport) {

                var rawData = JSON.parse(JSON.stringify(deviceData))
                rawData = [dd_blereader_state.device.header].concat(rawData)
                rawData.push("dataOK")
                rawData.push(Date.now())
                rawData.push(new Date())

                var correctArrayLength = 11

                for (var i=0; i<deviceData.length; ++i) {
                  // get length of string
                  deviceDataString = deviceData[i].replace(/,+/g,',').replace(/^,|,$/g,'')
                  var array = deviceDataString.split(",")

                  // if string length valid
                  if (array.length === correctArrayLength) {
                    deviceData[i] = array.join(",")
                  } else {
                    deviceData[i] = ''
                  }
                }

                deviceDataPrep = [dd_blereader_state.device.header].concat(deviceData)
                deviceDataPrep.push("dataOK")


                _id = Reports.insert({
                  owner: Meteor.userId(),
                  header: dd_blereader_state.device.name + " " + dd_blereader_state.device.deviceName + " " + dd_blereader_state.device.sensorID,
                  hasOutput: false,
                  device: dd_blereader_state.device,
                  data: deviceDataPrep,
                  rawData: [rawData],
                  filename: null,
                  archive: true,
                  noExistingReportFound: true,
                  entryTimestamp: new Date()
                })
                dd_blereader_state.currentReportDeviceDetails = Reports.findOne({'_id':_id})

                deviceData = []
                dd_blereader_state.bluetoothService.write(dd_blereader_state.device.deviceAddress, "erase");

                dd_blereader_state.loaderMessageValue.set("(4/5) Removing device")

              } else {

                if (currentReport.rawData) {
                  var rawData = JSON.parse(JSON.stringify(currentReport.rawData))
                  var deviceDataTmp = JSON.parse(JSON.stringify(deviceData))
                  rawDataPrep = [dd_blereader_state.device.header].concat(deviceDataTmp)
                  rawDataPrep.push("dataOK")
                  rawDataPrep.push(Date.now())
                  rawDataPrep.push(new Date())
                  rawData.push(rawDataPrep)
                } else {
                  rawDataPrep = JSON.parse(JSON.stringify([dd_blereader_state.device.header].concat(deviceData)))
                  rawDataPrep.push("dataOK")
                  rawDataPrep.push(Date.now())
                  rawDataPrep.push(new Date())
                  var rawData = [rawDataPrep]
                }

                var reportData = currentReport.data
                var maxSeconds = 0
                var correctArrayLength = 11

                for (var i=0; i<reportData.length; ++i) {

                  // get length of string
                  var array = reportData[i].split(",")

                  // if string length valid
                  if (array.length === correctArrayLength) {
                    // get the first value (seconds)
                    var numSeconds = parseInt(array[0])
                    if (numSeconds > maxSeconds) {
                      maxSeconds = numSeconds
                    }
                  }
                }

                for (var i=0; i<deviceData.length; ++i) {
                  // get length of string
                  deviceDataString = deviceData[i].replace(/,+/g,',').replace(/^,|,$/g,'')
                  var array = deviceDataString.split(",")

                  // if string length valid
                  if (array.length === correctArrayLength) {
                    array[0] = parseInt(array[0]) + maxSeconds + 180
                    deviceData[i] = array.join(",")
                  } else {
                    deviceData[i] = ''
                  }
                }

                var a = currentReport.data.concat(deviceData).concat();
                deviceData = []

                a = a.filter(function(e) { return (e !== dd_blereader_state.device.header && e !== "dataOK" && !e.includes("v") && !e.includes("kB") && !e.includes("%") && e !== "")})

                for(var i=0; i<a.length; ++i) {
                    for(var j=i+1; j<a.length; ++j) {
                        if(a[i] === a[j])
                            a.splice(j--, 1);
                    }
                }

                a = [dd_blereader_state.device.header].concat(a)
                a.push("dataOK")

                Reports.update({'_id':currentReport._id},{$set:{'data': a, 'rawData': rawData, 'archive': true}})
                dd_blereader_state.currentReportDeviceDetails = currentReport
                dd_blereader_state.currentReportDeviceDetails.data = a
                dd_blereader_state.currentReportDeviceDetails.rawData = rawData

                deviceData = []
                dd_blereader_state.bluetoothService.write(dd_blereader_state.device.deviceAddress, "erase");

                dd_blereader_state.loaderMessageValue.set("(4/5) Removing device")
              }
            }

          }, 3000)

        })

      } catch (e) {
        console.log(e);
      }

    } else {

      td1 = data.replace(/[\u0000\u0001\r]/g, '')
      td2 = td1.replace(/;\s*/g, '\n')
      td3 = td2.replace(/ÿ\s*/g, '\n')
      td4 = td3.replace(/[\r]+/g, '');
      dd_blereader_state.deviceData = dd_blereader_state.deviceData + '' + td4

    }

  }


  add() {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go('bluetoothList');
  }

  drop() {

    dd_this_state = this.$state;

    if (dd_this_state.device) {
      dd_this_state.loadingFlag.set(true)

      dd_this_state.bluetoothService.manageConnection(
        dd_this_state.device.deviceAddress,
        function() {

          console.log("START TIMEOUT deviceDetails")

          Meteor.setTimeout(function(){

            console.log("timeout")

            if (dd_this_state.criticalError !== false) {

              console.log("here")
              console.log(dd_this_state.device.deviceAddress)

              dd_this_state.bluetoothService.disconnect(dd_this_state.device.deviceAddress)

              Dialogs.alert(
                "We have enountered a problem communicating with your device. Please try again. If the problem persists please contact pr@enlisense.com.",
                "Error",
                "OK").then(function() {
                  document.location.reload(true)
                })

            }

          }, 220000);

          // subscribe
          dd_this_state.bluetoothService.subscribe(
            dd_this_state.device.deviceAddress,
            function(results) {

              Meteor.setTimeout(function() {
                if (dd_this_state.update === true) {
                  dd_this_state.update = false;
                  dd_this_state.bluetoothService.write(dd_this_state.device.deviceAddress, ':update');

                  dd_this_state.loaderMessageValue.set("(2/5) Device is syncing with app. Do not interrupt")
                }

                dd_this_state.$rootScope.battRSSIflag = true
                dd_this_state.bleReader(dd_this_state, results)
              }, 1000)
            }
          )
        }
      )

      /*
      Devices.remove({
        _id: this.$state.device._id
      })
      */

    }

    /*
    Devices.update({
      _id: this.device._id
    },{
      $set:{"archive": true}})

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go('more');
    */
  }

  save() {

    Devices.update({
      _id: this.$state.device._id
    }, {
      $set: {
        name: this.$state.device.name,
        studyID: this.$state.device.studyID,
        deviceID: this.$state.device.deviceID,
        deviceAddress: this.$state.device.deviceAddress,
        firmwareID: this.$state.device.firmwareID,
        sensorID: this.$state.device.sensorID,
        location: this.$state.device.location,
        sensor1: this.$state.device.sensor1,
        sensor2: this.$state.device.sensor2,
        sensor3: this.$state.device.sensor3,
        sensor4: this.$state.device.sensor4,
        header: this.$state.device.header,
        archive: false
      }
    });

    this.$state.device = {}

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go('home');

  }

}

const name = 'deviceDetails';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  'mobiscroll-datetime'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: DeviceDetails
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('deviceDetails', {
      url: '/deviceDetails',
      params: {
        _id: undefined
      },
      template: '<ion-view title="Device Details" hide-back-button="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Device Details</span>' +
                '</ion-nav-title>' +
                '<device-details></device-details>' +
                '</ion-view>',
      controller: function($scope, $state, viewService) {
        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('home');

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
