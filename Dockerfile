FROM node:22

# vim for occassional fiddling with dev files
RUN apt-get update && apt-get --yes install vim python3-pip
RUN pip install --break-system-packages grip

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
RUN npm install --unsafe-perm --legacy-peer-deps

ENV PATH $PATH:./node_modules/.bin

EXPOSE 8080

CMD ["npm", "start"]
