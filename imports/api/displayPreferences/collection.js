import { Mongo } from 'meteor/mongo';

export const DisplayPreferences = new Meteor.Collection('displayPreferences');
if (Meteor.isCordova) Ground.Collection(DisplayPreferences);

DisplayPreferences.allow({
  insert(userId, displayPreferences) {
    return userId && displayPreferences.owner === userId;
  },
  update(userId, displayPreferences, fields, modifier) {
    return userId && displayPreferences.owner === userId;
  },
  remove(userId, displayPreferences) {
    return userId && displayPreferences.owner === userId;
  }
});
