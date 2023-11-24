import { randomUUID } from "crypto"
import { Player, ScorecardKey } from "./Player.js"
import { Turn } from "./Turn.js"
import { GeneratedMessage } from "crossbuild"
import { bot, diceEmoji } from "../index.js"
import { Client, TextBasedChannel, EmbedBuilder } from "discord.js"

/**
 * This class is the main class for the game. It stores all the data for the game, as well as the players and active turn.
 */
export class Game {
	/** An ID to use internally for the game */
	id = randomUUID()
	/** The player who started the game originally */
	owner: string
	/** The players in the game */
	players: Player[] = []
	/** The active turn */
	activeTurn: Turn | null = null
	/** The status of the game */
	status: "joining" | "started" | "ended" = "joining"
	/** The channel ID to send messages to */
	channelId: string
	/** The message ID of the message to edit, null if there is no message yet */
	messageId: string | null = null
	constructor(ownerId: string, channelId: string) {
		this.owner = ownerId
		this.channelId = channelId
		this.addPlayer(ownerId, true)
	}

	/**
	 * Get a player by their ID
	 * @param id The ID of the player to get
	 * @returns The player object you requested, or null if it can't find one
	 */
	getPlayer(id: string) {
		return this.players.find((player) => player.id === id)
	}

	/**
	 * Add a player to the game
	 * @param id The ID of the player to add
	 * @param noMessage Set to true to not update the joining message
	 */
	addPlayer(id: string, noMessage = false) {
		this.players.push(new Player(id))
		if (!noMessage) this.sendMessage(this.generateJoiningMessage())
	}

	/**
	 * Start the game, and trigger the first scorecard send using firstRoll
	 */
	async startGame() {
		this.status = "started"
		this.activeTurn = new Turn(this.players[0].id)
		await this.deleteOldMessage()
		await this.sendMessage(this.generateMessage("firstRoll"), false)
	}

	/**
	 * End the game and calculate the winner, and send a message with the standings
	 * @returns The message sent when the game ends
	 */
	async endGame() {
		this.status = "ended"
		const winner = this.players.reduce((prev, curr) =>
			prev.getTotal("overall") > curr.getTotal("overall") ? prev : curr
		)
		await this.deleteOldMessage()
		return this.sendMessage(
			{
				content: `**Standings**\n${this.players
					.map((x) => `<@${x.id}>: ${x.getTotal("overall")}`)
					.join("\n")}\n\n<@${
					winner.id
				}> won the game with ${winner.getTotal("overall")} points`,
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "View your Scorecard",
								style: 2,
								custom_id: `view:${this.id}`,
							},
						],
					},
				],
			},
			false
		)
	}

	/**
	 * Start the next player's turn, or end the game if there are no more players
	 */
	async startNextPlayer() {
		// get the next player from the queue that have remainingCategoryCount greater than 0
		const allPlayers = this.players
			.filter((x) => x.remainingCategoryCount() > 0)
			.sort((a, b) =>
				a.remainingCategoryCount() > b.remainingCategoryCount() ? 1 : -1
			)
		if (allPlayers.length === 0) {
			await this.endGame()
			return
		}
		const player = allPlayers[0]
		await this.deleteOldMessage()
		this.activeTurn = new Turn(player.id)
		await this.sendMessage(this.generateMessage("firstRoll"), false)
	}

	/**
	 * Send or edit the active game message in Discord
	 * @param message The message to send
	 * @param edit Set to false to force a new message to be sent
	 */
	async sendMessage(message: GeneratedMessage, edit = true) {
		const channel = (
			bot.modules.get("discordInteraction")!.client as Client
		).channels.resolve(this.channelId) as TextBasedChannel | null
		if (!channel) throw new Error("uh")

		if (edit) {
			const messageFetched = this.messageId
				? (
						(
							bot.modules.get("discordInteraction")!
								.client as Client
						).channels.resolve(this.channelId) as TextBasedChannel
				  ).messages.resolve(this.messageId)
				: null
			if (messageFetched) {
				messageFetched.edit(message)
				return
			}
			const m = await channel.send(message)
			this.messageId = m.id
		} else {
			const m = await channel.send(message)
			this.messageId = m.id
		}
	}

	/**
	 * Delete the active game message in Discord
	 */
	async deleteOldMessage() {
		if (!this.messageId) throw new Error("uh")
		const message = await (
			(
				bot.modules.get("discordInteraction")!.client as Client
			).channels.resolve(this.channelId) as TextBasedChannel
		).messages
			.fetch(this.messageId)
			.catch(() => {})
		if (message) await message.delete().catch(() => {})
	}

	/**
	 * Roll the dice for the active player and update the message
	 * @param playerId The player ID to run the turn for
	 * @param resend Whether this is a resend of the message or a fresh roll
	 * @returns
	 */
	async runTurn(
		playerId: (typeof this.players)[number]["id"],
		resend = false
	) {
		const player = this.getPlayer(playerId)!
		if (!this.activeTurn)
			throw new Error("There is no active turn. Is the game running?")
		if (this.activeTurn.playerId !== player.id)
			throw new Error("It is not your turn!")

		if (this.activeTurn.rolls >= 3) {
			throw new Error("You are out of rolls. Score your dice!")
		}
		if (!resend) this.activeTurn.roll()

		if (this.messageId) {
			const message = (
				(
					bot.modules.get("discordInteraction")!.client as Client
				).channels.resolve(this.channelId) as TextBasedChannel
			).messages.resolve(this.messageId)
			if (message) return message.edit(this.generateMessage())
		}
		await this.sendMessage(this.generateMessage())
	}

	/**
	 * Generate the message that is sent when the game is in its joining phase
	 * @returns The message to update with
	 */
	generateJoiningMessage(): GeneratedMessage {
		const embed = new EmbedBuilder()
			.setTitle("Yahtzee")
			.addFields([
				{
					name: "Players",
					value: this.players.map((x) => `<@${x.id}>`).join("\n"),
				},
			])
			.toJSON()

		return {
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [
						{
							type: 2,
							label: "Join",
							style: 3,
							custom_id: `join:${this.id}`,
						},
						{
							type: 2,
							label: "Start",
							style: 3,
							custom_id: `start:${this.id}`,
						},
					],
				},
			],
		}
	}

	/**
	 * Generate the message that is sent when the game is in its active phase
	 * @param type The type of message to generate
	 * @param playerOverride The player ID to use for the message, defaults to the active player
	 * @returns
	 */
	generateMessage(type?: "firstRoll" | "total", playerOverride?: string) {
		if (!this.activeTurn) throw new Error("uh")
		const player = this.getPlayer(
			playerOverride ?? this.activeTurn.playerId
		)
		if (!player) throw new Error("uh")

		// Create the main embed
		const embed = new EmbedBuilder()
			.setDescription(`**<@${player.id}>'s Scorecard**`)
			.addFields([
				{
					name: "Upper Section",
					value: `\`\`\`┌────────────────┬─────┐
│ Aces           │ ${`${player.scorecard.aces ?? ""}`.padEnd(3)} │
│ Twos           │ ${`${player.scorecard.twos ?? ""}`.padEnd(3)} │
│ Threes         │ ${`${player.scorecard.threes ?? ""}`.padEnd(3)} │
│ Fours          │ ${`${player.scorecard.fours ?? ""}`.padEnd(3)} │
│ Fives          │ ${`${player.scorecard.fives ?? ""}`.padEnd(3)} │
│ Sixes          │ ${`${player.scorecard.sixes ?? ""}`.padEnd(3)} │
${
	type === "total"
		? `│ Subtotal       │ ${`${player.getTotal("upper")}`.padEnd(3)} │
│ Bonus (if >63) │ ${`${player.getUpperBonus()}`.padEnd(3)} │
│ Total          │ ${`${player.getTotal("upper")}`.padEnd(3)} │`
		: `│ Total          │ ${`${player.getTotal("upperNoBonus")}`.padEnd(
				3
		  )} │`
}
└────────────────┴─────┘\`\`\``,
				},
				{
					name: "Lower Section",
					value: `\`\`\`┌────────────────┬─────┐
│ 3 of a Kind    │ ${`${player.scorecard.threeOfAKind ?? ""}`.padEnd(3)} │
│ 4 of a Kind    │ ${`${player.scorecard.fourOfAKind ?? ""}`.padEnd(3)} │
│ Full House     │ ${`${player.scorecard.fullHouse ?? ""}`.padEnd(3)} │
│ Small Straight │ ${`${player.scorecard.smallStraight ?? ""}`.padEnd(3)} │
│ Large Straight │ ${`${player.scorecard.largeStraight ?? ""}`.padEnd(3)} │
│ Yahtzee        │ ${`${player.scorecard.yahtzee ?? ""}`.padEnd(3)} │
│ Chance         │ ${`${player.scorecard.chance ?? ""}`.padEnd(3)} │
${
	player.scorecard.yahtzeeBonus
		? `│ Yahtzee Bonus  │ ${`${player.scorecard.yahtzeeBonus ?? ""}`.padEnd(
				3
		  )} │
│ Total          │ ${`${player.getTotal("lower")}`.padEnd(3)} │
└────────────────┴─────┘\`\`\``
		: `│ Total          │ ${`${player.getTotal("lower")}`.padEnd(3)} │
└────────────────┴─────┘\`\`\``
}`,
				},
			])

			.setColor(0x3a834c)
			.toJSON()

		// Add the total section if needed and send the message
		if (type === "total") {
			embed.fields?.push({
				name: "Total",
				value: `\`\`\`┌────────────────┬─────┐
│ Lower Section  │ ${`${player.getTotal("lower")}`.padEnd(3)} │
│ Upper Section  │ ${`${player.getTotal("upper")}`.padEnd(3)} │
│ Total          │ ${`${player.getTotal("overall")}`.padEnd(3)} │
└────────────────┴─────┘\`\`\``,
			})

			return {
				embeds: [embed],
			}
		}

		// Return the message for the first roll
		if (type === "firstRoll") {
			return {
				content: `Roll ${this.activeTurn.rolls}/3 for <@${player.id}>'`,
				embeds: [embed],
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "Roll Dice",
								style: 3,
								custom_id: `roll:${this.id}`,
							},
						],
					},
				],
			}
		}

		if (!this.activeTurn.dice) throw new Error("uh")

		// Generate the list of categories to score for the dropdown
		const checked: {
			category: ScorecardKey
			name: string
			points: number
		}[] = []
		for (const category of Object.keys(player.scorecard)) {
			const categoryKey = category as ScorecardKey // forcing it to a key instead of a generic string
			if (
				!player.scorecard[categoryKey] &&
				player.scorecard[categoryKey] !== 0 &&
				player.getPointsInCategory(
					categoryKey,
					this.activeTurn.dice
				) !== null
			) {
				checked.push({
					category: categoryKey,
					name: camelCaseToTitleCase(category),
					points: player.getPointsInCategory(
						categoryKey,
						this.activeTurn.dice
					)!,
				})
			}
		}

		return {
			content: `Roll ${this.activeTurn.rolls}/3 for <@${player.id}>`,
			embeds: [embed],
			components: [
				{
					type: 1,
					components: this.activeTurn.dice.map((x, i) => ({
						type: 2,
						style: 2,
						emoji: {
							id:
								diceEmoji[x.value][
									x.locked ? "locked" : "unlocked"
								] ?? diceEmoji[0],
						},
						custom_id: `toggle:${player.id},${this.id},${i}`,
					})),
				},
				{
					type: 1,
					components: [
						{
							type: 2,
							style: 1,
							label: "Reroll Unlocked Dice",
							custom_id: `reroll:${this.id}`,
							disabled:
								this.activeTurn.dice.every((x) => x.locked) ||
								this.activeTurn.rolls >= 3,
						},
						{
							type: 2,
							style: 1,
							label: "Reset Message",
							custom_id: `resend:${this.id}`,
						},
					],
				},
				{
					type: 1,
					components: [
						{
							type: 3,
							custom_id: `score:${this.id}`,
							options: checked.map((x) => ({
								label: `${x.name} (${x.points} point${
									x.points === 1 ? "" : "s"
								})`,
								value: `${x.category}`,
							})),
							placeholder: "Score Dice",
						},
					],
				},
			],
		}
	}

	/**
	 * Score a category for the active player and then start the next player's turn
	 * @param category The category to score
	 */
	async score(category: ScorecardKey) {
		if (!this.activeTurn) throw new Error("uh")
		const player = this.getPlayer(this.activeTurn.playerId)
		if (!player) throw new Error("uh")
		const points = player.getPointsInCategory(
			category,
			this.activeTurn.dice!
		)
		if (points === null) throw new Error("uh")
		player.addPoints(category, points)
		await this.startNextPlayer()
	}
}

/**
 * Convert a camelCase string to Title Case. This is used to convert the scorecard keys to their display names
 * @param str The string to convert in camelCase
 * @returns The converted string in Title Case
 */
const camelCaseToTitleCase = (str: string) =>
	str
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.trim()
