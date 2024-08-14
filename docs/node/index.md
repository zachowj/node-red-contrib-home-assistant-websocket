# Nodes

## [Action](./action.md)

This node allows you to send a request to Home Assistant to perform specific actions. These actions could include tasks such as turning on a light (`light.turn_on`), selecting an option from a dropdown menu (`input_select.select_option`), or any other service call supported by Home Assistant. It serves as a bridge between Node-RED and Home Assistant, enabling automation flows to directly control devices or entities in your smart home setup.

## [API](./API.md)

The API node provides access to all points of the Home Assistant WebSocket and HTTP API. This enables you to interact programmatically with Home Assistant, sending and receiving data through these protocols. It’s a powerful tool for integrating third-party systems, custom automations, or advanced control within Node-RED, offering full access to Home Assistant's core functionalities.

## [Binary Sensor](./binary-sensor.md)

This node allows you to create a binary sensor entity within Home Assistant that can be controlled directly from Node-RED. A binary sensor is a type of entity that has only two possible states: typically "on" or "off". It can represent various real-world conditions, such as whether a door is open or closed, or if motion is detected.

## [Button](./button.md)

The Button node creates a button entity within Home Assistant that, when pressed, triggers a flow in Node-RED. This is useful for manual triggers within automations, allowing users to start an automation sequence directly from the Home Assistant interface with a simple click.

## [Calendar](./events-calendar.md)

The Calendar node listens for events from Home Assistant's calendar integration. It triggers a flow in Node-RED when a calendar event starts or ends, allowing you to automate actions based on your calendar schedule.

## [Current State](./current-state.md)

This node is used to fetch the last known state of any entity within Home Assistant when it receives an input. It’s useful for making decisions based on the current status of entities, such as checking if a light is already on before turning it off, or determining the temperature reading before adjusting the thermostat.

## [Device](./device.md)

The Device node enables you to create device automations and call device actions within Home Assistant. This node interacts with devices connected to your Home Assistant instance, allowing you to perform tasks such as turning devices on or off, changing settings, or triggering specific device-related actions.

## [Device Config](./device-config.md)

The Device Config node is used for configuring devices that have been added to Home Assistant. It allows you to set up and manage device-specific settings and options within Node-RED, ensuring that your automations can correctly interact with your devices.

## [Entity Config](./entity-config.md)

The Entity Config node provides configuration options for the different entity type nodes within Node-RED. It’s used to set up and manage the properties and settings for entities, ensuring they behave as expected within your automations and Home Assistant environment.

## [Events: all](./events-all.md)

This node listens for all types of events from Home Assistant, with the ability to filter by event type. It’s a powerful tool for triggering automations based on specific events occurring within Home Assistant, such as state changes, sensor readings, or user interactions.

## [Events: state](events-state.md)

The Events: State node listens for state changes of entities within Home Assistant. It triggers a flow in Node-RED whenever an entity's state changes, allowing you to automate responses to various conditions, like turning on lights when motion is detected or sending a notification when a door is opened.

## [Fire Event](./fire-event.md)

The Fire Event node allows you to fire an event on the Home Assistant event bus. This can be used to trigger automations or notify other parts of the system about specific occurrences. It’s a way to programmatically generate events that other nodes or systems can listen to and react upon.

## [Get Entities](./get-entities.md)

The Get Entities node retrieves entities based on specific search criteria, with three different output options. This node is useful for filtering and finding entities that match certain conditions, such as all lights that are currently on, or sensors reporting a specific range of values.

## [Get History](./get-history.md)

The Get History node fetches the history of Home Assistant entities based on input criteria. This can be used to analyze past states or events, such as tracking temperature changes over time or reviewing when a door was last opened. It’s useful for creating more complex automations based on historical data.

## [Number](./number.md)

The Number node creates a number entity in Home Assistant that can be manipulated from within Node-RED. This entity type is typically used to represent numeric values that can be adjusted, such as a thermostat setting or a brightness level for lights.

## [Poll State](./poll-state.md)

The Poll State node outputs the state of an entity at regular intervals. It can also be configured to trigger at startup and whenever the entity changes state, if desired. This node is useful for regularly checking the status of an entity, ensuring your automations stay up to date with the latest information.

## [Render Template](./render-template.md)

The Render Template node allows you to render templates based on input data. Templates in Home Assistant are powerful tools for dynamically generating text or values based on the state of entities or other variables. This node sends the template to Home Assistant for rendering and outputs the result.

## [Select](./select.md)

The Select node creates a select entity in Home Assistant that can be manipulated from Node-RED. This type of entity typically represents a dropdown menu or a list of options from which the user can choose, and it can be used to control or adjust settings within your automations.

## [Sensor](./sensor.md)

The Sensor node creates a sensor entity within Home Assistant that is controlled from Node-RED. Sensors are entities that report data from various sources, such as temperature, humidity, or motion detection. This node allows you to create and manage such sensors directly from your Node-RED flows.

## [Sentence](./sentence.md)

The Sentence node triggers when the Home Assistant Assist feature matches a sentence from a voice assistant using the default conversation agent. This node is used for voice control integrations, allowing specific voice commands to trigger automations within Node-RED.

## [Server Config](./config-server.md)

The Server Config node is used for configuring the connection to Home Assistant. This node manages the details of how Node-RED communicates with your Home Assistant instance, including server URL, authentication, and other connection settings.

## [Switch](./switch.md)

The Switch node creates a switch entity within Home Assistant that can be controlled from Node-RED. This node also allows a flow to be started from a service call, making it a versatile tool for both controlling devices and triggering automations.

## [Tag](./tag.md)

The Tag node outputs data when Home Assistant receives a tag scanned event for a configured tag ID. This node is useful for creating automations based on NFC tags or other scannable identifiers, allowing specific actions to be triggered when a tag is scanned.

## [Text](./text.md)

The Text node creates a text entity within Home Assistant that can be manipulated from Node-RED. Text entities are used to store and display text values, and this node allows you to dynamically update and control these values within your automations.

## [Time](./time.md)

The Time node can be scheduled to trigger at a specific future date and time, based on a Home Assistant entity. This node is useful for creating time-based automations, such as triggering a notification or alarm at a specific hour.

## [Time Entity](./time-entity.md)

The Time Entity node creates a time entity within Home Assistant that can be controlled from Node-RED. This entity type is used to represent time values, such as a specific time of day or a duration, and can be used to trigger automations based on time-related conditions.

## [Trigger: state](./trigger-state.md)

The Trigger: State node functions similarly to the State Changed Node but provides advanced functionality for common automation use cases. This node allows for more complex conditions and actions based on entity state changes, making it a powerful tool for creating detailed and nuanced automations.

## [Update Config](./update-config.md)

The Update Config node allows you to update the configuration of entities within Home Assistant. This node is used for dynamically adjusting the settings of entities, ensuring they stay in sync with your automation requirements.

## [Wait Until](./wait-until.md)

The Wait Until node waits for a specific condition to be met or for a timeout to occur before passing on the last received message. This node is useful for pausing the flow of automation until certain criteria are met, such as waiting for a door to close before turning off the lights.

## [Webhook](./webhook.md)

The Webhook node outputs data received from a created webhook in Home Assistant. Webhooks are a way to receive data or trigger automations from external sources, and this node allows you to integrate those triggers into your Node-RED flows.

## [Zone](./zone.md)

The Zone node outputs data when a configured entity enters or leaves one of the defined zones in Home Assistant. Zones are geographical areas you define in Home Assistant, and this node can trigger automations based on whether entities (like phones or trackers) enter or exit these zones.
