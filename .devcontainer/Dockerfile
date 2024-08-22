FROM nodered/node-red:latest

RUN mkdir -p /data/node_modules

RUN npm install pnpm
# Need to change the default store location to avoid permission errors
# https://github.com/pnpm/pnpm/issues/5803#issuecomment-1974820613
RUN pnpm config set store-dir /data/pnpm/store

WORKDIR /data/node_modules/node-red-contrib-home-assistant-websocket
COPY nodered /data

EXPOSE 1880
EXPOSE 3000

