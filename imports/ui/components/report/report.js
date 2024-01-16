import { Meteor } from 'meteor/meteor';
import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { format } from 'date-fns';
import { addSeconds, fromUnixTime } from 'date-fns'

import template from './report.html';
import config from './reportConfig';

import { BluetoothController } from 'ionic-native';

import { Reports, ReportsContent } from '../../../api/devices';
import { Devices } from '../../../api/devices';
import { Dialogs } from 'ionic-native';

import { name as ReportDatePicker } from '../reportDatePicker/reportDatePicker';

import { MbscCalendarOptions } from '../../../../client/lib/mobiscroll.angularjs.min.js';

import Chart from 'chart.js/auto'
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';


function chart(t, $window, data, startTime, endTime){

  if (t.chart) {
    t.chart.destroy()
  }

  endTime += 60 * 60

  if (data && data.length) {

    var cleanData = data.filter(function (obj) {
      return obj.date !== 0;
    });

    labels = cleanData.map(a => a.date);
    data = cleanData.map(a => a.value);
    colors = ["#3498db"];

    t.chart = new Chart("line", {
      type: 'line',

      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            borderColor: "#3498db"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point:{
            radius: 0
          },
          line: {
            fill: false,
            borderColor: "#3498db"
          }
        },
        scales: {
          x: {
            type: "time",
            min: startTime,
            max: endTime,
            adapters: {
              date: {
                locale: enUS,
              },
            },
            ticks: {
              font: {
                size: 14,
                weight: "bold"
              }
            }
          },
          y: {
            ticks: {
              font: {
                size: 14,
                weight: "bold"
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            },
            limits: {
              x: {
                min: startTime,
                max: endTime
              }
            }
          }
        }
      }

    });

  }
}

class Report {
  constructor($rootScope, $scope, $reactive, $state, viewService, $stateParams, $window, bluetoothService) {

    'ngInject';

    $reactive(this).attach($scope);

    this.$rootScope = $rootScope
    $scope.currentDate = new Date();
    $scope.reportTodayData = false


    this.$window = $window;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.viewService = viewService;
    this.showReportLoader = true;
    $scope.stats = {};
    $scope.note = { text: "" };
    $scope.graphBoxTitle = 'Degrees Celsius';
    $scope.selectedDateRange = {};
    $scope.keys = {}

    $scope.key = 'degC'
    $scope.label = 'degC'
    $scope.keyShort = 'Degrees Celsius'
    $scope.this = this

    $rootScope.currentScope = $scope


    $scope.renderCV = (key) => {
      if (!$scope.stats.stdDev && !$scope.stats.average) return;
      return (($scope.stats.stdDev[key] / $scope.stats.average[key]) * 100).toFixed(2)
    }

    t = this
    $rootScope.$on("calendar-date", function(event, data){
      t.updateDay(data.date)
    });

    this.subscribe('reports')

    this.helpers({
      //states: () => ReportsContent.find({ reportId: $stateParams.id, row: { $exists: true } }),
      reportData: () => Reports.findOne({$and:[{owner: $stateParams.id},{"archive":false}]})
    });

    this.$state = $state;
    this.viewService = viewService;


    $state.deviceDataInfo = []
    $state.bluetoothService = bluetoothService
    $state.bleDriverInfo = this.bleDriverInfo
    $state.bleReaderInfo = this.bleReaderInfo
    $state.updateInfo = false
    $state.dataOkayFlag = true

    $state.criticalError = true

    $state.reportThis = this


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

      if (this.device && this.device.deviceAddress) {

        $state.device = this.device

        this.autorunDevice($rootScope, $scope, $state)

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

    $state.deviceRefresh = this.deviceRefresh

    $scope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams, options) {
      if (fromState.url === "/reports") {
        $state.criticalError = false
      }
    })

    // called when any state changes.
    $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {


      if (toState.url === "/reports") {

        $state.device = {}
        $state.device = Devices.findOne({'archive':false})

        $state.criticalError = true

        $scope.reportTodayData = false
        console.log('$stateChangeSuccess - deviceRefresh')
        $state.deviceRefresh($rootScope)

        $state.loadingFlagInfo.set(false)

        $state.updateInfoFlag = false
        $state.updateInfoHoldFlag = false


        if ($state.device) {
          $rootScope.$broadcast('deviceConnectionReady');
        } else {
          $rootScope.$broadcast('deviceConnectionReset');
        }


      }

    });

    //$rootScope.$on('s3sync', function(){
    $state.s3sync  = () => {
      $state.loadingFlagInfo.set(true)
      $state.deviceReadyValue.set(false)
      $state.loaderMessageInfoValue.set("(6/6) Syncing data with server. Do not interrupt.")

      header = $state.device.name + " " + $state.device.deviceName + " "  + $state.device.sensorID;
      let dt = new Date()
      filename = timeConverter(dt) + "-" + $state.device.deviceName + "-" + $state.device.sensorID + ".txt"
      //currentReport = Reports.findOne({$and:[{"header":header},{"archive":false}]}); -- No callback

      Meteor.call('currentReport', header, function(error, currentReport) {
        Reports.update({'_id':currentReport._id},{$set:{'filename': filename}})
        Meteor.call('uploadFileToS3', currentReport.data, filename, header);
        Meteor.setTimeout(function(){

          //console.log("***** listUserReports *****")
          Meteor.call('listUserReports');

          Dialogs.alert(
            "Yay! Our servers are at work analyzing your data. It may take up to 10 mins for the results. Check back here shortly.",
            "Success",
            "OK")

          $state.loadingFlagInfo.set(false)
          $state.deviceReadyValue.set(true)

          try {
            $state.deviceRefresh($rootScope)
          } catch(e) {
            console.log(e)
          }

        }, 50000)

      });

    };

    $scope.updateGraph = (key, label) => {
      $scope.graphBoxTitle = key;

      if (key === 'degC') {
        $scope.graphBoxTitle = 'Degrees Celsius'
      } else if (key === 'RH') {
        $scope.graphBoxTitle = 'Perspiration'
      }

      $scope.key = key
      $scope.label = label

      keys = $scope.keys

      currentDateUTC = new Date()
      timezoneOffset = currentDateUTC.getTimezoneOffset() * 60.0 * 1000.0

      startTime = scope.currentDate.setHours(0,0,0,0)
      startTime = startTime + timezoneOffset
      endTime = scope.currentDate.setHours(23,59,59,0)
      endTime = endTime + timezoneOffset

      this.call('reportGraph', Meteor.userId(), startTime, endTime, key, (error, data) => {
        if (!data) {
          this.$scope.reportTodayData = false
        } else if (!error && data) {
          this.$scope.reportTodayData = true
          this.renderStats(keys, Meteor.userId(), startTime, endTime);
          chart(this, this.$window, data, startTime - timezoneOffset, endTime - timezoneOffset)
          //renderGraph(this.$scope, data, $window, startTime, endTime, $rootScope.reportDatesMarked);
        }
      })
    }
  }

  autorunDevice($rootScope, $scope, $state) {

    if (Meteor.isCordova) {
      $state.bleDriverInfo($state)
    }

    $scope.doRefresh = () => {
      $rootScope.battRSSIflag = true
      $state.loadingFlagInfo.set(true)
      $state.updateInfoFlag = true
      $state.updateInfoHoldFlag = false
      if (Meteor.isCordova) {
        $state.bleDriverInfo($state)
      }
    }

    $scope.newReport  = () => {
      $rootScope.battRSSIflag = true
      $state.loadingFlagInfo.set(true)
      $state.deviceReadyValue.set(false)
      $state.loaderMessageInfoValue.set("(1/6) Device is syncing with app. Do not interrupt")
      $state.updateInfoFlag = true
      $state.updateInfoHoldFlag = false
      if (Meteor.isCordova) {
        $state.bleDriverInfo($state)
      }
    }
  }

  updateDay(val){
    this.$scope.currentDate = val;
    this.$scope.reportTodayData = false
    console.log('updateDay - deviceRefresh')
    this.deviceRefresh(this.$rootScope)
    //this.journalDateService.currentDate = this.$scope.currentDate;
  }

  previousDay() {
    this.$scope.currentDate = new Date(this.$scope.currentDate.setDate(this.$scope.currentDate.getDate() - 1));
    this.$scope.reportTodayData = false
    console.log('previousDay - deviceRefresh')
    this.deviceRefresh(this.$rootScope)
    //this.journalDateService.currentDate = this.$scope.currentDate;
  }

  nextDay() {
    this.$scope.currentDate = new Date(this.$scope.currentDate.setDate(this.$scope.currentDate.getDate() + 1));
    this.$scope.reportTodayData = false
    console.log('nextDay - deviceRefresh')
    this.deviceRefresh(this.$rootScope)
    //this.journalDateService.currentDate = this.$scope.currentDate;
  }

  deviceRefresh($rootScope) {

    $rootScope.currentScope.this.showReportLoader = true

    scope = $rootScope.currentScope

    currentDateUTC = new Date()
    timezoneOffset = currentDateUTC.getTimezoneOffset() * 60.0 * 1000.0

    startTime = scope.currentDate.setHours(0,0,0,0)
    startTime = startTime + timezoneOffset
    endTime = scope.currentDate.setHours(23,59,59,0)
    endTime = endTime + timezoneOffset

    scope.this.call('reportDataPoints', Meteor.userId(), startTime, endTime, (error, data) => {

      if (!error && data) {

        scope.reportTodayData = true

        keys = {}

        keys['s1'] = Object.keys(data)[5]
        keys['s2'] = Object.keys(data)[6]
        keys['s3'] = Object.keys(data)[7]
        keys['s4'] = Object.keys(data)[8]

        scope.keys = keys

        keysShort = {}

        ind = keys['s1'].indexOf("(");
        keysShort['s1'] = keys['s1'].substring(0, ind)

        ind = keys['s2'].indexOf("(");
        keysShort['s2'] = keys['s2'].substring(0, ind)

        ind = keys['s3'].indexOf("(");
        keysShort['s3'] = keys['s3'].substring(0, ind)

        ind = keys['s4'].indexOf("(");
        keysShort['s4'] = keys['s4'].substring(0, ind)

        scope.keysShort = keysShort

        scope.this.renderStats(keys, Meteor.userId(), startTime, endTime);

        scope.this.call('reportGraph', Meteor.userId(), startTime, endTime, scope.key, (error, data) => {

              if (!error && data.length > 1) {

                var cleanData = data.filter(function (obj) {
                  return obj.date !== 0;
                });

                let dates  = cleanData.map(function(v) {
                  return v.date;
                });
                scope.startTime = Math.max.apply( null, dates );

                if (cleanData.length !== 0) {
                  scope.reportTodayData = true
                  scope.this.showReportLoader = false
                  scope.this.$scope.$apply();
                  chart(scope.this, scope.this.$window, data, startTime - timezoneOffset, endTime - timezoneOffset)
                  //renderGraph(scope, data, this.$window, startTime, endTime, $rootScope.reportDatesMarked);
                  scope.this.renderStats(scope.keys, Meteor.userId(), startTime, endTime);
                } else {
                  scope.reportTodayData = false
                }
              }

            }
        );

      }
    })
  }

  /*
  recordByDay($rootScope) {
    this.call('reportDataDates', Meteor.userId(), (error, data) => {

          if (!error && data.length > 0) {

            $rootScope.reportDatesMarked = []
            for(var i = 0; i < data.length; i++){
                var obj = {};
                obj['d'] = new Date(data[i]['_id'])
                obj['d'] = new Date(obj['d'].setDate(obj['d'].getDate() + 1))
                obj['color'] = '#34db77'
                $rootScope.reportDatesMarked.push(obj)
            }
          }
    });
  }
  */

  renderStats(keys, id, startTime=undefined, endTime=undefined) {

    this.call('reportStats', id, startTime, endTime, keys, (error, res) => {

      if(!error && res.length > 0) {

        this.$scope.stats = res[0];

        this.$scope.average =  res[0].average[this.$scope.label];
        this.$scope.stdDev =  res[0].stdDev[this.$scope.label];
        this.$scope.maximum =  res[0].maximum[this.$scope.label];
        this.$scope.minimum =  res[0].minimum[this.$scope.label];
        this.$scope.cv = this.$scope.renderCV(this.$scope.label);

      }
    });
  }

  bleDriverInfo($state) {

    console.log("bleDriverInfo")

    r_state = $state

    // connect
    r_state.bluetoothService.manageConnection(
      r_state.device.deviceAddress,
      function() {

          r_state.bluetoothService.readRSSI(
            r_state.device.deviceAddress,
            function(rssiValue) {
              r_state.rssiValue.set(rssiValue.toString() + " dBm")
            }
          );

          //r_state.bluetoothService.write(r_state.device.deviceAddress, "battstatus");

          if (r_state.loadingFlagInfo.get() === true) {

            //console.log("START TIMEOUT")

              Meteor.setTimeout(function(){

                //console.log("timeout")

                if (r_state.criticalError !== false) {

                  //console.log("here")
                  //console.log(r_state.device.deviceAddress)

                  r_state.bluetoothService.disconnect(r_state.device.deviceAddress)

                  Dialogs.alert(
                    "We have enountered a problem communicating with your device. Please try again. If the problem persists please contact pr@enlisense.com.",
                    "Error",
                    "OK").then(function() {
                      document.location.reload(true)
                    })

                }

              }, 220000);
          }

        r_state.bluetoothService.subscribe(
          r_state.device.deviceAddress,
          function(results) {

            if (r_state.updateInfoFlag === true) {

              r_state.updateInfoFlag = false
              r_state.updateInfoHoldFlag = true
              r_state.bluetoothService.write(r_state.device.deviceAddress, ":update");


            } /* else if (r_state.updateInfoHoldFlag !== true) {

              r_state.bluetoothService.readRSSI(
                r_state.device.deviceAddress,
                function(rssiValue) {
                  r_state.rssiValue.set(rssiValue.toString() + " dBm")
                }
              );
              r_state.bluetoothService.write(r_state.device.deviceAddress, "battstatus");

            }
            */

            r_state.bleReaderInfo(r_state, results)

          }
        )
      }
    )
  }


  bleReaderInfo($state, data){

    r_state = $state

    console.log(data)

    if (data.includes("%")){
      //console.log(uncodedData);
      console.log('battery update');
      console.log(data);
      r_state.batteryLevel.set(data)

    } else if (data.includes("dataOK") && r_state.dataOkayFlag == true) {

      r_state.loaderMessageInfoValue.set("(2/6) Data has been recieved - processing")

      dArray = r_state.deviceDataInfo.split('\n')
      deviceDataInfo = []

      for(i = 0; i < dArray.length; i++ ) {
        if (dArray[i] !== '' && !dArray[i].includes("v") && !dArray[i].includes("%") && !dArray[i].includes("kB") && !dArray[i].includes(":")) {
          deviceDataInfo.push(dArray[i])
        }
      }

      /*
      if (deviceDataInfo[1].includes("128kB")) {
        r_state.deviceSpaceValue.set(deviceDataInfo[1].trim().replace(',',''));
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
        headerID = r_state.device.name + " " + r_state.device.deviceName + " "  + r_state.device.sensorID
        Meteor.call('currentReport', headerID, function(error, currentReport) {

          if (error) {
            console.log("currentReport error")
            consolge.log(error)
          } else {

            console.log("currentReport success")

            Meteor.setTimeout(() => {

              if (!currentReport) {

                var rawData = JSON.parse(JSON.stringify(deviceDataInfo))
                rawData = [r_state.device.header].concat(rawData)
                rawData.push("dataOK")
                rawData.push(Date.now())
                rawData.push(new Date())

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

                deviceDataInfoPrep = [r_state.device.header].concat(deviceDataInfo)
                deviceDataInfoPrep.push("dataOK")

                Reports.insert({
                  owner: Meteor.userId(),
                  header: r_state.device.name + " " + r_state.device.deviceName + " "  + r_state.device.sensorID,
                  hasOutput: false,
                  device: r_state.device,
                  data: deviceDataInfoPrep,
                  rawData: [rawData],
                  filename: null,
                  archive: false,
                  entryTimestamp: new Date()
                })

                deviceDataInfo = []
                r_state.bluetoothService.write(r_state.device.deviceAddress, "erase");
                r_state.loaderMessageInfoValue.set("(3/6) Erasing device data \n(erase command)")


              } else {

                if (currentReport.rawData) {
                  var rawData = JSON.parse(JSON.stringify(currentReport.rawData))
                  var deviceDataInfoTmp = JSON.parse(JSON.stringify(deviceDataInfo))
                  rawDataPrep = [r_state.device.header].concat(deviceDataInfoTmp)
                  rawDataPrep.push("dataOK")
                  rawDataPrep.push(Date.now())
                  rawDataPrep.push(new Date())
                  rawData.push(rawDataPrep)
                } else {
                  rawDataPrep = JSON.parse(JSON.stringify([r_state.device.header].concat(deviceDataInfo)))
                  rawDataPrep.push("dataOK")
                  rawDataPrep.push(Date.now())
                  rawDataPrep.push(new Date())
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
                    array[0] = parseInt(array[0]) + maxSeconds + 180
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

                //deviceDataInfoPrep = [r_state.device.header].concat(a)
                a.push("dataOK")

                Reports.update({'_id':currentReport._id},{$set:{'data': a, 'rawData': rawData}})
              }

              deviceDataInfo = []
              r_state.bluetoothService.write(r_state.device.deviceAddress, "erase");
              r_state.loaderMessageInfoValue.set("(3/6) Erasing device data \n(erase command)")
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

      r_state.bluetoothService.write(r_state.device.deviceAddress, r_state.device.header);
      r_state.loaderMessageInfoValue.set("(4/6) Data transfer complete. Reactivating Device")

    } else if (data.includes("headerOK")) {

      r_state.dataOkayFlag = false;
      r_state.bluetoothService.write(r_state.device.deviceAddress, ":update");
      r_state.loaderMessageInfoValue.set("(5/6) Device activated and Sync complete")

    } else if (data.includes("dataOK") && r_state.dataOkayFlag == false) {

      r_state.deviceReadyValue.set(true)
      r_state.deviceSpaceValue.set("0/128kB");
      r_state.dataOkayFlag = true
      r_state.updateInfoHoldFlag = false

      r_state.loadingFlagInfo.set(false)
      r_state.deviceDataInfo = []

      r_state.bluetoothService.disconnect(r_state.device.deviceAddress);

      r_state.criticalError = false

      r_state.s3sync()

    } else {

      td1 = data.replace(/[\u0000\u0001\r]/g, '')
      td2 = td1.replace(/;\s*/g, '\n')
      td3 = td2.replace(/ÿ\s*/g, '\n')
      td4 = td3.replace(/[\r]+/g, '');
      r_state.deviceDataInfo = r_state.deviceDataInfo + '' + td4

      /*
      console.log("Not handled!");
      console.log(data);
      */

    }
  }
}


const name = 'report';

// create a module
export default angular.module(name, [
  angularMeteor,
  ReportDatePicker
]).component(name, { template, controllerAs: name, controller: Report})
    .config(config);
