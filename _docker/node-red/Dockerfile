FROM node:8.9.4

COPY root-fs /
RUN chown -R node:node /data /app

# Install NodeRed base app
ENV HOME=/app
USER node
WORKDIR /app
RUN npm install

# Install Useful Home Automation Nodes
RUN npm install \
    node-red-contrib-bigstatus

# User configuration directory volume
EXPOSE 1880
EXPOSE 9229

# Environment variable holding file path for flows configuration
ENV USER_DIR=/data
ENV FLOWS=flows.json
ENV NODE_PATH=/app/node_modules:/data/node_modules
ENV NODEMON_CONFIG=/app/nodemon.json

CMD ["npm", "start"]
