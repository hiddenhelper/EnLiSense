import { Mongo } from 'meteor/mongo';

export const Feedback = new Meteor.Collection('feedback');
if (Meteor.isCordova) Ground.Collection(Feedback);


Feedback.allow({
  insert(userId, feedback) {
    return userId && feedback.owner === userId;
  },
  update(userId, feedback, fields, modifier) {
    return userId && feedback.owner === userId;
  },
  remove(userId, feedback) {
    return userId && feedback.owner === userId;
  }
});
