import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { getGame } from "../index.js"
import { ScorecardKey } from "../classes/Player.js"

export default class Btn extends Component {
	constructor(client: CrossBuild) {
		super("score", "selectMenu", client, {
			customChecks: ["isInGame", "isYourTurn"],
		})
	}

	override async run(interaction: ReceivedInteraction) {
		try {
			if (!interaction.user) throw new Error("uh")
			const gameId = interaction.key.split(":")[1]

			const game = getGame(gameId)
			if (!game)
				return interaction.reply({
					content: "Game not found",
					ephemeral: true,
				})

			const selected =
				interaction.selectMenuValues?.shift() as ScorecardKey // get first element
			if (!selected) throw new Error("uh")

			await interaction.acknowledge({})

			game.score(selected)
		} catch (e) {
			await interaction.reply({
				content: "An error occurred",
				ephemeral: true,
			})
			console.error(e)
		}
	}
}
