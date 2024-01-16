import { Mongo } from 'meteor/mongo';

export const Conditions = new Meteor.Collection('conditions');
if (Meteor.isCordova) Ground.Collection(Conditions);

Conditions.allow({
  insert(userId, condition) {
    return userId && condition.owner === userId;
  },
  update(userId, condition, fields, modifier) {
    return userId && condition.owner === userId;
  },
  remove(userId, condition) {
    return userId && condition.owner === userId;
  }
});
