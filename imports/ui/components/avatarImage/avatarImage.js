import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './avatarImage.html';

import { ProfileImages } from '../../../api/profileImages';

class AvatarImage {
  constructor($rootScope, $scope, $reactive, viewService) {
    'ngInject';

    $reactive(this).attach($scope);

    // this.subscribe('profileImage', () => [{sort: {entryTimestamp: -1}, limit: 1},this.getReactively('_id')]);
    // this.subscribe('profileImage');

    this.helpers({
      image() {
        return ProfileImages.find({owner: Meteor.userId()},{sort: {entryTimestamp: -1}, limit: 1}).fetch();
      }
    });

    //this.image = ProfileImages.find({owner: Meteor.userId()},{sort: {entryTimestamp: -1}}).fetch();

    this.autorun(() => {
      this.getReactively('image');

      if (this.image && this.image.length > 0 && this.image[0].imageData) {
        this.imageData = this.image[0].imageData;
      }
    });

  }
}

const name = 'avatarImage';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: AvatarImage
});
