FROM node:7
MAINTAINER Ara Yapejian <ayapejian@gmail.com>

# Home directory for Node-RED application source code.
RUN mkdir -p /app /data/.node-red/nodes
WORKDIR /app

# package.json contains Node-RED NPM module and node dependencies
RUN git clone https://github.com/node-red/node-red.git . \
    && yarn \
    && yarn run build \
    && yarn add \
        nodemon \
        node-red/node-red-dashboard

# Add node-red user so we aren't running as root.
RUN useradd --home-dir /data --no-create-home app_user \
    && groupmod -o -g 501 app_user  \
    && usermod -o -u 501  app_user   \
    && chown -R app_user:app_user /data \
    && chown -R app_user:app_user /app

USER app_user

# Copy the node source, not needed once published
COPY . /data/.node-red/nodes/ha-eventer

# User configuration directory volume
VOLUME ["/data", "/app"]

# Environment variable holding file path for flows configuration
ENV FLOWS=flows.json

EXPOSE 1880
# CMD ["npm", "start", "--", "--userDir", "/data"]
CMD ["./node_modules/.bin/nodemon", "--watch", "/data/.node-red/nodes", "--exec", "npm", "start"]
# CMD ["npm", "start"]
