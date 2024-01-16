import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { BarcodeScanner } from 'ionic-native';
import { Camera } from 'ionic-native';
import template from './entryAdd.html';

import { Entries } from '../../../api/entries';
// import { Images } from '../../../api/images';
import { name as CreateEntryService } from '../../services/createEntryService';
import { name as StackEntryService } from '../../services/stackEntryService';

class EntryAdd{
  constructor($scope, $reactive, $state, $ionicListDelegate, createEntryService, $stateParams, stackEntryService, viewService, categoriesService) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$state = $state;
    this.stackEntryService = stackEntryService;
    this.viewService = viewService;
    this.$ionicListDelegate = $ionicListDelegate;
    this.type = $stateParams.type;
    this._id = $stateParams._id;
    this.imageData = undefined;
    this.imageRecord = undefined;
    this.imgBackground = undefined;
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
        this.imageData = this.image[0].imageData;
        this.imgBackground = {"background":"#000000"}
      }
    });
    */

    // If a copy of another item
    if ($stateParams._id) {

      stackEntryService.add(createEntryService($stateParams._id, $stateParams.type), JSON.parse(JSON.stringify($stateParams)));

    // If new item (does not exist in mongo)
    } else if ($stateParams.new === true) {

      // Create new entry object
      let tmpFood = createEntryService(undefined, $stateParams.type);

      // If last item in stack is search then add search term as starter name
      if (stackEntryService.stack[stackEntryService.stack.length-1].data.route === 'entriesSearch') {
        if (stackEntryService.stack[stackEntryService.stack.length-1].data.barcode) {
          tmpFood.barcode =  stackEntryService.stack[stackEntryService.stack.length-1].data.barcode;
        } else {
          tmpFood.name = stackEntryService.stack[stackEntryService.stack.length-1].data.searchTerm;
        }
      }

      stackEntryService.add(tmpFood, JSON.parse(JSON.stringify($stateParams)));


    } // else we are working on last item on stack and do not need to do anything

    // Create a reference to the current object
    this.entry = this.updateChildren(stackEntryService.stack[stackEntryService.stack.length-1].data);
    this._id = this.entry._id;

    this.selectScollerSettings = {
      theme: 'ios',
      display: 'bottom',
      minWidth: 200,
      data:categoriesService[this.type]
    };
  }

  updateChildren(updateItem){

    if (updateItem.selected.length > 0) {
      childIds = updateItem.selected.map( function(p){ return p._id });
      updateItem.selected = Entries.find({_id:{$in:childIds}}, {fields: {'_id':1,'name':1,'brand':1}}).fetch();
    }

    return updateItem;

  }

  scanBarcode() {
    // console.debug('Barcode Scan');

    if (Meteor.isCordova) {
      BarcodeScanner.scan().then((barcodeData) => {
        // Success! Barcode data is here
        // console.debug(barcodeData.text);

        // set searchTerm
        this.entry.barcode = barcodeData.text;

      }, (err) => {
        // An error occurred
        console.debug(err);
      });
    }
  }

  viewHandler(route, params) {

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  removeContentsHandler(_id) {

    // hide delete button
    this.$ionicListDelegate.closeOptionButtons();

    // remove from contents
    this.entry.selected = _.without(this.entry.selected, _.findWhere(this.entry.selected, {
      _id:_id
    }));

  }

  submit() {

    // (1 - Use current item as next search term)
    let name = this.entry.name;

    // Add new entry to mongo (function returns {} which reset this.entry)
    this.entry.children = this.entry.selected;

    this.entry.owner = Meteor.userId();
    delete this.entry.owner.selected;
    this.entry._id = Entries.insert(this.entry);

    /*
    if (this.imageRecord) {
      Images.insert(this.imageRecord);
    }
    */

    // Remove current entry object from stack
    this.stackEntryService.remove();

    // update up stack selected
    this.stackEntryService.stack[this.stackEntryService.stack.length-1].data.selected.push({'_id': this.entry._id});

    // (2 - Use last search term)
    //let name = this.stackEntryService.stack[this.stackEntryService.stack.length-1].searchTerm;

    // Always returning to search from add new -> add 'back' to params
    let params = {searchTerm: name, back: true, type: this.type};

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // entryAdd always redirect back to search list - which will now contain new item
    // Grab the last view info & transition back
    this.$state.go('entriesSearch', params);

  }

  takePhoto() {

    t = this;

    if (Meteor.isCordova) {
      Meteor.startup(function() {

        this.cameraOptions = {
          quality: 50,
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
}

const name = 'entryAdd';

// create a module
export default angular.module(name, [
  angularMeteor,
  CreateEntryService,
  StackEntryService,
  'mobiscroll-select'
])
  .component(name, {
    template,
    controllerAs: name,
    controller: EntryAdd
  })
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('entryAdd', {
      url: '/entryAdd',
      params: {
        new:false,
        _id:undefined,
        type: undefined
      },
      template: '<ion-view hide-back-button="false" cache-view="false" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 80%;">New {{ viewTitle }}</span>' +
                '</ion-nav-title>' +
                '  <entry-add></entry-add>' +
                '</ion-view>',
      controller: function($scope, $state, $stateParams, viewService, stackEntryService) {

        $scope.viewTitle = $stateParams.type;

        $scope.goBackHandler = function() {

          // remove current
          stackEntryService.remove();

          // get previous info
          route = stackEntryService.stack[stackEntryService.stack.length-1].data.route;
          params = JSON.parse(JSON.stringify(stackEntryService.stack[stackEntryService.stack.length-1].params));
          params.type = $stateParams.type;
          if (route === 'entriesSearch') {
            params.back = true;
            params.searchTerm = stackEntryService.stack[stackEntryService.stack.length-1].data.searchTerm;
          }

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo(route, params);

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
