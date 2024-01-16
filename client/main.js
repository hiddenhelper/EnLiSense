import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import { name as Main } from '../imports/ui/components/main/main';
import VirtualScreen from '../imports/lib/utils/VirtualScreen';

import '../imports/startup/client/subscriptions';

/*
Push.Configure({
  android: {
    senderID: 123456789,
    alert: true,
    badge: true,
    sound: false,
    vibrate: true,
    clearNotifications: true
    // icon: '',
    // iconColor: ''
  },
  ios: {
    alert: true,
    badge: true,
    sound: false
  }
});
*/

function onReady() {
  angular.bootstrap(document, [
    Main
  ], {
    strictDi: true
  });
  const virtualScreen = new VirtualScreen();
  virtualScreen.observe();

}

if (Meteor.isCordova) {

  angular.element(document).on('deviceready', onReady);

} else {

  angular.element(document).ready(onReady);

}
