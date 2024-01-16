import { Mongo } from 'meteor/mongo';

export const Notifications = new Meteor.Collection('notifications');
if (Meteor.isCordova) Ground.Collection(Notifications);

Notifications.allow({
  insert(userId, notification) {
    return userId && notification.owner === userId;
  },
  update(userId, notification, fields, modifier) {
    return userId && notification.owner === userId;
  },
  remove(userId, notification) {
    return userId && notification.owner === userId;
  }
});
