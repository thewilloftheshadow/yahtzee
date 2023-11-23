import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { games } from "../index.js"
import { Game } from "../classes/Game.js"

export default class Cmd extends Component {
	constructor(client: CrossBuild) {
		super("yahtzee", "command", client, {
			description: "Play a game of Yahtzee!",
			customChecks: ["notInGame"],
		})
	}

	override async run(interaction: ReceivedInteraction) {
		if (!interaction.user || !interaction.channel) throw new Error("uh")
		const newGame = new Game(interaction.user!.id, interaction.channel.id)
		games.push(newGame)
		const m = await interaction.reply(newGame.generateJoiningMessage())
		newGame.messageId = m.id
	}
}
