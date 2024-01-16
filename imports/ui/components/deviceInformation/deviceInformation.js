import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { addSeconds, fromUnixTime } from 'date-fns'

import { name as Report } from '../report/report';
//import { name as Graph } from '../graph/graph';
import { Reports, ReportsContent } from '../../../api/devices';
import { BluetoothController } from 'ionic-native';
import { getContentFromLineNumber, increasingInterval, readFile, removeLines } from '../../../lib/utils/reportHelpers';

import { Devices } from '../../../api/devices';

import template from './deviceInformation.html';
import config from './deviceInformationConfig';

class DeviceInformation {

  constructor($scope, $rootScope, $reactive, $state, viewService, $interval, bluetoothService) {

    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    $scope.subscribe('reports');

    $state.deviceDataInfo = []
    $state.bluetoothService = bluetoothService
    $state.bleDriverInfo = this.bleDriverInfo
    $state.bleReaderInfo = this.bleReaderInfo
    $state.updateInfo = false
    $state.dataOkayFlag = true

    $scope.helpers({
      reports: () => Reports.find({'archive':false})
    });

    $scope.goToReport = (report) => {
      if (!report.hasOutput) return;
      this.viewHandler('report', { id: report._id})
    }

    $state.loadingFlagInfo = new ReactiveVar(false)
    this.helpers({
      loadingInfo: function() {
        return $state.loadingFlagInfo.get();
      }
    });

    $scope.updateInfo = () => {
      alert('Fetch files from device .....');
    }

    $state.batteryLevel = new ReactiveVar('-')

    this.helpers({
      battery: function() {
        return $state.batteryLevel.get();
      }
    });

    $state.rssiValue = new ReactiveVar('-')
    this.helpers({
      rssi: function() {
        return $state.rssiValue.get();
      }
    });

    $state.deviceReadyValue = new ReactiveVar(false)
    this.helpers({
      deviceReady: function() {
        return $state.deviceReadyValue.get();
      }
    });

    this.autorun(() => {
      this.getReactively('rssi');
      if (this.rssi !== '-') {
        //$rootScope.$broadcast('deviceConnectionReady');
        $state.deviceReadyValue.set(true)
      }

    })

    $state.deviceSpaceValue = new ReactiveVar('-')
    this.helpers({
      deviceSpace: function() {
        return $state.deviceSpaceValue.get();
      }
    });

    $state.testDataValue = new ReactiveVar(' ')
    this.helpers({
      testData: function() {
        return $state.testDataValue.get();
      }
    });

    this.subscribe('device');

    this.helpers({
      device() {
        $scope.device = Devices.findOne({'archive':false});
        return $scope.device
      }
    });

    this.autorun(() => {
      this.getReactively('device');

      if (this.device) {

        console.log(this.device);

        $state.device = this.device
        $rootScope.$broadcast('deviceConnectionReady');
      } else {
        $rootScope.$broadcast('deviceConnectionReset');
      }
    });


    this.status = Meteor.status();
    this.autorun(() => {
      this.getReactively('status');
      $scope.connected = Meteor.status().connected;
    });

    $state.loaderMessageInfoValue = new ReactiveVar(' ')
    this.helpers({
      loaderMessage: function() {
        return $state.loaderMessageInfoValue.get();
      }
    });

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


    this.autorun(() => {

      this.getReactively('device');

      if (this.device) {

        /*
        btDriver = this.btDriver;
        deviceNew = this.device;
        batteryLevel = this.batteryLevel;
        rssiValue= this.rssiValue;
        address = this.device.deviceAddress;
        deviceSpaceValue = this.deviceSpaceValue;
        testDataValue = this.testDataValue;
        btReader = this.btReader;
        btIssueCommand = this.btIssueCommand;
        deviceDataInfo = this.deviceDataInfo;
        loadingFlagInfo = this.loadingFlagInfo;
        dataOkayFlag = this.dataOkayFlag;
        loaderMessageInfoValue = this.loaderMessageInfoValue;
        */

        $scope.doRefresh = () => {
          $state.loadingFlagInfo.set(true)
          $state.updateInfoFlag = true
          $state.updateInfoHoldFlag = false
          this.bleDriverInfo($state)
        }

        $scope.newReport  = () => {
          $state.loadingFlagInfo.set(true)
          $state.deviceReadyValue.set(false)
          $state.loaderMessageInfoValue.set("Device is syncing with app. Do not interrupt")
          $state.updateInfoFlag = true
          $state.updateInfoHoldFlag = false
          $state.bleDriverInfo($state)
        }

        $rootScope.$on('s3sync', function(){
          $state.loadingFlagInfo.set(true)
          $state.deviceReadyValue.set(false)
          $state.loaderMessageInfoValue.set("Syncing data with server. Do not interrupt.")

          header = $state.device.name + " " + $state.device.deviceName + " "  + $state.device.sensorID;
          let dt = new Date()
          filename = timeConverter(dt) + "-" + $state.device.deviceName + "-" + $state.device.sensorID + ".txt"
          //currentReport = Reports.findOne({$and:[{"header":header},{"archive":false}]}); -- No callback

          Meteor.call('currentReport', header, function(error, currentReport) {
            Reports.update({'_id':currentReport._id},{$set:{'filename': filename}})
            Meteor.call('uploadFileToS3', currentReport.data, filename, header);
            Meteor.setTimeout(function(){
              Meteor.call('listUserReports');

              $state.loadingFlagInfo.set(false)
              $state.deviceReadyValue.set(true)

            }, 50000)

          });

        });

        di_state = $state

        // called when any state changes.
        $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {

              $scope.$broadcast('scroll.refreshComplete');

              if (this.device) {
                $rootScope.$broadcast('deviceConnectionReady');
              } else {
                $rootScope.$broadcast('deviceConnectionReset');
              }

              //$rootScope.$broadcast('deviceConnectionReset');

             //console.log("STATE CHANGE")
             if (toState.url === "/deviceInformation") {
               //console.log("reconnect")

               di_state.loadingFlagInfo.set(false)

               di_state.updateInfoFlag = false
               di_state.updateInfoHoldFlag = false
               di_state.bleDriverInfo($state);

               /*
               setTimeout(() => {
                 //viewService.deviceAddress = address;
                 //viewService.header = this.device.header;
                 $state.bleDriverInfo($state);
               }, 2000)
               */
             }

        });
      }
    })

    $scope.$watch('reports', function (files, oldValue) {
      $scope.$emit('selectedFiles', files.filter((file) => file.checked))
    }, true)


    $scope.$on("$destroy", function() {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    });

  }


  bleDriverInfo($state) {

    console.log("bleDriverInfo");

    di_state = $state

    // connect
    di_state.bluetoothService.manageConnection(
      di_state.device.deviceAddress,
      function() {

          di_state.bluetoothService.readRSSI(
            di_state.device.deviceAddress,
            function(rssiValue) {
              di_state.rssiValue.set(rssiValue.toString() + " dBm")
            }
          );

          //di_state.bluetoothService.write(di_state.device.deviceAddress, "battstatus");

        di_state.bluetoothService.subscribe(
          di_state.device.deviceAddress,
          function(results) {

            if (di_state.updateInfoFlag === true) {

              di_state.updateInfoFlag = false
              di_state.updateInfoHoldFlag = true
              di_state.bluetoothService.write(di_state.device.deviceAddress, ":update");


            } /* else if (di_state.updateInfoHoldFlag !== true) {

              di_state.bluetoothService.readRSSI(
                di_state.device.deviceAddress,
                function(rssiValue) {
                  di_state.rssiValue.set(rssiValue.toString() + " dBm")
                }
              );
              di_state.bluetoothService.write(di_state.device.deviceAddress, "battstatus");

            }
            */

            di_state.bleReaderInfo(_, results)

          }
        )
      }
    )
  }


  bleReaderInfo($state, data){

    di_state = $state

    console.log('bleReaderInfo');
    console.log(data)


    if (data.includes("%")){
      //console.log(uncodedData);
      console.log('battery update');
      console.log(data);
      di_state.batteryLevel.set(data)

    } else if (data.includes("dataOK") && di_state.dataOkayFlag == true) {

      di_state.loaderMessageInfoValue.set("Data has been recieved - processing")

      dArray = di_state.deviceDataInfo.split('\n')
      deviceDataInfo = []

      for(i = 0; i < dArray.length; i++ ) {
        if (dArray[i] !== '' && !dArray[i].includes("v") && !dArray[i].includes("%") && !dArray[i].includes("kB") && !dArray[i].includes(":")) {
          deviceDataInfo.push(dArray[i])
        }
      }

      /*
      if (deviceDataInfo[1].includes("128kB")) {
        di_state.deviceSpaceValue.set(deviceDataInfo[1].trim().replace(',',''));
      }
      */

      /*
      deviceDataInfo.splice(0, 2)
      console.log("deviceDataInfo")

      deviceDataInfoPrep = []
      deviceDataInfo.forEach(function (row) {
        if (!row.includes("v") || !row.includes("k")) {
          deviceDataInfoPrep.push(row.replace(/,\s*$/, ""))
        }
      });
      deviceDataInfoString = deviceDataInfoPrep.join('')
      deviceDataInfoArray = deviceDataInfoString.split("\r");
      deviceDataInfo = deviceDataInfoArray.map(s => s.replace(/^,/, ''))
      */

      try {
        //currentReport = Reports.findOne({$and:[{"header":device.name + " " + device.deviceName + " "  + device.sensorID},{"archive":false}]});
        headerID = di_state.device.name + " " + di_state.device.deviceName + " "  + di_state.device.sensorID
        Meteor.call('currentReport', headerID, function(error, currentReport) {

          if (error) {
            console.log("currentReport error")
            consolge.log(error)
          } else {

            console.log("currentReport success")

            Meteor.setTimeout(() => {

              if (!currentReport) {

                var rawData = JSON.parse(JSON.stringify(deviceDataInfo))
                rawData = [di_state.device.header].concat(rawData)
                rawData.push("dataOK")
                rawData.push(Date.now())

                var correctArrayLength = 11

                for (var i=0; i<deviceDataInfo.length; ++i) {
                  // get length of string
                  deviceDataInfoString = deviceDataInfo[i].replace(/,+/g,',').replace(/^,|,$/g,'')
                  var array = deviceDataInfoString.split(",")

                  // if string length valid
                  if (array.length === correctArrayLength) {
                    deviceDataInfo[i] = array.join(",")
                  } else {
                    deviceDataInfo[i] = ''
                  }
                }

                deviceDataInfoPrep = [di_state.device.header].concat(deviceDataInfo)
                deviceDataInfoPrep.push("dataOK")

                Reports.insert({
                  owner: Meteor.userId(),
                  header: di_state.device.name + " " + di_state.device.deviceName + " "  + di_state.device.sensorID,
                  hasOutput: false,
                  device: di_state.device,
                  data: deviceDataInfoPrep,
                  rawData: [rawData],
                  filename: null,
                  archive: false
                })

                deviceDataInfo = []
                di_state.bluetoothService.write(di_state.device.deviceAddress, "erase");
                di_state.loaderMessageInfoValue.set("Erasing device data \n(erase command)")


              } else {

                if (currentReport.rawData) {
                  var rawData = JSON.parse(JSON.stringify(currentReport.rawData))
                  var deviceDataInfoTmp = JSON.parse(JSON.stringify(deviceDataInfo))
                  rawDataPrep = [di_state.device.header].concat(deviceDataInfoTmp)
                  rawDataPrep.push("dataOK")
                  rawDataPrep.push(Date.now())
                  rawData.push(rawDataPrep)
                } else {
                  rawDataPrep = JSON.parse(JSON.stringify([di_state.device.header].concat(deviceDataInfo)))
                  rawDataPrep.push("dataOK")
                  rawDataPrep.push(Date.now())
                  var rawData = [rawDataPrep]
                }


                var reportData = JSON.parse(JSON.stringify(currentReport.data))
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

                for (var i=0; i<deviceDataInfo.length; ++i) {
                  // get length of string
                  deviceDataInfoString = deviceDataInfo[i].replace(/,+/g,',').replace(/^,|,$/g,'')
                  var array = deviceDataInfoString.split(",")

                  // if string length valid
                  if (array.length === correctArrayLength) {
                    array[0] = parseInt(array[0]) + maxSeconds + 90
                    deviceDataInfo[i] = array.join(",")
                  } else {
                    deviceDataInfo[i] = ''
                  }
                }

                var a = currentReport.data.concat(deviceDataInfo).concat();

                a = a.filter(function(e) { return (e !== device.header && e !== "dataOK" && !e.includes("v") && !e.includes("kB") && !e.includes("%") && e !== "")})

                for(var i=0; i<a.length; ++i) {
                    for(var j=i+1; j<a.length; ++j) {
                        if(a[i] === a[j])
                            a.splice(j--, 1);
                    }
                }

                //deviceDataInfoPrep = [di_state.device.header].concat(a)
                a.push("dataOK")

                Reports.update({'_id':currentReport._id},{$set:{'data': a, 'rawData': rawData}})
              }

              deviceDataInfo = []
              di_state.bluetoothService.write(di_state.device.deviceAddress, "erase");
              di_state.loaderMessageInfoValue.set("Erasing device data \n(erase command)")
              //loadingFlagInfo.set(false)

              }, 3000)
            }
        });

        //$scope.$broadcast('scroll.refreshComplete');

      } catch (e) {
        console.log(e);
      }

    /*
    } else if (/\d/.test(data)){

      //cleanData = uncodedData.replace(/[\u0000-\u0008,\u000A-\u001F,\u007F-\u00A0]+/g,' ')
      //deviceDataInfo.push(cleanData.replace(/\s\s+/g, ','))
      deviceDataInfo.push(data.replace(/[\n\u0000]+/g, ','))
      //console.log(deviceDataInfo.length)

    } */
    } else if (data.includes("eraseOK")) {

      di_state.bluetoothService.write(di_state.device.deviceAddress, di_state.device.header);
      di_state.loaderMessageInfoValue.set("Data transfer complete. Reactivating Device")

    } else if (data.includes("headerOK")) {

      di_state.dataOkayFlag = false;
      di_state.bluetoothService.write(di_state.device.deviceAddress, ":update");
      di_state.loaderMessageInfoValue.set("Device activated and Sync complete")

    } else if (data.includes("dataOK") && di_state.dataOkayFlag == false) {

      di_state.deviceReadyValue.set(true)
      di_state.deviceSpaceValue.set("0/128kB");
      di_state.dataOkayFlag = true
      di_state.updateInfoHoldFlag = false
      di_state.loadingFlagInfo.set(false)
      di_state.deviceDataInfo = []

      di_state.bluetoothService.disconnect(di_state.device.deviceAddress);

      /*
      try {

        di_state.bluetoothService.disconnect(
          di_state.device.deviceAddress,
          function(results){
            console.log(results)
          })
      } catch (e) {

        console.log(e)
      }
      */

    } else {

      td1 = data.replace(/[\u0000\u0001\r]/g, '')
      td2 = td1.replace(/;\s*/g, '\n')
      td3 = td2.replace(/ÿ\s*/g, '\n')
      td4 = td3.replace(/[\r]+/g, '');
      di_state.deviceDataInfo = di_state.deviceDataInfo + '' + td4

      /*
      console.log("Not handled!");
      console.log(data);
      */

    }
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


const name = 'deviceInformation';

// create a module
export default angular.module(name, [angularMeteor, Report, Graph])
    .component(name, { template, controllerAs: name, controller: DeviceInformation})
    .config(config);
