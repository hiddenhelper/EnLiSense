import { Mongo } from 'meteor/mongo';

export const ProfileImages = new Meteor.Collection('profileImages');
if (Meteor.isCordova) Ground.Collection(ProfileImages);

ProfileImages.allow({
  insert(userId, image) {
    return userId && image.owner === userId;
  },
  update(userId, image, fields, modifier) {
    return userId && image.owner === userId;
  },
  remove(userId, image) {
    return userId && image.owner === userId;
  }
});
