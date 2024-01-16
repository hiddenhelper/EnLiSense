import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './connectionWarning.html';

class ConnectionWarning {

  constructor($rootScope, $scope, $reactive) {
    'ngInject';

    $reactive(this).attach($scope);

    this.warningShowing = false;
    this.showOnce = false;
    this.test = false;
    this.first = true;

    this.helpers({
      connection() {
        return Meteor.status();
      }
    });

    this.autorun(() => {

      this.getReactively('connection');

      if (this.connection.connected === false) {
        //this.showOnce = true;
        this.show();
      }

    });

  }

  show() {
    this.warningShowing = true;

    let delay = 5000;
    Meteor.setTimeout(function(){
      $('.animate-if').click();
    }, delay);
  }

  hide() {
    this.warningShowing = false;
  }

}

const name = 'connectionWarning';

// create a module
export default angular.module(name, [
  angularMeteor,
]).component(name, {
  template: template,
  controllerAs: name,
  controller: ConnectionWarning
});
