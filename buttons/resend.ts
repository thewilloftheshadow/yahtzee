import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { getGame } from "../index.js"
import { ButtonInteraction } from "discord.js"

export default class Btn extends Component {
	constructor(client: CrossBuild) {
		super("resend", "button", client, {
			customChecks: ["isInGame", "isYourTurn"],
		})
	}

	override async run(interaction: ReceivedInteraction) {
		if (!interaction.user) throw new Error("uh")
		const gameId = interaction.key.split(":")[1]

		const game = getGame(gameId)
		if (!game)
			return interaction.reply({
				content: "Game not found",
				ephemeral: true,
			})

		await interaction.acknowledge({})
		await (interaction.original as ButtonInteraction).message
			.delete()
			.catch(() => {})

		game.runTurn(interaction.user.id, true)
	}
}
