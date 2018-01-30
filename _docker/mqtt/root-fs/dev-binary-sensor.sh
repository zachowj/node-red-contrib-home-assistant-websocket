while sleep $MQTT_DEV_BINARY_SENSOR_INTERVAL; do
    random_on_off=$(( RANDOM % 2 ))
    mosquitto_pub -h $MQTT_HOST -p $MQTT_PORT -m $random_on_off -t $MQTT_DEV_BINARY_SENSOR_TOPIC
done
