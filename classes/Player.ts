import { Turn } from "./Turn"

type Scorecard = {
	aces: number | null
	twos: number | null
	threes: number | null
	fours: number | null
	fives: number | null
	sixes: number | null
	threeOfAKind: number | null
	fourOfAKind: number | null
	fullHouse: number | null
	smallStraight: number | null
	largeStraight: number | null
	yahtzee: number | null
	chance: number | null
	yahtzeeBonus: number | null
}

export type ScorecardKey = keyof Scorecard

export class Player {
	id: string
	scorecard: Scorecard = {
		aces: null,
		twos: null,
		threes: null,
		fours: null,
		fives: null,
		sixes: null,
		threeOfAKind: null,
		fourOfAKind: null,
		fullHouse: null,
		smallStraight: null,
		largeStraight: null,
		yahtzee: null,
		chance: null,
		yahtzeeBonus: null,
	}
	constructor(id: string) {
		this.id = id
	}

	remainingCategoryCount() {
		return Object.values(this.scorecard).filter((x) => x === null).length
	}

	addPoints(category: ScorecardKey, points: number) {
		if (this.scorecard[category] !== null) throw new Error("uh")
		this.scorecard[category] = points
	}

	getPointsInCategory(
		category: ScorecardKey,
		dice: typeof Turn.prototype.dice
	) {
		const diceValues = dice!.map((x) => x.value) as number[]
		switch (category) {
			case "aces":
				return diceValues.filter((x) => x === 1).length
			case "twos":
				return diceValues.filter((x) => x === 2).length * 2
			case "threes":
				return diceValues.filter((x) => x === 3).length * 3
			case "fours":
				return diceValues.filter((x) => x === 4).length * 4
			case "fives":
				return diceValues.filter((x) => x === 5).length * 5
			case "sixes":
				return diceValues.filter((x) => x === 6).length * 6
			case "threeOfAKind": {
				const isThree = diceValues.find(
					(x) => diceValues.filter((y) => y === x).length >= 3
				)
				if (!isThree) return 0
				return diceValues.reduce((a, b) => a + b, 0)
			}
			case "fourOfAKind": {
				const isFour = diceValues.find(
					(x) => diceValues.filter((y) => y === x).length >= 4
				)
				if (!isFour) return 0
				return diceValues.reduce((a, b) => a + b, 0)
			}
			case "fullHouse": {
				// check if there is two of one number and three of another and that the two numbers don't match
				const isTwo = diceValues.find(
					(x) => diceValues.filter((y) => y === x).length === 2
				)
				const isThree = diceValues.find(
					(x) => diceValues.filter((y) => y === x).length === 3
				)
				if (!isTwo || !isThree || isTwo === isThree) return 0
				return 25
			}
			case "smallStraight": {
				const isSmallStraight = [
					[1, 2, 3, 4],
					[2, 3, 4, 5],
					[3, 4, 5, 6],
				].find((x) => x.every((y) => diceValues.includes(y)))
				if (!isSmallStraight) return 0
				return 30
			}
			case "largeStraight": {
				const isLargeStraight = [
					[1, 2, 3, 4, 5],
					[2, 3, 4, 5, 6],
				].find((x) => x.every((y) => diceValues.includes(y)))
				if (!isLargeStraight) return 0
				return 40
			}
			case "yahtzee": {
				const isYahtzee = diceValues.every((x) => x === diceValues[0])
				if (!isYahtzee) return 0
				return 50
			}
			case "chance":
				return diceValues.reduce((a, b) => a + b, 0)
			case "yahtzeeBonus": {
				if (!this.scorecard.yahtzee) return null
				const isYahtzeeBonus = diceValues.every(
					(x) => x === diceValues[0]
				)
				if (!isYahtzeeBonus) return 0
				return 100
			}
		}
	}
}
