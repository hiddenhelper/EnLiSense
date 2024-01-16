import _ from 'underscore';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Accounts } from 'meteor/accounts-base';

export function changeUsername(newUsername) {
  check(newUsername, String);

  if (!this.userId) {
    throw new Meteor.Error(400, 'You have to be logged in!');
  }

  if (Meteor.isServer) {
    Accounts.setUsername(this.userId, newUsername)
  }
}

export function changeEmail(currentEmail, newEmail) {
  check(currentEmail, String);
  check(newEmail, String);

  if (!this.userId) {
    throw new Meteor.Error(400, 'You have to be logged in!');
  }


  if (Meteor.isServer) {
    Accounts.addEmail(this.userId, newEmail);
    Accounts.removeEmail(this.userId, currentEmail);
  }
}


Meteor.methods({
  changeUsername,
  changeEmail
});
