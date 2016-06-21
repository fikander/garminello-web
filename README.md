# What it is

Server for garminello - integration of Garmin devices with Trello. 

# Setup dev environment

Create .env-dev file with environment variables (see sample.env-dev):

	DEBUG=true
	TRELLO_API_KEY=<TRELLO_API_KEY>
	TRELLO_OAUTH_SECRET=<TRELLO_OAUTH_SECRET>
	PORT=8080
	DATABASE_URL=pg://postgres:postgres@postgres:5432/postgres
	TRELLO_CARD_NAME_SIZE=50
	TRELLO_CARD_COUNT=80
	ENVIRONMENT=development

## Terminal 1
Forward Docker port to localhost (required for OSX with docker-machine)
	
	docker-machine ssh default -L 8080:localhost:8080

## Terminal 2
ngrok to expose port outside

	npm install -g ngrok
	ngrok http 8080

## Terminal 3
Copy docker-compose-sample.yml and change it to configure volumes with your local paths:

	cp docker-compose-sample.yml docker-compose.yml

Run Docker containers:

	docker-compose build
	docker-compose up -d
	docker exec -it garminelloweb_web_1 bash

Then in the docker container:

	gulp build
	gulp watch

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
	heroku pg:psql --app garminello DATABASE

Heroku config variables to set (see sample.env for example values):

	DATABASE_URL
	DEBUG
	TRELLO_API_KEY
	TRELLO_CARD_COUNT
	TRELLO_CARD_NAME_SIZE
	TRELLO_OAUTH_SECRET

Before using heroku local, export settings to local .env (copy and edit sample.env):

	heroku config -s  >> .env

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

# Useful articles

- http://www.leanpanda.com/blog/2015/06/28/amd-requirejs-commonjs-browserify/
