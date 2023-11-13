import {
	CrossBuild,
	CustomCheckFunction,
	DiscordInteractionModule,
	GeneratedMessage,
} from "crossbuild"
import { Game } from "./classes/Game"

export const dice = {
	1: "<:die_face_1:1173519585656451154> ",
	2: "<:die_face_2:1173519586562416651> ",
	3: "<:die_face_3:1173519587652939897> ",
	4: "<:die_face_4:1173519588567302184> ",
	5: "<:die_face_5:1173519589431332904>",
	6: "<:die_face_6:1173519590291144765>",
}

export const games: Array<Game> = []

export const getGame = (id: string) => {
	return games.find((game) => game.id === id)
}

export const getPlayerGame = (id: string) => {
	return games.find((game) => game.players.filter((x) => x.id === id))
}

const isInGame: CustomCheckFunction = async (interaction) => {
	if (!interaction.user) throw new Error("uh")
	if (!getPlayerGame(interaction.user.id)) {
		return {
			content: "You are not in a game",
			ephemeral: true,
		} satisfies GeneratedMessage
	}
	return null
}

const isGameOwner: CustomCheckFunction = async (interaction) => {
	if (!interaction.user) throw new Error("uh")
	if (!getPlayerGame(interaction.user.id)) {
		return {
			content: "You are not in a game",
			ephemeral: true,
		} satisfies GeneratedMessage
	}
	if (getPlayerGame(interaction.user.id)!.owner !== interaction.user.id) {
		return {
			content: "You are not the owner of this game",
			ephemeral: true,
		} satisfies GeneratedMessage
	}
	return null
}

const isYourTurn: CustomCheckFunction = async (interaction) => {
	const game = getPlayerGame(interaction.user!.id)
	if (!game) {
		return {
			content: "You are not in a game",
			ephemeral: true,
		} satisfies GeneratedMessage
	}
	if (game.activeTurn?.player.id !== interaction.user!.id) {
		return {
			content: "It's not your turn",
			ephemeral: true,
		} satisfies GeneratedMessage
	}
	return null
}

export const bot = new CrossBuild({
	name: "Yahtzee",
	modules: [
		new DiscordInteractionModule({
			name: "Discord",
			token: process.env.DISCORD_TOKEN!,
			options: {
				intents: ["Guilds"],
			},
		}),
	],
	componentPaths: ["./commands", "./buttons"],
	customChecks: [isInGame, isGameOwner, isYourTurn],
})

bot.on("debug", (message) => console.log(message))
bot.on("error", (error) => console.error(error))
bot.on("warn", (warning) => console.warn(warning))
bot.on("ready", () => console.log("Ready!"))
