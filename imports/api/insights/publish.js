import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Insights } from './collection';

if (Meteor.isServer) {
  Meteor.publish('insights', function(options, searchString) {
    let selector = {};

    if (typeof searchString === 'string' && searchString.length) {

      selector = { $and: [
        { $or: [
          {type: searchString},
          {tags: {
              $regex: `.*${searchString}.*`,
              $options : 'i'
            }
          }
        ]},{ owner: this.userId}, {hidden: false}]}

    } else {
      selector = { $and: [{owner: this.userId},{hidden: false}] }
    }


    Counts.publish(this, 'numberOfInsights', Insights.find(selector), {
      noReady: true
    });

    return Insights.find(selector, options);
  });

  Meteor.publish('insight', function(options) {

    return Insights.find({ owner: this.userId });
  });

}

// offline
/*
subs = new SubsManager();
Meteor.startup(function () {
	if (Meteor.isCordova) subs.subscribe('insights');
	if (Meteor.isCordova) subs.subscribe('insight');
});
*/
