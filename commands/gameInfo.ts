import {
	Component,
	CrossBuild,
	ReceivedInteraction,
	OptionsHandler,
} from "crossbuild"
import { games } from "../index.js"

export default class Cmd extends Component {
	constructor(client: CrossBuild) {
		super("game-info", "command", client, {
			description: "Debug command to show all game data!",
			options: [
				{
					type: "boolean",
					name: "all",
					description: "Show all games, including ended ones",
				},
			],
		})
	}

	override async run(
		interaction: ReceivedInteraction,
		options: OptionsHandler
	) {
		if (options.getBoolean("all") === true)
			return interaction.reply({
				content: JSON.stringify(games),
			})
		return interaction.reply({
			content: JSON.stringify(games.filter((x) => x.status !== "ended")),
		})
	}
}
