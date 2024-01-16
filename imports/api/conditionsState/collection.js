import { Mongo } from 'meteor/mongo';

export const ConditionsState = new Meteor.Collection('conditionsState');
if (Meteor.isCordova) Ground.Collection(ConditionsState);

ConditionsState.allow({
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
