# Vacation Mode

Four steps to adding a vacation mode to your home and having
lights turn on and off at random intervals. It also automatically prompts you with a
notification about turning on vacation mode if you have been gone longer than 24 hours.

![screenshot](./images/vacation-mode_01.png)

#### Full Export

@[code](@examples/cookbook/vacation-mode/full_export.json)

## Step 1

Create an input boolean in Home Assistant that will control if the house is in vacation mode.

![screenshot](./images/vacation-mode_02.png)

or via the helpers menu in the Home Assistant UI or add it manually in YAML

```yaml
input_boolean:
  vacation_mode:
    name: Vacation Mode
    icon: mdi:beach
```

## Step 2

Create a flow that will automatically change the vacation mode to off if we
come home. Secondly will send our phone an actionable notification for android asking
if we want to turn on vacation mode if we have been gone longer than 24
hours.

![screenshot](./images/vacation-mode_03.png)

@[code](@examples/cookbook/vacation-mode/step_02.json)

**Also See**

- [Actionable notifactions subflow for android](./actionable-notifications-subflow-for-android.html)

## Step 3

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

## Step 4

This flow will run between sunset and midnight turning lights on and off at
random intervals if vacation mode is enabled.

![screenshot](./images/vacation-mode_04.png)

@[code](@examples/cookbook/vacation-mode/step_04.json)
