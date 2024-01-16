import angular from 'angular';
import angularMeteor from 'angular-meteor';
//import {Geolocation} from 'ionic-native';

const name = 'viewService';

function ViewService() {
  'ngInject';

  tabForDirection = undefined;
  nextDirection = undefined;
  searchTerm = undefined;
  profileImage = undefined;

  // http://www.perbang.dk/rgbgradient/
  gradientColors = {
    1:"#34DB75",
    2:"#34DB47",
    3:"#4EDB34",
    4:"#7CDB34",
    5:"#AADB34",
    6:"#D9DB34",
    7:"#DBAE34",
    8:"#DB8034",
    9:"#DB5234",
    10:"#DB3443"
  }

  numToWeek = {
    0:"Sun",
    1:"Mon",
    2:"Tue",
    3:"Wed",
    4:"Thu",
    5:"Fri",
    6:"Sat"
  }

  numToMonth = {
    0:"Sun",
    1:"Mon",
    2:"Tue",
    3:"Wed",
    4:"Thu",
    5:"Fri",
    6:"Sat"
  }

  numToMonth = {
    0:"Jan",
    1:"Feb",
    2:"Mar",
    3:"Apr",
    4:"May",
    5:"Jun",
    6:"July",
    7:"Aug",
    8:"Sep",
    9:"Oct",
    10:"Nov",
    11:"Dec"
  }

  function getAverageRGB(base64img) {

      var blockSize = 5, // only visit every 5 pixels
          defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
          canvas = document.createElement('canvas'),
          context = canvas.getContext && canvas.getContext('2d'),
          data, width, height,
          i = -4,
          length,
          rgb = {r:0,g:0,b:0},
          count = 0;

      if (!context) {
          return defaultRGB;
      }

      height = canvas.height = 200;
      width = canvas.width = 150

      var image = new Image();
      image.src = base64img;
      context.drawImage(image, 0, 0);

      try {
          data = context.getImageData(0, 0, width, height);
      } catch(e) {
          /* security error, img on diff domain */alert('x');
          return defaultRGB;
      }

      length = data.data.length;

      while ( (i += blockSize * 4) < length ) {
          ++count;

          rgb.r += data.data[i];
          rgb.g += data.data[i+1];
          rgb.b += data.data[i+2];
      }

      // ~~ used to floor values
      rgb.r = ~~(rgb.r/count);
      rgb.g = ~~(rgb.g/count);
      rgb.b = ~~(rgb.b/count);

      return rgb;

  }

  function trimInput(val) {
    return val.replace(/^\s*|\s*$/g, "");
  }

  function isAtLeastLengthN(val, n) {
     return val.length >= n ? true : false;
  }

  function isLessThanLengthN(val, n) {
     return val.length < n ? true : false;
  }

  function containsLowerCase(val) {
     return val.toLowerCase() != val;
  }

  function containsUpperCase(val, n) {
     return val.toUpperCase() != val;
  }

  function containsSpecialCharacter(val) {
     var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
     return format.test(val);
  }

  function isValidEmail(val) {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)) ? true : false
  }

  /*
  function geoLocation(cb) {
    if (Meteor.isCordova) {
      Geolocation.getCurrentPosition().then(pos => {
        cb({'lat': pos.coords.latitude,'long': pos.coords.longitude})
      }).catch((error) => {
        cb({'lat': 0.0,'long': 0.0})
      });
    } else {
      cb({'lat': 0.0,'long': 0.0})
    }
  }
  */

  return {
    nextDirection: nextDirection,
    tabForDirection: tabForDirection,
    searchTerm: searchTerm,
    profileImage: profileImage,
    gradientColors: gradientColors,
    numToWeek: numToWeek,
    numToMonth: numToMonth,
    getAverageRGB: getAverageRGB,
    trimInput: trimInput,
    isAtLeastLengthN: isAtLeastLengthN,
    isLessThanLengthN: isLessThanLengthN,
    isValidEmail: isValidEmail,
    containsLowerCase: containsLowerCase,
    containsUpperCase: containsUpperCase,
    containsSpecialCharacter: containsSpecialCharacter,
  };
}

// create a module
export default angular.module(name, [
    angularMeteor
])
  .service(name, ViewService);
