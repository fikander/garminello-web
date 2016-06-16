FROM node:argon

# vim for occassional fiddling with dev files
RUN apt-get update && apt-get --yes install vim python-pip
RUN pip install grip

# installing global packages as root
RUN npm install -g nodemon

#RUN useradd -ms /bin/bash node
ENV HOME /home/node
#USER node

RUN mkdir -p /home/node/garminello
WORKDIR /home/node/garminello

#COPY package.json /home/node/garminello
COPY . /home/node/garminello
#RUN chown -R node /home/node/garminello
RUN npm install --unsafe-perm

ENV PATH $PATH:./node_modules/.bin

EXPOSE 8080

CMD ["npm", "start"]
