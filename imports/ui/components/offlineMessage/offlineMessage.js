import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './offlineMessage.html';

class OfflineMessage {
  constructor($scope, $reactive) {
    'ngInject';

    $reactive(this).attach($scope);

  }

  tryAgain() {
    Meteor.reconnect();
  }
}

const name = 'offlineMessage';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: OfflineMessage
});
