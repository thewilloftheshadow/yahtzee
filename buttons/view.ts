import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { getGame } from "../index.js"

export default class Btn extends Component {
	constructor(client: CrossBuild) {
		super("view", "button", client, {})
	}

	override async run(interaction: ReceivedInteraction) {
		try {
			if (!interaction.user) throw new Error("uh")
			const gameId = interaction.key.split(":")[1]

			const game = getGame(gameId)
			if (!game)
				return interaction.reply({
					content: "Game no longer stored",
					ephemeral: true,
				})

			// send the player's scorecard
			await interaction.reply({
				ephemeral: true,
				...game.generateMessage("total", interaction.user.id),
			})
		} catch (e) {
			await interaction.reply({
				content: "An error occurred",
				ephemeral: true,
			})
			console.error(e)
		}
	}
}
