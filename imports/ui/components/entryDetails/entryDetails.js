import _ from 'underscore';
import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { BarcodeScanner } from 'ionic-native';
import { Camera } from 'ionic-native';
import template from './entryDetails.html';

import { Entries } from '../../../api/entries';
// import { Images } from '../../../api/images';
import { name as StackEntryService } from '../../services/stackEntryService';



class EntryDetails {
  constructor($scope, $reactive, $window, $timeout, $stateParams, $state, $ionicListDelegate, stackEntryService, viewService, categoriesService) {
    'ngInject';

    $reactive(this).attach($scope);


    this.viewService = viewService;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$window = $window;
    this.$scope = $scope;
    this.stackEntryService = stackEntryService;
    this.$ionicListDelegate = $ionicListDelegate;
    this.type = $stateParams.type;
    this._id = $stateParams._id.trim();
    // $scope.confirmFlag = false;
    this.imageData = undefined;
    this.imgBackground = undefined;
    this.showLoader = true;


    this.selectScollerSettings = {
      theme: 'ios',
      display: 'bottom',
      minWidth: 200,
      data: categoriesService[this.type]
    };


    if (stackEntryService.stack[stackEntryService.stack.length-1].data.route === 'entryDetails' && $stateParams.dup === false) {

      // Create reference
      this.entryStack = this.updateChildren(stackEntryService.stack[stackEntryService.stack.length-1].data);

    } else {

      this.subscribe('entry');
      this.helpers({
        entry() {
          return Entries.findOne({
            _id: $stateParams._id
          });
        }
      });

      /*
      Note - When accessing this view this.entry sometimes returned undefined.
             It sounds like this is a common problem (https://dweldon.silvrback.com/guards).
             Client (minimongo) data is behind server (mongodb). Using autorun
             to trigger this.entryStack assignment once data is ready.
             "init" is so this only happens once,
      */
      let init = false;
      this.autorun(() => {
        this.getReactively('entry');

        // Hard copy incase user cancels -> we can rollback
        if (this.entry && init === false) {
          init = true;

          this.entryCopy = JSON.parse(JSON.stringify(this.entry));

          // add correct view to entry item
          this.entryCopy.route = 'entryDetails';

          // Temporary - Make this changable
          this.entryCopy.ownerDisplay = this.ownerDisplay(this.entryCopy.owner);

          // Add details object to stack
          stackEntryService.add(this.entryCopy, $stateParams);

          // Create reference
          this.entryStack = this.updateChildren(stackEntryService.stack[stackEntryService.stack.length-1].data);


        }
      });
    }

    /*
    this.subscribe('image', () => [{sort: {entryTimestamp: -1}, limit: 1},this.getReactively('_id')]);
    this.helpers({
      image() {
        return Images.find({itemId: this.getReactively('_id')},{sort: {entryTimestamp: -1}, limit: 1});
      }
    });


    this.autorun(() => {
      this.getReactively('image');
      if (this.image && this.image.length > 0 && this.image[0].imageData) {
        this.showloader = false;
        this.imageData = this.image[0].imageData;
        this.imgBackground = {"background":"#000000"}
      }
    });
    */

  }

  takePhoto() {

    t = this;

    if (Meteor.isCordova) {
      Meteor.startup(function() {

        this.cameraOptions = {
          quality: 100,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: 1,
          allowEdit: false,
          encodingType: Camera.EncodingType.PNG,
          targetWidth: 500,
          mediaType: 0,
          saveToPhotoAlbum: false
        };

        Camera.getPicture(this.cameraOptions).then((imageData) => {
          let base64Image = 'data:image/jpeg;base64,' + imageData;

          t.imageRecord = {
            'owner': Meteor.userId(),
            'itemId': t.entry._id,
            'imageData': base64Image,
            'entryTimestamp': new Date(),
            'profile': false
          };

          t.imageData = base64Image;
          t.imgBackground = {"background":"#000000"}

        }, (err) => {
          console.debug(err);
        });
      });
    }
  }

  updateChildren(updateItem){

    if (updateItem.selected.length > 0) {
      childIds = updateItem.selected.map( function(p){ return p._id });
      updateItem.selected = Entries.find({_id:{$in:childIds}}, {fields: {'_id':1,'name':1,'brand':1,'type':1}}).fetch();
    }

    return updateItem;

  }

  ownerDisplay(ownerId) {
    if (ownerId === Meteor.userId()) {
      return Meteor.user().username;
    } else if (ownerId === "Enlisense" ) {
      return ownerId;
    } else {
      return 'Private User';
    }
  }

  // Fired when trash can on contents is clicked
  removeContentsHandler(_id) {

    // hide delete button
    this.$ionicListDelegate.closeOptionButtons();

    // remove from children
    this.entryStack.selected = _.without(this.entryStack.selected, _.findWhere(this.entryStack.selected, {
      _id:_id
    }));

  }

  scanBarcode() {
    // console.debug('Scan barcode');

    if (Meteor.isCordova) {
      BarcodeScanner.scan().then((barcodeData) => {
        // Success! Barcode data is here
        // console.debug(barcodeData.text);

        // set searchTerm
        this.entryStack.barcode = barcodeData.text;

      }, (err) => {
        // An error occurred
        console.debug(err);
      });
    }
  }

  save() {

    // Check if owner of entry

    // If owner update and continue
    if (this.entryStack.owner = Meteor.userId()){

      // Update mongo
      Entries.update({
        _id: this.entryStack._id
      }, {
        $set: {
          name: this.entryStack.name,
          brand: this.entryStack.brand,
          barcode: this.entryStack.barcode,
          category: this.entryStack.category,
          notes: this.entryStack.notes,
          children: this.entryStack.selected,
          selected: this.entryStack.selected,
          calories: this.entryStack.calories,
          fat: this.entryStack.fat,
          cholesterol: this.entryStack.cholesterol,
          sodium: this.entryStack.sodium,
          totalCarbohydrate: this.entryStack.totalCarbohydrate,
          dietaryFiber: this.entryStack.dietaryFiber,
          sugar: this.entryStack.sugar,
          protein: this.entryStack.protein,
          dosage: this.entryStack.dosage,
          genericName: this.entryStack.genericName,
          drugClass: this.entryStack.drugClass,
          drugType: this.entryStack.drugType
        }
      });

      /*
      if (this.imageRecord) {
        Images.insert(this.imageRecord);
      }
      */

      // if upstack is entriesItem then remove and update from upstack children
      //console.log(JSON.stringify(this.stackEntryService.stack));
      N = this.stackEntryService.stack.length;
      //console.log(N);
      if (N > 1) {
        // remove
        let tmp = _.without(this.stackEntryService.stack[N-2].data.children, _.findWhere(this.stackEntryService.stack[N-2].data.children, {
          _id:this.entryStack._id
        }));
        this.stackEntryService.stack[N-2].data.children = tmp;

        // add
        this.stackEntryService.stack[N-2].data.children.push({'_id': this.entryStack._id});
        this.stackEntryService.stack[N-2].data.selected.push({'_id': this.entryStack._id});
      }

      // Remove current from stack
      this.stackEntryService.remove();

      // Redirect to upstack
      let route = this.stackEntryService.stack[this.stackEntryService.stack.length-1].data.route;
      this.redirectNextView(route, this.entryStack.name);

    // else add new _id to entry and save
    } else {
      this.entryStack._id = new Meteor.Collection.ObjectID().valueOf();
      this.entryStack.owner = Meteor.userId();

      Entries.insert(this.entryStack);

      this.imageRecord._id = this.entryStack._id;
      //Images.insert(this.imageRecord);

      // if upstack is entriesItem then remove and update from upstack children
      //console.log(JSON.stringify(this.stackEntryService.stack));
      N = this.stackEntryService.stack.length;
      //console.log(N);
      if (N > 1) {
        // remove
        let tmp = _.without(this.stackEntryService.stack[N-2].data.children, _.findWhere(this.stackEntryService.stack[N-2].data.children, {
          _id:this.entryStack._id
        }));
        this.stackEntryService.stack[N-2].data.children = tmp;

        // add
        this.stackEntryService.stack[N-2].data.children.push({'_id': this.entryStack._id});
        this.stackEntryService.stack[N-2].data.selected.push({'_id': this.entryStack._id});
      }
      // Remove current from stack
      this.stackEntryService.remove();
      delete this.entryStack;

      // Redirect to upstack
      let route = this.stackEntryService.stack[this.stackEntryService.stack.length-1].data.route;
      this.redirectNextView(route, this.entryStack.name);
    }

  }

  // Fired from modal drop confirmation
  drop() {

    // Remove from mongo
    Entries.remove({_id: this.entryStack._id});

    // if upstack is entriesItem then remove from upstack children
    N = this.$scope.stack.length;
    if (N === 2) {
      let tmp = _.without(this.stackEntryService.stack[0].data.children, _.findWhere(this.stackEntryService.stack[0].data.children, {
        _id:this.entryStack._id
      }));
      this.stackEntryService.stack[0].data.children = tmp;
    }

    // Remove from stack
    this.stackEntryService.remove();

    // Redirect to upstack
    let route = this.stackEntryService.stack[this.stackEntryService.stack.length-1].data.route;
    this.redirectNextView(route, this.entryStack.name);
    this.entryStack = {};
  }

  redirectSearchView(){

    this.viewService.nextDirection = 'forward';
    this.$state.go('entriesSearch', { searchTerm:"", back:false , type: this.$stateParams.type});

  }

  redirectDetailsView(_id){

    this.viewService.nextDirection = 'forward';
    this.$state.go(this.$state.current, {_id: _id ,'dup': true, type: this.$stateParams.type});

  }

  redirectNextView(route, name) {

    let params = {};

    if (route === 'entriesSearch') {
      params = {
        'searchTerm': name,
        'back': true
      };
    } else if (route === 'entryAdd') {
      params = {'new': false};
    } else if (route === 'entriesItem' && this.stackEntryService.stack[0].data._id) {
      params = {'_id': this.stackEntryService.stack[0].data._id};
    }

    params.type = this.$stateParams.type;

    this.viewService.nextDirection = 'forward';
    this.$state.go(route, params);

  }

}

const name = 'entryDetails';

// create a module
export default angular.module(name, [
  angularMeteor,
  StackEntryService,
  'mobiscroll-select'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: EntryDetails
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('entryDetails', {
      url: '/entryDetails',
      params: {
        dup: false,
        _id: undefined,
        type: undefined
      },
      template: '<ion-view hide-back-button="false" cache-view="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-buttons side="right">' +
                '  <button class="button today-button" ng-click="goViewEntryAdd()">' +
                '    <p>Copy</p>' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 80%;">{{ viewTitle }} Details</span>' +
                '</ion-nav-title>' +
                '<entry-details></entry-details>' +
                '</ion-view>',
      controller: function($scope, $stateParams, $state, stackEntryService, viewService) {

        $scope.viewTitle = $stateParams.type;

        $scope._id = $stateParams._id;

        $scope.goViewEntryAdd = function(_id) {
          // forward, back, enter, exit, swap
          viewService.nextDirection = 'forward';

          // always transition back to more
          $state.go('entryAdd', {'_id': $stateParams._id, 'type':$stateParams.type});
        }

        $scope.goBackHandler = function() {

          // remove current
          stackEntryService.remove();

          // get previous info
          route = stackEntryService.stack[stackEntryService.stack.length-1].data.route;
          params = JSON.parse(JSON.stringify(stackEntryService.stack[stackEntryService.stack.length-1].params));

          if ($stateParams.type) {
            params.type = $stateParams.type;
          }

          if (route === 'entriesSearch') {
            params.back = true;
            params.searchTerm = stackEntryService.stack[stackEntryService.stack.length-1].data.searchTerm;
          } else if (route === 'entryDetails') {
            params.dup = false;
          } else if (route === 'entryProfile') {
            params = {'_id': $stateParams._id};
          }

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.go(route, params);
        }
      },
      resolve: {
        currentUser($q) {
          if (Meteor.userId() === null) {
            return $q.reject('AUTH_REQUIRED');
          } else {
            return $q.resolve();
          }
        }
      }
    });
}
