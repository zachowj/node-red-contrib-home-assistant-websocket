FROM eclipse-mosquitto:1.4.12

COPY root-fs /

# Install mosquitto_pub and mosquitto_sub, link as shorthand pub/sub
RUN apk add --no-cache mosquitto-clients                \
    && ln -s /usr/bin/mosquitto_pub /usr/local/bin/pub  \
    && ln -s /usr/bin/mosquitto_sub /usr/local/bin/sub
