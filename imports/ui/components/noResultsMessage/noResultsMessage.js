import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './noResultsMessage.html';

class NoResultsMessage {
  constructor($scope, $reactive, $rootScope) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$rootScope = $rootScope;

  }

  viewSample() {
    let th = this;
    Meteor.call('sampleInsights',function(err, val){
      if (err) {
        console.debug(err);
      }
      th.$rootScope.$broadcast("sample-insights-created");
    });

  };
}

const name = 'noResultsMessage';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: NoResultsMessage
});
