# Config Server

Home Assistant connection configuration

## Config

### Name

- Type: `string`

Label for this configuration, see details below for implications

### Hass.io

- Type: `boolean`

If you're running Node-RED as a Hass.io Add-on check this. No other information is needed.

### Base URL

- Type: `string`

The base URL and port the home assistant instance can be reached at, for example: `http://192.168.0.100:8123` or `https://homeassistant.mysite.com`

### Access Token / Password

- Type: `string`

Long-lived Access Token or Password used to contact the API

### Legacy Password

- Type: `boolean`

If you're using the legacy password to log into Home Assistant check this and enter your password in the password text box.

### Unauthorized SSL Certificates

- Type: `boolean`

This will allow you to use self-signed certificates. Only use this if you know what you're doing.

### State Boolean

- Type: `string | delimited`

A list of strings, not case sensitive, delimited by vertical pipe, |, that will return true for State Type Boolean.

### Cache Autocomplete Results

Enables the caching of the JSON autocomplete requests. Enabling or disabling this may require a restart of Node-RED for it to take effect.

## Details

Every node requires a configuration attached to define how to contact Home Assistant, which is this config node's main purpose.

### Context

Each config node will also make some data available on the global context, the `Name` value in this node is used as, camelcase, the namespace for those values

Currently `states`, `services` and `events` is made available on the global context. `states` is always set to all available states at startup and updated whenever state changes occur so it should be always up to date. `services` and `events` is only updated on initial deploy.

### Context Example

Say we have a config node with the name `My Awesome server`, with an entity set up in Home Assistant as `switch.my_switch`. This state would be available within function nodes and you could fetch using something like the below code

```js
const haCtx = global.get("homeassistant");
const configCtx = haCtx.myAwesomeServer;
const entityState = configCtx.states["switch.my_switch"];
return entityState.state === "on" ? true : false;
```

## Connection Issues

Communication with Home Assistant is accomplished via a combination of WebSocket and the REST API if you are having troubles communicating with home assistant make sure you can access the API outside of node-red, but from the same server node-red is running on, using a REST client, curl, or any number of other methods to validate the connection

## References

[Home Assistant REST API](https://home-assistant.io/developers/rest_api)
