import { Meteor } from 'meteor/meteor';
import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './reportDatePicker.html';
import { name as DisplayDateFilter } from '../../filters/displayDateFilter';


class ReportDatePicker {
  constructor($rootScope, $scope, $reactive){

    'ngInject';

    $reactive(this).attach($scope);

    this.recordByDay($rootScope)

    reportDatePickerThis = this

    this.reportCalendarSettings = {
      theme: 'ios',
      display: 'bottom',
      setOnDayTap: true,
      buttons: ['cancel'],
      onDayChange: function (event, inst) {
        $rootScope.$broadcast("calendar-date", event);
      },
      onBeforeShow: function (event, inst) {
        reportDatePickerThis.recordByDay($rootScope, inst)
        inst.settings.marked = $rootScope.reportDatesMarked
        inst.redraw();
      }
    }
  }

  recordByDay($rootScope, inst) {

    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    this.call('reportDataDates', Meteor.userId(), timezone, (error, data) => {

          if (!error && data.length > 0) {

            $rootScope.reportDatesMarked = []
            for(var i = 0; i < data.length; i++){
                var obj = {};
                obj['d'] = new Date(data[i]['_id'])
                obj['d'] = new Date(obj['d'].setDate(obj['d'].getDate() + 1))
                obj['color'] = '#34db77'
                $rootScope.reportDatesMarked.push(obj)
            }

          }
    });
  }
}

const name = 'reportDatePicker';

// create a module
export default angular.module(name, [
  angularMeteor,
  DisplayDateFilter,
  'mobiscroll-calendar'
]).component(name, {
  template,
  controllerAs: name,
  controller: ReportDatePicker,
  bindings: {
    today: "=",
    previous: '&',
    next: '&'
  }
});
