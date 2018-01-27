#!/bin/sh

mosquitto_sub -v -h $MQTT_HOST -p $MQTT_PORT -t $MQTT_LISTENER_TOPIC
