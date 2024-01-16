import { Mongo } from 'meteor/mongo';

export const SocialHistories = new Meteor.Collection('socialHistories');
if (Meteor.isCordova) Ground.Collection(SocialHistories);


SocialHistories.allow({
  insert(userId, socialHistory) {
    return userId && socialHistory.owner === userId;
  },
  update(userId, socialHistory, fields, modifier) {
    return userId && socialHistory.owner === userId;
  },
  remove(userId, socialHistory) {
    return userId && socialHistory.owner === userId;
  }
});
