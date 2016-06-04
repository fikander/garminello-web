
# Install

npm install -g ngrok
npm install -g nodemon


# Dev

docker-compose up -d
docker-compose logs
# init database
docker exec -it garminelloweb_web_1 node src/models/database.js
# database prompt
docker exec -it garminelloweb_db_1 bash
> psql --user postgres


# Run dev env

- terminal 1
docker-machine ssh default -L 8080:localhost:8080  --> to forward port to localhost

- terminal 2
ngrok http 8080

-terminal 3
docker-compose build
docker-compose up


# Heroku

heroku logs --tail
heroku run node
heroku run bash

heroku open

heroku local web

heroku config
heroku config:set VARIABLE=x

heroku addons:create heroku-postgresql:hobby-dev
heroku pg:psql


# User manual

- Only 80 cards will be returned for per board because of memory limitations on the devices
- Currently open board is saved on the device, so network connection is not required when you exit the app. The same board will open next time you open it.
 
 # Technologies and libraries
 - Docker
 - heroku
 - NodeJS
 - Knex, Bookshelf
 - Promises
 - BackboneJS
 - REST API


# TODO

use backbone and react
https://blog.engineyard.com/2015/integrating-react-with-backbone
