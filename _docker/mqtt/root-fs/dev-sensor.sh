while sleep $MQTT_DEV_SENSOR_INTERVAL; do
    random_num=`od -A n -t d -N 1 /dev/urandom |tr -d ' '`
    mosquitto_pub -h $MQTT_HOST -p $MQTT_PORT -m $random_num -t $MQTT_DEV_SENSOR_TOPIC
done
