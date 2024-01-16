import { Mongo } from 'meteor/mongo';

export const Choices = new Meteor.Collection('choices');
if (Meteor.isCordova) Ground.Collection(Choices);

Choices.allow({
  insert(userId, choice) {
    return userId && choice.owner === userId;
  },
  update(userId, choice, fields, modifier) {
    return userId && choice.owner === userId;
  },
  remove(userId, choice) {
    return userId && choice.owner === userId;
  }
});
