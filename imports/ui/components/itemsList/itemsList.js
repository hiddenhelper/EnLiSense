import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './itemsList.html';
import { Items } from '../../../api/items';
import { Entries } from '../../../api/entries';
import { name as JournalDatePicker } from '../journalDatePicker/journalDatePicker';
import { name as DisplayTimeFilter } from '../../filters/displayTimeFilter';
import { name as DisplaySleepQualityFilter } from '../../filters/displaySleepQualityFilter';
import { name as DisplayHourFilter } from '../../filters/displayHourFilter';

class ItemsList {

  constructor($scope, $reactive, $state, journalDateService, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    // $scope.currentDate = new Date();
    $scope.currentDate = journalDateService.currentDate;
    this.journalDateService = journalDateService;
    this.$scope = $scope;
    this.$state = $state;
    this.viewService = viewService;
    this.childrenIds = [];

    $scope.$on("today-button-click", function (val, date) {
      $scope.currentDate = date;
    });

    this.subscribe('items');

    this.helpers({
      items() {

        lower_bound = new Date($scope.getReactively('currentDate'));
        upper_bound = new Date($scope.getReactively('currentDate'));

        return Items.find({
          entryTimestamp: {
            $gt: new Date((new Date(lower_bound.setDate(lower_bound.getDate()))).setHours(0, 0, 0, 0)),
            $lt: new Date((new Date(upper_bound.setDate(upper_bound.getDate() + 1))).setHours(0, 0, 0, 0))
          }
        }, {
          sort: {
            'entryTimestamp': 1
          }
        });
      },
      children() {

        this.getReactively('items');
        if (this.items) {
          for (i in this.items) {
            if (this.items[i].selected) {
              this.childrenIds = _.union(this.childrenIds, this.items[i].selected.map(function (p) { return p._id }));
            }
          }
        } else {
          this.childrenIds = [];
        }

        return Entries.find({ _id: { $in: this.childrenIds } }, { fields: { '_id': 1, 'label': 1, 'brand': 1 } });
      }
    });

    // join items and children
    this.autorun(() => {

      this.getReactively('children');
      if (this.children) {
        t = this;
        this.joinedItems = this.items.map(function (cur) {
          cur.children = _.values(_.extend(_.indexBy(cur.children, '_id'), _.indexBy(t.children, '_id')));
          return cur;
        });
      }
    });

  }

  updateDay(val) {
    this.$scope.currentDate = val;
    this.journalDateService.currentDate = this.$scope.currentDate;
  }

  previousDay() {
    this.$scope.currentDate = new Date(this.$scope.currentDate.setDate(this.$scope.currentDate.getDate() - 1));
    this.journalDateService.currentDate = this.$scope.currentDate;
  }

  nextDay() {
    this.$scope.currentDate = new Date(this.$scope.currentDate.setDate(this.$scope.currentDate.getDate() + 1));
    this.journalDateService.currentDate = this.$scope.currentDate;
  }

  viewHandler(route, params) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

}

const name = 'itemsList';

// create a module
export default angular.module(name, [
  angularMeteor,
  JournalDatePicker,
  DisplayTimeFilter,
  DisplaySleepQualityFilter,
  DisplayHourFilter
]).component(name, {
  template: template,
  controllerAs: name,
  controller: ItemsList,
  bindings: {
    currentDate: '='
  }
});
