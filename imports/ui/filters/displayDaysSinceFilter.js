import angular from 'angular';

const name = 'displayDaysSinceFilter';

function DisplayDaysSinceFilter(date) {
  if (!date) {
    return '';
  }

  if (!(date instanceof Date)) {
    return '';
  }

  return date_diff_indays(date,new Date());
}

var date_diff_indays = function(date1, date2) {
  dt1 = new Date(date1);
  dt2 = new Date(date2);
  return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
}

// create a module
export default angular.module(name, [])
  .filter(name, () => {
    return DisplayDaysSinceFilter;
  });
