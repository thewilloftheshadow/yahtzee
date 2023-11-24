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

/**
 * A Player is the class that contains the scorecard of a player in a game
 */
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

	/**
	 * @returns The number of categories that have not been scored yet
	 */
	remainingCategoryCount() {
		return Object.keys(this.scorecard).filter(
			(x) =>
				this.scorecard[x as ScorecardKey] === null &&
				x !== "yahtzeeBonus"
		).length
	}

	/**
	 * Add points to a category on the scorecard
	 * @param category The category to add points to
	 * @param points The number of points to add
	 */
	addPoints(category: ScorecardKey, points: number) {
		if (this.scorecard[category] !== null) throw new Error("uh")
		this.scorecard[category] = points
	}

	/**
	 * @returns If the upper section total is 63 or higher, return 35, otherwise return 0
	 */
	getUpperBonus() {
		const upperTotal = this.getTotal("upper")
		if (upperTotal >= 63) return 35
		return 0
	}

	/**
	 * Get the total score of either a section or the overall scorecard
	 * @param section The section to get the total of
	 * @returns The total of the section
	 */
	getTotal(section: "upper" | "lower" | "overall" | "upperNoBonus"): number {
		switch (section) {
			case "upper":
				return this.getTotal("upperNoBonus") + this.getUpperBonus()
			case "upperNoBonus":
				return (
					(this.scorecard.aces ?? 0) +
					(this.scorecard.twos ?? 0) +
					(this.scorecard.threes ?? 0) +
					(this.scorecard.fours ?? 0) +
					(this.scorecard.fives ?? 0) +
					(this.scorecard.sixes ?? 0)
				)
			case "lower":
				return (
					(this.scorecard.threeOfAKind ?? 0) +
					(this.scorecard.fourOfAKind ?? 0) +
					(this.scorecard.fullHouse ?? 0) +
					(this.scorecard.smallStraight ?? 0) +
					(this.scorecard.largeStraight ?? 0) +
					(this.scorecard.yahtzee ?? 0) +
					(this.scorecard.chance ?? 0) +
					(this.scorecard.yahtzeeBonus ?? 0)
				)
			case "overall":
				return this.getTotal("upper") + this.getTotal("lower")
		}
	}

	/**
	 * Get the points of each category, used for the scorecard message
	 */
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
