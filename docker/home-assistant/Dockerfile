FROM homeassistant/home-assistant:0.67.1

ENV HA_HOME_ASSISTANT_TIME_ZONE=America/New_York    \
    HA_HOME_ASSISTANT_LATITUDE=42.360082            \
    HA_HOME_ASSISTANT_LONGITUDE=-71.058880          \
    HA_HOME_ASSISTANT_ELEVATION=38                  \
    HA_HOME_ASSISTANT_TEMPERATURE_UNIT=F            \
    HA_HOME_ASSISTANT_UNIT_SYSTEM=imperial          \
    HA_HTTP_API_PASSWORD=password                   \
    HA_LOGGER_DEFAULT=info                          \
    NODE_RED_URL=http://localhost:1880/

COPY root-fs /

CMD [ "python", "-m", "homeassistant", "--config", "/config" ]
