import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './currentDateDisplay.html';

import { name as DisplayDateFilter } from '../../filters/displayDateFilter';


class CurrentDateDisplay {
  constructor(){
    this.calendarSettings = {
      theme: 'ios',
      display: 'bottom',
      setOnDayTap: true,
      buttons: ['cancel']
    }
  }
}

const name = 'currentDateDisplay';

// create a module
export default angular.module(name, [
  angularMeteor,
  'mobiscroll-calendar',
  DisplayDateFilter
]).component(name, {
  template,
  controllerAs: name,
  controller: CurrentDateDisplay,
  bindings: {
    today: "=",
    previous: '&',
    next: '&'
  }
});
