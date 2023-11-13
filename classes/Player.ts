type Scorecard = {
	aces: number | null
	twos: number | null
	threes: number | null
	fours: number | null
	fives: number | null
	sixes: number | null
	threeOfAKind: boolean
	fourOfAKind: boolean
	fullHouse: boolean
	smallStraight: boolean
	largeStraight: boolean
	yahtzee: boolean
	chance: {
		one: number
		two: number
		three: number
		four: number
		five: number
	} | null
	yahtzeeBonus: number | null
}

export class Player {
	id: string
	scorecard: Scorecard = {
		aces: null,
		twos: null,
		threes: null,
		fours: null,
		fives: null,
		sixes: null,
		threeOfAKind: false,
		fourOfAKind: false,
		fullHouse: false,
		smallStraight: false,
		largeStraight: false,
		yahtzee: false,
		chance: null,
		yahtzeeBonus: null,
	}
	constructor(id: string) {
		this.id = id
	}

	remainingCategoryCount() {
		return Object.values(this.scorecard).filter(
			(x) => x === null || x === false
		).length
	}
}
