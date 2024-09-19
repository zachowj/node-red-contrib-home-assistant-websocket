# Play a Jellyfin Show Using the Sentence Node

This example demonstrates how to use the Sentence node with Home Assistant's conversation integration to play a show from Jellyfin. The flow utilizes dynamic responses to respond with the selected episode.

You can trigger the flow with commands like:

- "Play a random MASH episode"
- "Play MASH episode"
- "Play MASH season six, episode twelve"
- "Play MASH episode 100"

![Flow screenshot](./images/play-jellyfin-show-using-sentence-node_01.png)

![Flow screenshot](./images/play-jellyfin-show-using-sentence-node_02.png)

## Flow Configuration

The flow leverages these nodes:

- [node-red-contrib-random-item](https://flows.nodered.org/node/node-red-contrib-random-item)
- [openapi-red](https://flows.nodered.org/node/openapi-red)

![Flow screenshot](./images/play-jellyfin-show-using-sentence-node_03.png)

@[code](@examples/cookbook/play-jellyfin-show-using-sentence-node/play-jellyfin-show-using-sentence-node.json)

### Setup Instructions

The flow includes nodes to retrieve the necessary data from Jellyfin. Follow these steps to set it up:

1. Install the required nodes.
2. Import the provided flow into Node-RED.
3. Configure the `openapi` node:
   - Use the Jellyfin OpenAPI URL: `https://api.jellyfin.org/openapi/jellyfin-openapi-stable.json`.
   - Enter your Jellyfin server details.
   - Add your API key in the custom header under `X-MediaBrowser-Token`.
4. Adjust the Sentence node to recognize your desired show's name and the season/episode format.
5. In the "get series episodes" node, update the `userId` field with your Jellyfin user ID.
6. Deploy the flow.

![Flow screenshot](./images/play-jellyfin-show-using-sentence-node_04.png)

## Extended Usage

This flow can be expanded to include additional functionality, such as:

- Customizing which devices the show is played on.
- Playing a random episode from a specific show.
- Playing a random episode from a specific season.
- Playing the next unwatched episode from a show.
- Playing the next episode from a show.
- Playing a random episode from a specific genre.
