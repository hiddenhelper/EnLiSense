import _ from 'underscore';
import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import ngSanitize from 'angular-sanitize';
import uiRouter from 'angular-ui-router';
import { Meteor } from 'meteor/meteor';
import 'ionic-sdk/release/js/ionic';
import 'ionic-sdk/release/js/ionic-angular';
import 'ionic-sdk/release/css/ionic.css';
import 'ng-cordova';

import webTemplate from './web.html';
import mobileTemplate from './mobile.html';

import { name as Home } from '../home/home';
import { name as Journal } from '../journal/journal';
import { name as PasswordReset } from '../passwordReset/passwordReset';
import { name as InsightsList } from '../insightsList/insightsList';
import { name as Search } from '../search/search';
import { name as More } from '../more/more';
import { name as Tabs } from '../tabs/tabs';
import { name as Auth } from '../auth/auth';
import { name as Report } from '../report/report';
import { name as SymptomsList } from '../symptomsList/symptomsList';
import { name as MoodsList } from '../moodsList/moodsList';
import { name as SleepItem } from '../sleepItem/sleepItem';
import { name as VitalsItem } from '../vitalsItem/vitalsItem';

import { name as DeviceAdd } from '../deviceAdd/deviceAdd';
import { name as DeviceDetails } from '../deviceDetails/deviceDetails';
//import { name as DeviceInformation } from '../deviceInformation/deviceInformation';
import { name as DevicesList } from '../devicesList/devicesList';

import { name as BluetoothList } from '../bluetoothList/bluetoothList';

import { name as EntriesItem} from '../entriesItem/entriesItem';
import { name as EntriesSearch} from '../entriesSearch/entriesSearch';
import { name as EntryAdd } from '../entryAdd/entryAdd';
import { name as EntryDetails } from '../entryDetails/entryDetails';
import { name as EntryProfile } from '../entryProfile/entryProfile';
import { name as OfflineMessage } from '../offlineMessage/offlineMessage';
import { name as NoResultsMessage } from '../noResultsMessage/noResultsMessage';

import { name as ViewService } from '../../services/viewService';
import { name as JournalDateService } from '../../services/journalDateService';
import { name as CategoriesService } from '../../services/categoriesService';
import { name as ViewCacheService } from '../../services/viewCacheService';
import { name as BluetoothService } from '../../services/bluetoothService';

import { name as MySupport } from '../mySupport/mySupport';
import { name as Clinician } from '../clinician/clinician';
import { name as UserFeedback } from '../userFeedback/userFeedback';

//import { BluetoothController } from 'ionic-native';

import { Profiles } from '../../../api/profiles';

class Main {

  constructor($scope, $reactive, $state, $window, $location, $rootScope, viewService, $ionicViewSwitcher){
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.$window = $window;
    this.$location = $location;
    this.$ionicViewSwitcher = $ionicViewSwitcher;
    this.viewService = viewService;

    $rootScope.footerIsVisible = true;
    $rootScope.last = '/home';
    this.$rootScope = $rootScope;

    if ($location.path() === '/login') {
      $rootScope.footerIsVisible = false;
    }

    if (Meteor.isCordova) {
      Meteor.startup(() => {

        ble.isEnabled(
            function() {
                console.log("Bluetooth is enabled");
            },
            function() {
                console.log("Bluetooth is *not* enabled");
            }
        );

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

        this.call('journalDataDates', Meteor.userId(), timezone, (error, data) => {

              if (!error && data.length > 0) {

                $rootScope.journalDatesMarked = []
                for(var i = 0; i < data.length; i++){
                    var obj = {};
                    obj['d'] = new Date(data[i]['_id'])
                    obj['d'] = new Date(obj['d'].setDate(obj['d'].getDate() + 1))
                    obj['color'] = '#34db77'
                    $rootScope.journalDatesMarked.push(obj)
                }
              }
        });

        this.$state.go("login")
      })
    }


  }

}

const name = 'main';
const template = Meteor.isCordova ? mobileTemplate : webTemplate;
//const template = mobileTemplate;

// the footer (tabs) will be visible for these
const footerList = [
  '/reports',
  '/mySupport',
  '/more',
  '/journal',
  '/home'
]

// create a module
export default angular.module(name, [
  angularMeteor,
  ngMaterial,
  ngSanitize,
  uiRouter,
  Auth,
  Home,
  Journal,
  Home,
  MySupport,
  Clinician,
  PasswordReset,
  InsightsList,
  Search,
  More,
  Tabs,
  Report,
  SymptomsList,
  EntriesItem,
  EntriesSearch,
  EntryAdd,
  EntryDetails,
  EntryProfile,
  DeviceAdd,
  DeviceDetails,
  DevicesList,
  BluetoothList,
  MoodsList,
  SleepItem,
  VitalsItem,
  ViewService,
  JournalDateService,
  CategoriesService,
  ViewCacheService,
  BluetoothService,
  OfflineMessage,
  NoResultsMessage,
  'accounts.ui',
  'ionic',
  'ngCordova'
]).component(name, {
  template,
  controllerAs: name,
  controller: Main
})
  .config(config)
  .run(run);

function config($locationProvider, $urlRouterProvider, $ionicConfigProvider ) {
  'ngInject';

  $locationProvider.html5Mode(true);

  $urlRouterProvider.otherwise('/login');
  // $ionicConfigProvider.views.transition('none');
}


// This function is used to create an index for the tabs
function dictionaryMap(route) {
  if (route === '/journal') {
    return 0;
  } else if (route === '/mySupport') {
    return 1;
  } else if (route === '/reports') {
    return 2;
  } else if (route === '/more') {
    return 3;
  } else {
    return -1;
  }
}

function run($rootScope, $state, $ionicNavBarDelegate, $ionicViewSwitcher, viewService) {
  'ngInject';

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if (Meteor.isClient) {
      analytics.track('view change: ' + toState.name);
    }
  });


  $rootScope.$on('$stateChangeStart',
    (event, toState, toParams, fromState, fromParams, options) => {

      if (!Meteor.isCordova && toState.url.substring(0,14) !== '/passwordReset') {
        event.preventDefault();
        $state.go('passwordReset');
      }


      $ionicNavBarDelegate.showBackButton(true);

      if (_.contains(footerList, toState.url) === true) {
        $rootScope.footerIsVisible = true;
      } else {
        $rootScope.footerIsVisible = false;
      }

      let toDict = dictionaryMap(toState.url);
      let fromDict = dictionaryMap(fromState.url);


      if (toState.url === '/entryProfile') {
        viewService.tabForDirection = "search";
      } else if (toDict !== -1) {
        viewService.tabForDirection = toState.url.replace("/", "");
      }


      if (viewService.nextDirection) {
        $ionicViewSwitcher.nextDirection(viewService.nextDirection);
        viewService.nextDirection = undefined;
      } else if (fromDict < toDict) {
        $ionicViewSwitcher.nextDirection("forward");
      } else {
        $ionicViewSwitcher.nextDirection("back");
      }

    }
  );

  $rootScope.$on('$stateChangeError',
    (event, toState, toParams, fromState, fromParams, error) => {

      if (error === 'AUTH_REQUIRED' ) {
        $state.go('login');
      } else {
        $state.go('home');
      }

    }
  );

  document.addEventListener("pause", function(){
    Accounts.logout();
  }, false);

  document.addEventListener("resume", function(){
    viewService.nextDirection = 'back';

    $state.go('login');
  }, false);
}
