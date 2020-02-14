---
sidebar: auto
---

# FAQ

## Entities not showing in the autocomplete dropdown

1. Make sure you have at least deployed once after adding a server config.
2. There sometimes is a caching issue. Caching can be disabled for autocomplete
   results in the server config node and restarting Node-RED.

## Entity could not be found in cache for entity_id: ???

If your flow runs before Node-RED has had a chance to connect to Home Assistant
and retrieve the latest state information. The cache will be empty and this
error is thrown.

Home Assistant Add-on users have a 5-second delay between connection attempts because of
how the supervisor proxy works and the high CPU usage it can cause, [Issue
#76](https://github.com/zachowj/node-red-contrib-home-assistant-websocket/issues/76#issuecomment-453877333).
The delay can be turned off in the server config.

## Why do some of my nodes have a yellow font?

Starting with version 0.12.0 individual nodes on the workspace will now have a
version number associated with them. This will allow changes to be made to the
structure of nodes without affecting all nodes of that type until you edit them.
Legacy nodes will have a yellow font until the node has been upgraded to the
current version.

Just because the text is yellow on a node doesn’t mean you need to update it.
It will continue to function just as it has and the next time you modify the node
it will be upgraded then.
