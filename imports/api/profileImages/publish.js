import { Meteor } from 'meteor/meteor';

import { ProfileImages } from './collection';

if (Meteor.isServer) {
  Meteor.publish('profileImage', function() {
    return ProfileImages.find({owner: this.userId});
  });
}
