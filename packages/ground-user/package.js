Package.describe({
  name: 'tuhituhi18:ground-user',
  summary: 'Get logged user\'s data available on startup and offline.',
  version: '0.1.3',
  git: 'https://github.com/gwendall/meteor-ground-user.git',
});

Package.onUse(function (api, where) {
  api.use('ecmascript', ['client', 'server']);
  api.use('tracker', 'client');
  api.use([
    'accounts-base@2.2.0',
    'ground:db@0.3.6',
    'mongo@1.13.0',
    'underscore@1.0.10',
    'tuhituhi18:accounts-helpers@0.1.7'
  ], 'client');

  api.addFiles('client/lib.js', 'client');
  api.addFiles('server/lib.js', 'server');

  api.export('GroundUser', 'client');

});
