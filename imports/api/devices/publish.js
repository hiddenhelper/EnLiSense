import { Meteor } from 'meteor/meteor';

import { Devices, Reports, ReportsContent } from './collection';

if (Meteor.isServer) {
  Meteor.publish('devices', function(options) {
    return Devices.find({owner: this.userId});
  });
}

if (Meteor.isServer) {
  Meteor.publish('reports', function() {
    return Reports.find({ owner: this.userId });
  });
}

if (Meteor.isServer) {
  Meteor.publish('reports-content', function(reportId, skip = 0, limit = 5) {
    return ReportsContent.find({ reportId: reportId }, { skip, limit });
  });
}
