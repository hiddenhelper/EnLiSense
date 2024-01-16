import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Items } from '../items';
import { Entries } from '../entries';

if (Meteor.isServer) {
  Meteor.publish('entries', function(options, searchString) {
    let selector = {};

    if (typeof searchString === 'string' && searchString.length) {

      selector = { $or: [
        {name: {
            $regex: `.*${searchString}.*`,
            $options : 'i'
          }
        },
        {barcode: {
            $regex: `.*${searchString}.*`,
            $options : 'i'
          }
        }
      ]}

    } else {
      selector.name = {
        $regex: `.*$AAAA~12345!~BBBB.*`,
        $options : 'i'
      };
    }

    /*
    Counts.publish(this, 'numberOfEntries', Entries.find(selector), {
      noReady: true
    });
    */

    return Entries.find(selector, options);
  });

  Meteor.publish('entry', function(options) {
    return Entries.find({});
  });

  Meteor.publish('entriesFromList', function(entryIds) {
    return Entries.find({_id:{$in: entryIds}});
  });

  Meteor.publish('numberOfEntries', function(itemId, options) {
    Counts.publish(this, 'numberOfEntriesCounter', Entries.find({_id: itemId, owner: this.userId}));
  });

  // Recursive caching of all contents associated with existing entries
  Meteor.publish('allMyEntries', function(options) {

    // Grab all items for this owner
    let items = Items.find({owner: this.userId}).fetch();

    childrenIds = [];

    if (items) {

      for (i in items) {

        if (items[i].children) {

          // Extract IDs for children
          childrenIds = items[i].children.map(function(p) { return p._id });

          // Use this list to keep track of items already extracted
          extracted = [];

          // These numbers will be used to compare the before and after lengths for stopping condition
          l1 = childrenIds.length;
          l2 = -1;

          // Loop until no new IDs are discovery or total number of iterations exceeds 10
          stop = 0;
          while (l1 !== l2 && stop < 10) {

            stop += 1;

            // Capture starting length of array
            l1 = childrenIds.length;

            // Grab all items that are children and have not already been extracted
            tmp = Entries.find({$and:[{_id:{$in: childrenIds}},{_id:{$nin: extracted}}]}).fetch();

            // update extracted lost
            extracted = childrenIds;

            // Loop through each item extracted in current iteration
            for (i in tmp) {

              // if item has children field
              if (tmp[i] && tmp[i].children) {

                // Capture all this items contents for next iteration
                tmp2 = tmp[i].children.map(function(p) { return p._id });
                childrenIds = childrenIds.concat(tmp2);
              }

            }
            // Capture ending length of array
            l2 = childrenIds.length;
          }
        }
      }


    } else {
      childrenIds = [];
    }

    return Entries.find({
      _id: {$in: childrenIds}
    });
  });
}
