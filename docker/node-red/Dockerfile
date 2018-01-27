FROM nodered/node-red-docker:0.17.5-slim

# RUN npm install node-red-contrib-home-assistant

# Node Red image marks /data as volume so copy doesn't work there
COPY root-fs /
COPY root-fs/data-dev/settings.js /data-dev/settings.js

USER root
RUN chown -R node-red:node-red /data-dev
RUN npm install --global nodemon
USER node-red

WORKDIR /data-dev
CMD ["node", "/usr/src/node-red/node_modules/node-red/red.js", "--userDir", "/data-dev", "-v", "flows.json"]
