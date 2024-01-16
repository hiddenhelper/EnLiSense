import { Mongo } from 'meteor/mongo';

export const SearchItems = new Meteor.Collection('searchItems');
if (Meteor.isCordova) Ground.Collection(SearchItems);

SearchItems.allow({
  insert(userId, searchItem) {
    return userId && searchItem.owner === userId;
  },
  update(userId, searchItem, fields, modifier) {
    return userId && searchItem.owner === userId;
  },
  remove(userId, searchItem) {
    return userId && searchItem.owner === userId;
  }
});
