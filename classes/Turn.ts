import { Player } from "./Player.js"

type Die = {
	value: 0 | 1 | 2 | 3 | 4 | 5 | 6
	locked: boolean
}

type Dice = [Die, Die, Die, Die, Die] | null

export class Turn {
	playerId: Player["id"]
	dice: Dice = null
	rolls = 0
	messageId?: string
	constructor(playerId: Player["id"]) {
		this.playerId = playerId
	}
	roll() {
		if (!this.dice)
			this.dice = [
				{ value: 0, locked: false },
				{ value: 0, locked: false },
				{ value: 0, locked: false },
				{ value: 0, locked: false },
				{ value: 0, locked: false },
			]
		this.dice
			.filter((x) => !x.locked)
			.map((x) => {
				x.value = (Math.floor(Math.random() * 6) + 1) as Die["value"]
			})
		this.rolls += 1
	}

	toggleDice(index: number) {
		if (!this.dice) throw new Error("uh")
		this.dice[index].locked = !this.dice[index].locked
		return this.dice
	}
}
