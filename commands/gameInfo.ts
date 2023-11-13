import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { games } from "../index.js"

export default class Cmd extends Component {
	constructor(client: CrossBuild) {
		super("game-info", "command", client, {
			description: "List games!",
		})
	}

	override async run(interaction: ReceivedInteraction) {
		return interaction.reply({
			content: JSON.stringify(games),
		})
	}
}
