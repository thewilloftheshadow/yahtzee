import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { games } from "../index.js"

export default class Cmd extends Component {
	constructor(client: CrossBuild) {
		super("game-info", "command", client, {
			description: "Debug command to show all game data!",
		})
	}

	override async run(interaction: ReceivedInteraction) {
		return interaction.reply({
			content: JSON.stringify(games.filter((x) => x.status !== "ended")),
		})
	}
}
