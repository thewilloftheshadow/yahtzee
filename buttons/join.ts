import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { getGame } from "../index.js"

export default class Btn extends Component {
	constructor(client: CrossBuild) {
		super("join", "button", client, {
			customChecks: ["notInGame"],
		})
	}

	override async run(interaction: ReceivedInteraction) {
		try {
			// Check if we have a valid game to join

			if (!interaction.user) throw new Error("uh")
			const gameId = interaction.key.split(":")[1]
			const game = getGame(gameId)
			if (!game)
				return interaction.reply({
					content: "Game not found",
					ephemeral: true,
				})
			if (game.status !== "joining")
				return interaction.reply({
					content: "This game has already started",
					ephemeral: true,
				})

			// join the game
			game.addPlayer(interaction.user.id)

			// no response
			await interaction.acknowledge({})
		} catch (e) {
			await interaction.reply({
				content: "An error occurred",
				ephemeral: true,
			})
			console.error(e)
		}
	}
}
