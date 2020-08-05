FROM nodered/node-red:latest-12

RUN mkdir -p /data/node_modules

WORKDIR /data/node_modules/node-red-contrib-home-assistant-websocket
COPY nodered /data
EXPOSE 1880
EXPOSE 3000

