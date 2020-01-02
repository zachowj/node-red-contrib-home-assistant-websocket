# Vacation Mode

Five steps to adding a vacation mode to your home and having
lights turn on and off at random intervals. It also automatically prompts you with a
notification about turning on vacation mode if you have been gone longer than 24 hours.

## Step 1

Create an input boolean in Home Assistant that will control if the house is in vacation mode.

```yaml
input_boolean:
  vacation_mode:
    name: Vacation Mode
    initial: off
    icon: mdi:beach
```

## Step 2

Create a flow that will automatically change the vacation mode to off if we
come home. Secondly will send our phone an actionable notification asking
if we want to turn on vacation mode if we have been gone longer than 24
hours.

![screenshot](./images/vacation-mode_01.png)

<<< @/examples/cookbook/vacation-mode/step_02.json

## Step 3

This flow will fire when the actionable notification is triggered to activate vacation mode.

![screenshot](./images/vacation-mode_02.png)

<<< @/examples/cookbook/vacation-mode/step_03.json

## Step 4

Set up a group of lights and switches in Home Assistant that you want to turn
on and off while vacation mode is active. This can be done without creating a
group in Home Assistant by modifying the `get-entities` node in the below flow to
`entity_id` `in` `light.night_light,light.kitchen,switch.bedroom_light,switch.laundry_room`.

```yaml
group:
  vacation_lights:
    name: Vacation Lights
    entities:
      - light.night_light
      - light.kitchen
      - switch.bedroom_light
      - switch.laundry_room
```

## Step 5

This flow will run between sunset and midnight turning lights on and off at
random intervals if vacation mode is enabled.

![screenshot](./images/vacation-mode_03.png)

<<< @/examples/cookbook/vacation-mode/step_05.json
