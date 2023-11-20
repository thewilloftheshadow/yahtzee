import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { getGame } from "../index.js"
import { ButtonInteraction } from "discord.js"

export default class Btn extends Component {
	constructor(client: CrossBuild) {
		super("toggle", "button", client, {
			customChecks: ["isInGame"],
		})
	}

	override async run(interaction: ReceivedInteraction) {
		if (!interaction.user) throw new Error("uh")
		const [playerId, gameId, diceIndex] = interaction.key
			.split(":")[1]
			.split(",")

		const game = getGame(gameId)
		if (!game || !game.activeTurn)
			return interaction.reply({
				content: "Game not found",
				ephemeral: true,
			})

		if (playerId !== interaction.user.id)
			return interaction.reply({
				content: "It's not your turn",
				ephemeral: true,
			})

		await interaction.acknowledge({})

		game.activeTurn.toggleDice(parseInt(diceIndex))

		void (interaction.original as ButtonInteraction).message.edit({
			components: game.generateButtons(
				game.activeTurn.dice!,
				game.activeTurn!.rolls,
				playerId
			),
		})
	}
}
