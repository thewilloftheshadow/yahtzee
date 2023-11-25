import {
	CrossBuild,
	CustomCheckFunction,
	DiscordInteractionModule,
	GeneratedMessage,
} from "crossbuild"
import { Game } from "./classes/Game"

export const diceEmoji = {
	0: {
		locked: "1173655985986994218",
		unlocked: "1173655985986994218",
	},
	1: {
		locked: "1176069596780953630",
		unlocked: "1176069624249466880",
	},
	2: {
		locked: "1176069598068613221",
		unlocked: "1176069625952350218",
	},
	3: {
		locked: "1176069599763103765",
		unlocked: "1176069627659419719",
	},
	4: {
		locked: "1176069601872855060",
		unlocked: "1176069629051949058",
	},
	5: {
		locked: "1176069603487658015",
		unlocked: "1176069631044231208",
	},
	6: {
		locked: "1176069604716597258",
		unlocked: "1176069632361246801",
	},
} as const

export const games: Array<Game> = []

export const getGame = (id: string) => {
	return games.find((game) => game.id === id)
}

export const getPlayerGame = (id: string) => {
	return games.find((game) => game.status !== "ended" && game.players.find((p) => p.id === id))
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

const notInGame: CustomCheckFunction = async (interaction) => {
	if (!interaction.user) throw new Error("uh")
	const game = getPlayerGame(interaction.user.id)
	console.log(game)
	if (getPlayerGame(interaction.user.id)) {
		return {
			content: "You are already in a game",
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
	if (game.activeTurn?.playerId !== interaction.user!.id) {
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
	componentPaths: ["./commands", "./buttons", "./selectMenus"],
	customChecks: [isInGame, isGameOwner, isYourTurn, notInGame],
})

bot.on("debug", (message) => console.log(message))
bot.on("error", (error) => console.error(error))
bot.on("warn", (warning) => console.warn(warning))
bot.on("ready", () => console.log("Ready!"))
