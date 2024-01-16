import { Meteor } from 'meteor/meteor';
import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './journalDatePicker.html';
import { name as DisplayDateFilter } from '../../filters/displayDateFilter';

class JournalDatePicker {
  constructor($rootScope, $scope, $reactive) {

    'ngInject';

    $reactive(this).attach($scope);

    this.recordByDay($rootScope)

    journalDatePickerThis = this

    this.journalCalendarSettings = {
      theme: 'ios',
      display: 'bottom',
      setOnDayTap: true,
      buttons: ['cancel'],
      onDayChange: function (event, inst) {
        $rootScope.$broadcast("calendar-date", event);
        var selectedDate = new Date(event.date);
        journalDatePickerThis.update({val: selectedDate});
      },
      onBeforeShow: function (event, inst) {
        journalDatePickerThis.recordByDay($rootScope)
        inst.settings.marked = $rootScope.journalDatesMarked
        inst.redraw();
      }
    }
  }



  recordByDay($rootScope) {

    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    this.call('journalDataDates', Meteor.userId(), timezone, (error, data) => {

      if (!error && data.length > 0) {

        $rootScope.journalDatesMarked = []
        for (var i = 0; i < data.length; i++) {
          var obj = {};
          obj['d'] = new Date(data[i]['_id'])
          obj['d'] = new Date(obj['d'].setDate(obj['d'].getDate() + 1))
          obj['color'] = '#34db77'
          $rootScope.journalDatesMarked.push(obj)
        }
      }
    });
  }
}

const name = 'journalDatePicker';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  'mobiscroll-calendar'
]).component(name, {
  template,
  controllerAs: name,
  controller: JournalDatePicker,
  bindings: {
    today: "=",
    previous: '&',
    next: '&',
    update: '&'
  }
});
