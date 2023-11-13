import { randomUUID } from "crypto"
import { Player } from "./Player.js"
import { Turn } from "./Turn.js"
import { GeneratedMessage, GeneratedMessageObject } from "crossbuild"
import { bot } from "../index.js"
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

	startGame() {
		this.status = "started"
		this.activeTurn = new Turn(this.players[0])
		this.sendMessage({
			content: `<@${this.activeTurn.player.id}>, it's your turn!`,
			embeds: this.generateCard(this.activeTurn.player.id),
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

	getNextPlayer() {
		const allPlayers = this.players.filter(
			(x) => x.remainingCategoryCount() > 0
		)
		if (allPlayers.length === 0) return this.endGame()
		const index = allPlayers.indexOf(this.activeTurn!.player)
		let player: Player
		if (index === this.players.length - 1) {
			player = this.players[0]
		} else {
			player = this.players[index + 1]
		}
		return player
	}

	sendMessage(message: GeneratedMessage) {
		const channel = (
			bot.modules.get("discordInteraction")!.client as Client
		).channels.resolve(this.channelId) as TextBasedChannel | null
		if (!channel) throw new Error("uh")

		channel.send(message)
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
}
