import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"

export default class Cmd extends Component {
	constructor(client: CrossBuild) {
		super("ping", "command", client, {
			description: "Ping!",
		})
	}

	override async run(interaction: ReceivedInteraction) {
		return interaction.reply({
			content: "Pong!",
		})
	}
}
