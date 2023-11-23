import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { getGame } from "../index.js"

export default class Btn extends Component {
	constructor(client: CrossBuild) {
		super("resend", "button", client, {
			customChecks: ["isInGame", "isYourTurn"],
		})
	}

	override async run(interaction: ReceivedInteraction) {
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

		// resend the message using the resend parameter
		await game.deleteOldMessage()
		game.runTurn(interaction.user.id, true)
	}
}
