import angular from 'angular';
import angularMeteor from 'angular-meteor';

import itemAddTab from './itemAddTab.html';
import itemAddModal from './itemAddModal.html';

class ItemAddTab {
  constructor($mdDialog, $mdMedia, $state) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.$mdMedia = $mdMedia;
    this.$state = $state;

  }

  open(event) {
    this.$mdDialog.show({
      controller($scope, $mdDialog, $state, viewService) {
        'ngInject';

        this.$state = $state;
        this.viewService = viewService;

        this.close = () => {
          $mdDialog.hide();
        }
      },
      controllerAs: 'itemAddModal',
      controller: function($scope, $mdDialog, $state, viewService) {
        'ngInject';

        $scope.done = () => {
          $mdDialog.hide();
        }

        $scope.viewHandler = (route, type) => {
          // forward, back, enter, exit, swap
          viewService.nextDirection = 'forward';

          // hide modal
          $mdDialog.hide();

          // Grab the last view info & transition back
          $state.go(route, {'type': type});
        }
      },
      template: itemAddModal,
      targetEvent: event,
      parent: angular.element(document.body),
      clickOutsideToClose: false,
      fullscreen: false,
      cssClass: './itemAddTab.less'
    });
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

const name = 'itemAddTab';

// create a module
export default angular.module(name, [
  angularMeteor
]).component(name, {
  template: itemAddTab,
  controllerAs: name,
  controller: ItemAddTab
});
