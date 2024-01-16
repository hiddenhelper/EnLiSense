import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Items } from '../../api/items';
import { Entries } from '../../api/entries';

const name = 'dBService';

function DBService() {
  'ngInject';

  function findAllNested() {

    // Grab all items for this owner
    let items = Items.find({owner: Meteor.userId()}).fetch();

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
    }).fetch();
  };



  // return total number of occurances & number of times child
  function countOccurance(_id) {

    // find all entries that have _id as child
    let items = Entries.find({children: {$elemMatch: {_id: _id}}}).fetch();

    parentIds = items.map(function(p) { return p._id });
    parentIds = parentIds.concat(_id);

    exclude = [];

    l1 = parentIds.length;
    l2 = -1;

    // Loop until no new IDs are discovery or total number of iterations exceeds 10
    stop = 0;
    while (l1 !== l2 && stop < 10) {

      stop += 1;

      l1 = parentIds.length;

      tmp = Entries.find({$and:[{_id:{$in: parentIds}},{_id:{$nin: exclude}}]}).fetch();
      exclude = parentIds;
      parentIds = parentIds.concat(tmp.map(function(p) { return p._id }));

      l2 = parentIds.length;
    }

    let itemsFinal = Items.find({children: {$elemMatch: {_id: {$in: parentIds}}}}).fetch();

    return {
      itemsCount: itemsFinal.length,
      parentIds: parentIds
    };

  };


  return {
    findAllNested: findAllNested,
    countOccurance: countOccurance
  };
}

// create a module
export default angular.module(name, [
    angularMeteor
])
  .service(name, DBService);
