import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { SearchItems } from './collection';

if (Meteor.isServer) {
  Meteor.publish('searchItems', function(options, searchString) {
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
        ]},{owner: this.userId}]}

    } else {
      selector = { owner: this.userId }
    }

    Counts.publish(this, 'numberOfSearchItems', Insights.find(selector), {
      noReady: true
    });

    return SearchItems.find(selector, options);
  });

  Meteor.publish('searchItemsAll', function(options) {
    return SearchItems.find({});
  });
}
