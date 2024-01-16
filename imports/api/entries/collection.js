import { Mongo } from 'meteor/mongo';


export const Entries = new Meteor.Collection('entries');
if (Meteor.isCordova) Ground.Collection(Entries);

Entries.allow({
  insert(userId, entry) {
    return userId && entry.owner === userId;
  },
  update(userId, entry, fields, modifier) {
    return userId && entry.owner === userId;
  },
  remove(userId, entry) {
    return userId && entry.owner === userId;
  }
});
