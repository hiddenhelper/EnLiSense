Package.describe({
  name: 'tuhituhi18:accounts-helpers',
  summary: 'Useful helpers for Accounts',
  version: '0.1.7',
  git: 'https://github.com/gwendall/meteor-accounts-helpers'
});

var packages = [
  'check@1.0.6',
  'accounts-base@2.2.0',
  'accounts-ui@1.1.6',
  'underscore@1.0.4',
  'templating@1.1.4',
  'service-configuration@1.0.5',
  'gwendall:body-events@0.1.6',
  'aldeed:simple-schema@1.3.3'
];

Package.onUse(function(api, where) {
  api.use('ecmascript', ['client', 'server']);
  api.use('tracker', 'client');
  api.use(packages);
  api.imply(packages);

  api.addFiles([
    'client/hooks.js',
    'client/helpers.js'
  ], 'client');

  api.addFiles([
    'server/lib.js'
  ], 'server');

});
