FROM node:argon

# vim for occassional fiddling with dev files
RUN apt-get update && apt-get --yes install vim python-pip
RUN pip install grip

RUN mkdir -p /usr/src/garminello
WORKDIR /usr/src/garminello

COPY package.json /usr/src/garminello
RUN npm install
RUN npm install -g nodemon
COPY . /usr/src/garminello

ENV PATH $PATH:./node_modules/.bin

EXPOSE 8080

CMD ["npm", "start"]
