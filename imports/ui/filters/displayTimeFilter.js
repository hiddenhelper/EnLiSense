import angular from 'angular';

const name = 'displayTimeFilter';

function DisplayTimeFilter(date) {

  if (!date) {
    return '';
  }

  if (!(date instanceof Date)) {
    return '';
  }

  let dateMinutes = date.getMinutes()
  let mid='AM';
  let timeHours = date.getHours()
  timeHours = (timeHours+24)%24;

  if (timeHours >= 12) {
    timeHours=timeHours%12;
    mid='PM';
  }

  if(timeHours == 0){
    timeHours = 12;
  }

  if (dateMinutes < 10) {
    dateMinutes = '0' + dateMinutes
  }

  return timeHours + ':' + dateMinutes + ' ' + mid;
}

// create a module
export default angular.module(name, [])
  .filter(name, () => {
    return DisplayTimeFilter;
  });
