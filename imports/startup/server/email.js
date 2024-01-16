import { Meteor } from 'meteor/meteor';

Meteor.startup(function () {
  if (Meteor.isServer) {
    process.env.MAIL_URL = process.env.GMAIL_SMTP || Meteor.settings.private.gmailSMTP;
  }
});
