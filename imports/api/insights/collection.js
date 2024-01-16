import { Mongo } from 'meteor/mongo';

export const Insights = new Meteor.Collection('insights');
if (Meteor.isCordova) Ground.Collection(Insights);

Insights.allow({
  insert(userId, insight) {
    return userId && insight.owner === userId;
  },
  update(userId, insight, fields, modifier) {
    return userId && insight.owner === userId;
  },
  remove(userId, insight) {
    return userId && insight.owner === userId;
  }
});
