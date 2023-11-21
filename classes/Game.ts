import { randomUUID } from "crypto"
import { Player, ScorecardKey } from "./Player.js"
import { Turn } from "./Turn.js"
import { GeneratedMessage, GeneratedMessageObject } from "crossbuild"
import { bot, diceEmoji } from "../index.js"
import { Client, EmbedBuilder, TextBasedChannel } from "discord.js"

export class Game {
	id = randomUUID()
	owner: string
	players: Player[] = []
	activeTurn: Turn | null = null
	status: "joining" | "started" | "ended" = "joining"
	channelId: string
	constructor(ownerId: string, channelId: string) {
		this.owner = ownerId
		this.addPlayer(ownerId)
		this.channelId = channelId
	}

	getPlayer(id: string) {
		return this.players.find((player) => player.id === id)
	}

	addPlayer(id: string) {
		this.players.push(new Player(id))
	}

	async startGame() {
		this.status = "started"
		this.activeTurn = new Turn(this.players[0].id)
		this.activeTurn.messageId = await this.sendMessage({
			content: `<@${this.activeTurn.playerId}>, it's your turn!`,
			embeds: this.generateCard(this.activeTurn.playerId),
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
		})
	}

	endGame() {
		this.status = "ended"
	}

	async startNextPlayer() {
		const allPlayers = this.players.filter(
			(x) => x.remainingCategoryCount() > 0
		)
		if (allPlayers.length === 0) return this.endGame()
		const index = allPlayers.findIndex(
			(x) => x.id === this.activeTurn!.playerId
		)
		let player: Player
		if (index === this.players.length - 1) {
			player = this.players[0]
		} else {
			player = this.players[index + 1]
		}
		this.activeTurn = new Turn(player.id)
		await this.deleteOldMessage()
		this.activeTurn.messageId = await this.sendMessage({
			content: `<@${this.activeTurn.playerId}>, it's your turn!`,
			embeds: this.generateCard(this.activeTurn.playerId),
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
		})
	}

	async sendMessage(message: GeneratedMessage) {
		const channel = (
			bot.modules.get("discordInteraction")!.client as Client
		).channels.resolve(this.channelId) as TextBasedChannel | null
		if (!channel) throw new Error("uh")

		const m = await channel.send(message)
		return m.id
	}

	async deleteOldMessage() {
		if (!this.activeTurn?.messageId) throw new Error("uh")
		const message = (
			(
				bot.modules.get("discordInteraction")!.client as Client
			).channels.resolve(this.channelId) as TextBasedChannel
		).messages.resolve(this.activeTurn.messageId)
		if (message) await message.delete().catch(() => {})
	}

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

		if (this.activeTurn.messageId) {
			const message = (
				(
					bot.modules.get("discordInteraction")!.client as Client
				).channels.resolve(this.channelId) as TextBasedChannel
			).messages.resolve(this.activeTurn.messageId)
			if (message)
				return message.edit({
					content: `Roll ${this.activeTurn.rolls}/3`,
					components: [
						...this.generateButtons(
							this.activeTurn.dice!,
							this.activeTurn.rolls,
							this.activeTurn.playerId
						),
						...this.generateScoreDropdown(this.activeTurn.dice!),
					],
				})
		}
		this.activeTurn.messageId = await this.sendMessage({
			content: `Roll ${this.activeTurn.rolls}/3`,
			embeds: this.generateCard(this.activeTurn.playerId),
			components: [
				...this.generateButtons(
					this.activeTurn.dice!,
					this.activeTurn.rolls,
					this.activeTurn.playerId
				),
				...this.generateScoreDropdown(this.activeTurn.dice!),
			],
		})
	}

	generateScoreDropdown(dice: NonNullable<typeof Turn.prototype.dice>) {
		if (!this.activeTurn) throw new Error("uh")
		const player = this.getPlayer(this.activeTurn.playerId)
		if (!player) throw new Error("uh")
		const checked: {
			category: ScorecardKey
			name: string
			points: number
		}[] = []
		for (const category of Object.keys(player.scorecard)) {
			const categoryKey = category as ScorecardKey
			console.log(categoryKey)
			if (
				!player.scorecard[categoryKey] &&
				player.scorecard[categoryKey] !== 0 &&
				player.getPointsInCategory(categoryKey, dice) !== null
			) {
				checked.push({
					category: categoryKey,
					name: camelCaseToTitleCase(category),
					points: player.getPointsInCategory(categoryKey, dice)!,
				})
			}
		}

		console.log(checked)

		const row: GeneratedMessageObject["components"] = [
			{
				type: 1,
				components: [
					{
						type: 3,
						custom_id: `score:${this.id}`,
						options: checked.map((x) => ({
							label: `${x.name} (${x.points} point${
								x.points === 1 ? "" : "s"
							}})`,
							value: `${x.category}`,
						})),
						placeholder: "Score Dice",
					},
				],
			},
		]
		console.log(JSON.stringify(row, null, 2))
		return row
	}

	generateButtons(
		dice: NonNullable<typeof Turn.prototype.dice>,
		turnCount: number,
		playerId: string
	) {
		const row: GeneratedMessageObject["components"] = [
			{
				type: 1,
				components: dice.map((x, i) => ({
					type: 2,
					style: 2,
					emoji: {
						id:
							diceEmoji[x.value][
								x.locked ? "locked" : "unlocked"
							] ?? diceEmoji[0],
					},
					custom_id: `toggle:${playerId},${this.id},${i}`,
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
						disabled: dice.every((x) => x.locked) || turnCount >= 3,
					},
					{
						type: 2,
						style: 1,
						label: "Reset Message",
						custom_id: `resend:${this.id}`,
					},
				],
			},
		]
		return row
	}

	generateCard(
		playerId: (typeof this.players)[number]["id"]
	): GeneratedMessageObject["embeds"] {
		const player = this.getPlayer(playerId)!
		return [
			new EmbedBuilder()
				.setTitle("Yahtzee")
				.setDescription(`<@${player.id}>'s Scorecard`)
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
└────────────────┴─────┘\`\`\``,
					},
					{
						name: "Lower Section",
						value: `\`\`\`┌────────────────┬─────┐
│ 3 of a Kind    │ ${`${player.scorecard.threeOfAKind || ""}`.padEnd(3)} │
│ 4 of a Kind    │ ${`${player.scorecard.fourOfAKind || ""}`.padEnd(3)} │
│ Full House     │ ${`${player.scorecard.fullHouse || ""}`.padEnd(3)} │
│ Small Straight │ ${`${player.scorecard.smallStraight || ""}`.padEnd(3)} │
│ Large Straight │ ${`${player.scorecard.largeStraight || ""}`.padEnd(3)} │
│ Yahtzee        │ ${`${player.scorecard.yahtzee || ""}`.padEnd(3)} │
│ Chance         │ ${`${player.scorecard.chance ?? ""}`.padEnd(3)} │
│ Yahtzee Bonus  │ ${`${player.scorecard.yahtzeeBonus ?? ""}`.padEnd(3)} │
└────────────────┴─────┘\`\`\``,
					},
				])

				.setColor("Random")
				.toJSON(),
		]
	}

	score(category: ScorecardKey) {
		if (!this.activeTurn) throw new Error("uh")
		const player = this.getPlayer(this.activeTurn.playerId)
		if (!player) throw new Error("uh")
		const points = player.getPointsInCategory(
			category,
			this.activeTurn.dice!
		)
		if (points === null) throw new Error("uh")
		player.addPoints(category, points)
		this.startNextPlayer()
		this.runTurn(this.activeTurn.playerId)
	}
}

const camelCaseToTitleCase = (str: string) =>
	str
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.trim()
