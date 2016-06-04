
# Install

npm install -g ngrok
npm install -g nodemon


# Dev environment

## Terminal 1
Forward Docker port to localhost (required for OSX with docker-machine)
	
	docker-machine ssh default -L 8080:localhost:8080

## Terminal 2
ngrok to expose port outside

	ngrok http 8080

## Terminal 3
Run Docker containers:

	docker-compose build
	docker-compose up -d
	docker exec -it garminelloweb_web_1 bash

Then in the docker container:

	./node_modules/.bin/gulp build
	./node_modules/.bin/gulp watch

to start watching and rebuilding client stuff.

Use grip (https://github.com/joeyespo/grip) to view README.md. From within container:

	grip README.md 0.0.0.0:6419


To enter Postgres prompt

	docker exec -it garminelloweb_db_1 bash
	psql --user postgres

# Heroku

Some useful commands for deploying with Heroku:

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
- gulp and browserify to setup client app build environment
- REST API

# TODO

- use backbone and react: https://blog.engineyard.com/2015/integrating-react-with-backbone
