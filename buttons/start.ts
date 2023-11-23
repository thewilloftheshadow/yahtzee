import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { getGame } from "../index.js"

export default class Btn extends Component {
	constructor(client: CrossBuild) {
		super("start", "button", client, {
			customChecks: ["isGameOwner"],
		})
	}

	override async run(interaction: ReceivedInteraction) {
		try {
			// check if we have a valid game
			if (!interaction.user) throw new Error("uh")
			const gameId = interaction.key.split(":")[1]

			const game = getGame(gameId)
			if (!game)
				return interaction.reply({
					content: "Game not found",
					ephemeral: true,
				})

			// no response
			await interaction.acknowledge({})

			// start the game
			game.startGame()
		} catch (e) {
			await interaction.reply({
				content: "An error occurred",
				ephemeral: true,
			})
			console.error(e)
		}
	}
}
