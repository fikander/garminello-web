
# Install

npm install -g ngrok
npm install -g nodemon

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
