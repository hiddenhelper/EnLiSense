import { Mongo } from 'meteor/mongo';

export const Items = new Meteor.Collection('items');
if (Meteor.isCordova) Ground.Collection(Items);


Items.allow({
  insert(userId, item) {
    return userId && item.owner === userId;
  },
  update(userId, item, fields, modifier) {
    return userId && item.owner === userId;
  },
  remove(userId, item) {
    return userId && item.owner === userId;
  }
});
