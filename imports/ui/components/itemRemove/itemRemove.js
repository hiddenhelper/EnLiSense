import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './itemRemove.html';
import { Items } from '../../../api/items';

class ItemRemove {

  constructor($scope, $reactive, $window){
    'ngInject';

    $reactive(this).attach($scope);

    this.$window = $window;
  }

  action() {

    if (this.item) {
      Items.remove(this.item._id);
    }

    this.goBack();
  }

  goBack() {
    this.$window.history.back();
  }
}

const name = 'itemRemove';

// create a module
export default angular.module(name, [
  angularMeteor
]).component(name, {
  template,
  controllerAs: name,
  controller: ItemRemove,
  bindings: {
    item: '<'
  }
});
