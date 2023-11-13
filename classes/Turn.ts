import { Player } from "./Player.js"

type Dice = [number, number, number, number, number] | null

export class Turn {
	player: Player
	dice: Dice = null
	rolls = 0
	constructor(player: Player) {
		this.player = player
	}
	roll() {
		const dice: Dice = [0, 0, 0, 0, 0]
		for (let i = 0; i < 5; i++) {
			dice[i] = Math.floor(Math.random() * 6) + 1
		}
		this.rolls += 1
		this.dice = dice
	}
}
