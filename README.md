# Yahtzee

This is a Discord bot that allows you to play Yahtzee with your friends.

It was written for the JT-99 Discord Bot Competition in November of 2023.

[The hosted version can be found here.](https://discord.com/api/oauth2/authorize?client_id=540212892062973962&permissions=274878254080&scope=applications.commands%20bot)

Fun fact: all the die emojis used in this bot were [hand designed myself from scratch](https://www.figma.com/file/vTx9cJBoLRaHm9IkwmBVVw/Dice?type=design&node-id=0%3A1&mode=design&t=ETIqYUlHfy9tPL54-1)!

## Commands

-   /yahtzee - Starts a new game of Yahtzee
-   /game-info - Sends a debug message of all the active games.
-   /help - Sends a help message.
-   /ping - Sends a ping message.

## Structure

The game is created using Classes in Typescript, and this was done so that functions could be attached to one central place. All of the active games are stored in an array exported in index.ts, rather than a database, solely for simplicity.

### Classes

#### Game

The game class is the main class that is used to create a game. It contains all the information about the game, such as the players, the current round, the current player, etc.

#### Player

The player class is used to create a player. It contains all the information about the player, such as their ID and their scorecard

It also has the functions to score and manipulate the scorecard.

#### Turn

The turn class is used to create a turn. It contains all the information about the turn, such as the player, the roll count, and the active dice.

It also has the functions to reroll the dice.

## How to Run

1. Clone the repository
2. Run `pnpm install`
3. Copy the `.env.example` file and rename it to `.env`
4. Fill in the `.env` file with your bot token
5. Run `pnpm run dev`