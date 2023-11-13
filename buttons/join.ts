import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { getGame } from "../index.js"

export default class Btn extends Component {
	constructor(client: CrossBuild) {
		super("join", "button", client, {
			customChecks: [],
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

		if (game.getPlayer(interaction.user!.id))
			return interaction.reply({
				content: "You're already in this game",
				ephemeral: true,
			})

		if (game.status !== "joining")
			return interaction.reply({
				content: "This game has already started",
				ephemeral: true,
			})

		game.addPlayer(interaction.user.id)

		await interaction.reply({
			content: `<@${interaction.user.id}> joined the game!`,
		})
	}
}
