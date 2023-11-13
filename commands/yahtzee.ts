import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { games } from "../index.js"
import { Game } from "../classes/Game.js"
import { ButtonStyle, ComponentType } from "discord.js"

export default class Cmd extends Component {
	constructor(client: CrossBuild) {
		super("yahtzee", "command", client, {
			description: "Play a game of Yahtzee!",
		})
	}

	override async run(interaction: ReceivedInteraction) {
		if (!interaction.user || !interaction.channel) throw new Error("uh")
		const newGame = new Game(interaction.user!.id, interaction.channel.id)
		games.push(newGame)
		await interaction.reply({
			content: JSON.stringify(newGame, null, 2),
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: "Join",
							style: ButtonStyle.Success,
							custom_id: `join:${newGame.id}`,
						},
						{
							type: ComponentType.Button,
							label: "Start",
							style: ButtonStyle.Success,
							custom_id: `start:${newGame.id}`,
						},
					],
				},
			],
		})
	}
}
