import { Mongo } from 'meteor/mongo';

export const SupportLikes = new Meteor.Collection('supportLikes');
if (Meteor.isCordova) Ground.Collection(SupportLikes);

SupportLikes.allow({
  insert(userId, sl) {
    return userId && sl.owner === userId;
  },
  update(userId, sl, fields, modifier) {
    return userId && sl.owner === userId;
  },
  remove(userId, sl) {
    return userId && sl.owner === userId;
  }
});
