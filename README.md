# Yahtzee

This is a Discord bot that allows you to play Yahtzee with your friends.

It was written for the JT-99 Discord Bot Competition in 2023.

## Commands

-   /yahtzee - Starts a new game of Yahtzee
-   /game-info - Sends a debug message of all the active games.
-   /help - Sends a help message.
-   /ping - Sends a ping message.

## Structure

The game is created using Classes in Typescript, and this was done so that functions could be attached to one central place. All of the active games are stored in an array exported in index.ts, rather than a database, solely for simplicity.

## Classes

### Game

The game class is the main class that is used to create a game. It contains all the information about the game, such as the players, the current round, the current player, etc.

### Player

The player class is used to create a player. It contains all the information about the player, such as their ID and their scorecard

It also has the functions to score and manipulate the scorecard.

### Turn

The turn class is used to create a turn. It contains all the information about the turn, such as the player, the roll count, and the active dice.

It also has the functions to reroll the dice.
