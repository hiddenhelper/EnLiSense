import angular from 'angular';
import angularMeteor from 'angular-meteor';
import tabs from './tabs.html';
import { name as ItemAddTab } from '../itemAddTab/itemAddTab';

class Tabs {
  constructor($scope, $reactive) {
    'ngInject';

    $reactive(this).attach($scope);


  }
}

const name = 'tabs';

// create a module
export default angular.module(name, [
  angularMeteor,
  ItemAddTab
]).component(name, {
  template: tabs,
  controllerAs: name,
  controller: Tabs
});
