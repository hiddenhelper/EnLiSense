import { Mongo } from 'meteor/mongo';

export const Devices = new Meteor.Collection('devices');
if (Meteor.isCordova) Ground.Collection(Devices);

Devices.allow({
  insert(userId, device) {
    return userId && device.owner === userId;
  },
  update(userId, device, fields, modifier) {
    return userId && device.owner === userId;
  },
  remove(userId, device) {
    return userId && device.owner === userId;
  }
});

export const Reports = new Meteor.Collection('reports');
if (Meteor.isCordova) Ground.Collection(Reports);

Reports.allow({
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


export const ReportsContent = new Meteor.Collection('reports-content');
if (Meteor.isCordova) Ground.Collection(ReportsContent);

ReportsContent.allow({
  insert(userId, entry) {
    return userId;
  },
  update(userId, entry, fields, modifier) {
    return false;
  },
  remove(userId, entry) {
    return false;
  }
});
