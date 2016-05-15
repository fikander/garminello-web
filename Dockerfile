FROM node:argon

RUN mkdir -p /usr/src/garminello
WORKDIR /usr/src/garminello

COPY package.json /usr/src/garminello
RUN npm install
RUN npm install -g nodemon

COPY . /usr/src/garminello

EXPOSE 8080

CMD ["npm", "start"]
