import { Mongo } from 'meteor/mongo';

export const Images = new Meteor.Collection('images');
if (Meteor.isCordova) Ground.Collection(Images);

Images.allow({
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
