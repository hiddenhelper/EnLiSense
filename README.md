# EnLiSense AWARE

### To Do


#### Icons and splash screen

https://github.com/lpender/meteor-assets
http://editor.method.ac/
https://glyphter.com/#login


#### Colors

Symptom -> #db3445 (red)
Food -> #000000 (black)
Drink -> #3498db (blue)
Medication -> #db3498 (purple)
Exercise -> #34db77 (green)
Sleep -> #dbcb34 (yellow)
Event -> #34dbcb (light blue)
Mood -> #828282 (grey)
Vitals -> #db7734 (brown)


### Apple Fitness Types

Cooldown
Core Training
Dance
Elliptical
Functional Strength Training
High Intensity Interval Training
Hiking
Indoor Cycle
Indoor Run
Indoor Walk
Kickboxing
Multisport
Open Water Swim
Outdoor Cycle
Outdoor Walk
Pilates
Pool Swim
Rower
Stair Stepper
Tai Chi
Traditional Strength Training
Yoga



#### Heroku Deploy

```bash

# init
source ~/.bashrc
heroku login
heroku apps:create janaru
heroku config --app janaru
heroku buildpacks:set https://github.com/jordansissel/heroku-buildpack-meteor.git

heroku labs:enable http-session-affinity

heroku addons:create mongolab:sandbox

heroku config | grep MONGODB_URI
# MONGODB_URI: mongodb://heroku_tm8lw809:4l3p41drejsln1m5gg1ieha6h9@ds151068.mlab.com:51068/heroku_tm8lw809

heroku config:add MONGO_URL=mongodb://heroku_tm8lw809:4l3p41drejsln1m5gg1ieha6h9@ds151068.mlab.com:51068/heroku_tm8lw809
heroku config:add ROOT_URL=https://janaru.herokuapp.com

meteor build --directory ~/code/janaru-app --mobile-settings settings.json --server "https://janaru-app.herokuapp.com"

heroku buildpacks:set https://github.com/heroku/heroku-buildpack-nodejs -a janaru


cd /Users/jvawdrey/code/janaru-app/bundle/programs/server
npm install --production

touch package.json

{
  "scripts": {
    "start": "node app/app.js"
  }
}

git init && git add . && git commit -m "init commit"
git remote add heroku https://git.heroku.com/janaru-app.git

git remote -v

git push heroku master --force

```


#### Deploy App


meteor build --directory ~/code/a42-application-dev --mobile-settings settings.json --server "https://dev.enlisense-app.com"

meteor build --directory ~/code/a42-application-prod --mobile-settings settings.json --server "https://prod.enlisense-app.com"

cd /Users/jvawdrey/code/a42-application-app/bundle/programs/server && npm install

cd ../.. && emacs package.json





ssh -i /Users/jjvawdrey/Downloads/enlisense.pem ubuntu@ec2-100-26-221-198.compute-1.amazonaws.com

scp -i /Users/jjvawdrey/Downloads/enlisense.pem package.tar.gz ubuntu@ec2-100-26-221-198.compute-1.amazonaws.com:
