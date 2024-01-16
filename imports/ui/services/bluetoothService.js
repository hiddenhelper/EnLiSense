import angular from 'angular';
import angularMeteor from 'angular-meteor';

const name = 'bluetoothService';

function BluetoothService() {
  'ngInject';

    var bluefruit = {
      serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
      rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
    };

    function bytesToString(buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
    }

    function stringToBytes(string) {
        var array = new Uint8Array(string.length);
        for (var i = 0, l = string.length; i < l; i++) {
            array[i] = string.charCodeAt(i);
        }
        return array.buffer;
    }

    function disconnect(macAddress) {

      if (macAddress) {
        var disconnect = function () {
            // if connected, do this:
            ble.disconnect(
                macAddress,
                function(results) {
                  console.log("Disconnected from device: " + macAddress);
                  console.log(results);
                },
                showError
            );
        };
      } else {
        console.log("No macAddress")
      }
    }

    function refreshDeviceList(_callback) {
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        var scan = function() {
            // list the available BT ports:
            ble.scan([bluefruit.serviceUUID], 5,
              function(results) {
                _callback(JSON.stringify(results));
              }, showError
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function() {
            console.log("Bluetooth is not enabled.")
        }

         // check if Bluetooth is on:
        ble.isEnabled(
            scan,
            notEnabled
        );
    }

    /*
        Connects if not connected, and disconnects if connected:
    */
    function manageConnection(macAddress, _callback) {

      console.log('manageConnection');

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {

          console.log('attempt to connect');

            // attempt to connect:
            onConnect = function(peripheral) {
                _callback()
            };

            ble.connect(
              macAddress,
              onConnect,
              showError
            );
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            console.log("attempting to disconnect");
            // if connected, do this:
            ble.disconnect(
                macAddress,
                function(results) {
                  console.log(results);
                  bluetoothSerial.isConnected(disconnect, connect);
                },
                showError
            );
        };

        // here's the real action of the manageConnection function:
        if (macAddress) {
          ble.isConnected(macAddress, disconnect, connect);
        } else {
          console.log("No macAddress")
        }
    }

    function disconnect(macAddress, _callback) {
      if (macAddress) {
        ble.disconnect(
          macAddress,
          function(results) {
            console.log(results);
            _callback()
          },
          showError
        );
      } else {
        console.log("No macAddress")
      }
    }

    /*
        subscribes to a Bluetooth serial listener for newline
        and changes the button:
    */

    function subscribe(macAddress, _callback) {
      if (macAddress) {
        // subscribe for incoming data
        ble.startNotification(
          macAddress,
          bluefruit.serviceUUID,
          bluefruit.rxCharacteristic,
          function(results) {
            stringResults = bytesToString(results)
            _callback(stringResults)
          },
          showError
        );
      } else {
        console.log("No macAddress")
      }
    }

    /*
        unsubscribes from any Bluetooth serial listener and changes the button:
    */
    function unsubscribe(macAddress) {

      if (macAddress) {
        // unsubscribe from listening:
        ble.stopNotification(
          macAddress,
          bluefruit.serviceUUID,
          bluefruit.rxCharacteristic,
          function(results) {
            console.log(results)
          },
          showError
        );
      } else {
        console.log("No macAddress")
      }

    }


    function write(macAddress, message) {

      if (macAddress) {
        var encodedString = stringToBytes(message);

        ble.write(
          macAddress,
          bluefruit.serviceUUID,
          bluefruit.txCharacteristic,
          encodedString,
          function(results) {
            console.log("results")
            console.log(results);
          },
          showError
        );
      } else {
        console.log("No macAddress")
      }

    }

    function readRSSI(macAddress, _callback) {

      if (macAddress) {
        ble.readRSSI(
          macAddress,
          function(results) {
            console.log(results);
            _callback(results)
          },
          showError
        );
      } else {
        console.log("No macAddress")
      }
    }

    function buildHeader(device, profile) {

      try {

        // Clock
        header1 = Date.now().toString().substring(0,10);

        // Study ID
        //header2 = device.name.toString().substring(0,6)

        header2 = device.owner.substring(0,6)

        // Device Name
        header3 = device.deviceName.toString()

        // Gender
        if (profile.gender.includes("Male")) {
          header4 = "M"
        } else if (profile.gender.includes("Female")) {
          header4 = "F"
        } else {
          header4 = "O"
        }

        // Age
        header5 = Math.floor((new Date() - new Date(profile.birthdate).getTime()) / 3.15576e+10).toString()

        // Arm (Location)
        if (device.location.includes("Left")) {
          header6 = "L"
        } else {
          header6 = "R"
        }

        // Sensor ID from QR
        header7 = device.sensorID.toString()

        // Study ID
        header8 = 'X'
        header9 = device.sensor1.toString()
        header10 = device.sensor2.toString()
        header11 = device.sensor3.toString()
        header12 = device.sensor4.toString()
        header13 = header9 + "&" + header10 + "&" + header11 + "&" + header12

        // timestamp,Name,Device Name,gender,age,location,sensorID,Study ID,marker&marker&marker&marker, ;

        // old header
        header = ":" + header1 + ',' + header2 + "," + header3 + "," + header4 + "," + header5 + "," + header6 + "," + header7 + "," + header8 + "," + header13 + ",;"

        // new header
        //header = ":" + header1 + ',' + header2 + "," + header3 + "," + header4 + "," + header5 + "," + header6 + "," + header7 + "," + header13 + ",;"
        //console.log("header: " + header)

        return header

      } catch (e) {
        console.log("buildHeader: ERROR")
        console.log(e)
        return;
      }
    }

    /*
        appends @error to the message div:
    */
    function showError(error) {
        console.log(error);
    }


    return {
      refreshDeviceList: refreshDeviceList,
      disconnect: disconnect,
      manageConnection: manageConnection,
      subscribe: subscribe,
      unsubscribe: unsubscribe,
      showError: showError,
      write: write,
      buildHeader: buildHeader,
      readRSSI: readRSSI
    };

}

// create a module
export default angular.module(name, [
    angularMeteor
])
  .service(name, BluetoothService);
