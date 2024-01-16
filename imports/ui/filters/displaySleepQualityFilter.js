import angular from 'angular';

const name = 'displaySleepQualityFilter';

function DisplaySleepQualityFilter(quality) {
  if (!quality) {
    return '';
  }

  qualityString = '';

  switch (parseInt(quality)) {
      case 0:
          qualityString = "Poor";
          break;
      case 1:
          qualityString = "Poor";
          break;
      case 2:
          qualityString = "Poor";
          break;
      case 3:
          qualityString = "Poor";
          break;
      case 4:
          qualityString = "Average";
          break;
      case 5:
          qualityString = "Average";
          break;
      case 6:
          qualityString = "Average";
          break;
      case 7:
          qualityString = "Good";
          break;
      case 8:
          qualityString = "Great";
          break;
      case 9:
          qualityString = "Great";
          break;
      case 10:
          qualityString = "Perfect";
          break;
  }

  return qualityString;
}

// create a module
export default angular.module(name, [])
  .filter(name, () => {
    return DisplaySleepQualityFilter;
  });
