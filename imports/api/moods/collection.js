import { Mongo } from 'meteor/mongo';

export const Moods = new Meteor.Collection('moods');
if (Meteor.isCordova) Ground.Collection(Moods);

Moods.allow({
  insert(userId, mood) {
    return userId && mood.owner === userId;
  },
  update(userId, mood, fields, modifier) {
    return userId && mood.owner === userId;
  },
  remove(userId, mood) {
    return userId && mood.owner === userId;
  }
});
