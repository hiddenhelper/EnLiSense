#!/bin/bash

# Awake app build script
# Copyright (C) 2017 Janaru LLC - All Rights Reserved

# build meteor
echo "*** Building Awake app ***"
meteor build --directory ~/code/enlisense-app --mobile-settings settings.json --server "https://dev.enlisense-app.com/"

# remove previous build if exists
cd
# check if created bundle
if [ ! -d "../enlisense-app/bundle" ]; then
  echo "*** Error building application - exiting ***"
  exit
fi

# grab node version
cd ../enlisense-app/bundle
# "| cut -c 2-" -> removes first character of string. 'v' in this case.
NODE_VERSION=$(cat .node_version.txt | cut -c 2-)
echo "Node.js version: "
echo $NODE_VERSION

# create package.json string
PCKJSON='{
  "engines" : {
    "node" : "'"$NODE_VERSION"'"
  },
  "scripts": {
    "start": "node main.js"
  }
}'
echo "package.json: "
echo $PCKJSON

# create buildpack-run.sh string
BLDPCKRUN=$'#!/bin/bash\ncd programs/server && npm install --production && cd ../..'
echo "buildpack-run.sh: "
echo "$BLDPCKRUN"

# create git repo and push to heroku
echo "*** Pushing app to heroku ***"

echo "$PCKJSON" >> package.json
chmod 777 package.json

echo "$BLDPCKRUN" >> buildpack-run.sh
chmod 777 buildpack-run.sh

git init && git add . && git commit -m "init commit"
git remote add heroku https://git.heroku.com/janaru-app.git
git push heroku master --force

echo "*** Complete! ***"
