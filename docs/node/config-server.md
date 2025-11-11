# Server Config

The **Server Config** node defines how Node-RED connects to your Home Assistant instance.
It manages connection details, authentication, and various integration settings to ensure a stable connection between Node-RED and Home Assistant.

---

## Connection Settings

### Name

- **Type:** `string`

A user-defined label for this configuration.
This name is also used as the **namespace** for related global context data (see [Context](#context)).

---

### Using the Home Assistant Add-on

- **Type:** `boolean`

If you’re running Node-RED as a **Home Assistant Add-on (Hass.io)**, enable this option.
No additional configuration (such as URL or access token) is required.

---

### Base URL

- **Type:** `string`

The base URL and port of your Home Assistant instance.

**Examples:**

- `http://192.168.0.100:8123`
- `https://homeassistant.mysite.com`

---

### Access Token

- **Type:** `string`

A **Long-Lived Access Token** used to authenticate with Home Assistant’s API.

---

### Allow Unauthorized SSL Certificates

- **Type:** `boolean`

Allows Node-RED to accept **self-signed certificates** when connecting to Home Assistant.

---

### Enable Heartbeat

- **Type:** `boolean`

Enables periodic **ping** messages sent through the WebSocket connection.
If no **pong** response is received within 5 seconds, Node-RED automatically attempts to reconnect.

---

### Heartbeat Interval

- **Type:** `number`

Specifies how often (in seconds) the heartbeat ping is sent.
The **minimum value** is **10 seconds**.

---

## Config Settings

### State Boolean

- **Type:** `array of strings`

Defines which strings should be interpreted as boolean `true` when comparing state values.
Comparisons are **case-insensitive** and ignore surrounding whitespace.

**Default values:**

```
["y", "yes", "on", "true", "home", "open"]
```

See [Home Assistant Boolean](../node/conditions.md#home-assistant-boolean) for more details.

---

### Enable Global Context Store

- **Type:** `boolean`

When enabled, Home Assistant connection data, states, and services are stored in the Node-RED **global context**.
This allows other nodes or function nodes to access Home Assistant data directly.

**Example:**

```js
const haCtx = global.get("homeassistant");
const configCtx = haCtx.homeAssistant;
const entityState = configCtx.states["switch.my_switch"];
return entityState.state === "on";
```

---

## UI Settings

### Cache Autocomplete Results

- **Type:** `boolean`

Caches JSON autocomplete results for faster UI performance.

---

### ID Selector Display

Determines which text is shown in selectors after an entity ID has been chosen (for example, name, ID, or friendly name).

---

### Status Date Format

#### Separator

A string displayed between the **state** and **date** in an event node’s status text.

#### Additional Options

Supports all standard [DateTimeFormat Options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options).

---

## Details

Every Home Assistant node in Node-RED must reference a **Server Config** node.
This configuration defines how Node-RED connects to and communicates with your Home Assistant instance.

---

### Context

Each Server Config node also exposes data in the **global context**, using the configuration’s **Name** (converted to camelCase) as the namespace.

The following context values are available:

| Key        | Description                       | Update Behavior                               |
| ---------- | --------------------------------- | --------------------------------------------- |
| `states`   | All entity states                 | Always kept up to date as state changes occur |
| `services` | Available Home Assistant services | Loaded on initial deploy                      |
| `events`   | Available Home Assistant events   | Loaded on initial deploy                      |

---

### Context Example

If your Server Config node is named **Home Assistant** and you have an entity `switch.my_switch`, you can access its state with:

```js
const haCtx = global.get("homeassistant");
const configCtx = haCtx.homeAssistant;
const entityState = configCtx.states["switch.my_switch"];
return entityState.state === "on";
```

---

## Connection Issues

Node-RED communicates with Home Assistant using both the **WebSocket** and **REST API**.

If you encounter connection issues:

1. Verify that the Home Assistant API is accessible **from the same host** running Node-RED.
2. Test the connection using a REST client or command line:

   ```bash
   curl -H "Authorization: Bearer <YOUR_LONG_LIVED_ACCESS_TOKEN>" \
        http://<home_assistant_host>:8123/api/
   ```

3. Confirm that your **Base URL** and **Access Token** are correct.
4. Review the Node-RED logs for any connection or authentication errors.

---

## References

- [Home Assistant REST API](https://home-assistant.io/developers/rest_api)
- [Home Assistant Long-Lived Access Tokens](https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token)
- [Node-RED Context Documentation](https://nodered.org/docs/user-guide/context)
