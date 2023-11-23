import { Component, CrossBuild, ReceivedInteraction } from "crossbuild"
import { Client, chatInputApplicationCommandMention } from "discord.js"

export default class Cmd extends Component {
	constructor(client: CrossBuild) {
		super("help", "command", client, {
			description: "Get help for the bot!",
		})
	}

	override async run(interaction: ReceivedInteraction) {
		const client = this.client.modules.get("discordInteraction")
			?.client as Client
		const commands = await client.application?.commands.fetch()
		const cmds = commands?.map((x) => {
			return `${chatInputApplicationCommandMention(x.name, x.id)} - ${
				x.name === "help" ? "That's this command!" : x.description
			}`
		})
		return interaction.reply({
			embeds: [
				{
					title: "Help",
					description:
						"Welcome to Yahtzee!\n- The goal of the game is to get the highest score possible. You can do this by rolling the dice and getting certain combinations.\n- You can choose to keep dice by clicking on them.\n- Once you choose which dice you want to keep, you can reroll the rest.\n- You can only reroll once per turn.\n- Once you have rolled 3 times, you must choose a combination to score.\n- You can only score each combination once.\n- Once you have scored all combinations, the game is over.\n- The player with the highest score wins!",
					fields: [
						{
							name: "Commands",
							value: `${
								cmds?.join("\n") ?? "Failed to load commands"
							}`,
						},
					],
					color: 0x3a834c,
				},
			],
		})
	}
}
