class WhoWroteIt {
  constructor() {
    this.games = [];
  }

  findGame(gameId) {
    try {
      return this.games.filter((game) => game.code === gameId)[0];
    } catch {
      return null;
    }
  }

  findGameAndPlayer(tokenId) {
    try {
      const game = this.games.filter((game) =>
        game.players.some((player) => player.tokenId === tokenId)
      )[0];
      return {
        game: game,
        player: game.players.filter((player) => player.tokenId === tokenId)[0],
      };
    } catch {
      return {
        game: null,
        player: null,
      };
    }
  }

  deleteGame(gameId) {
    try {
      this.games = this.games.filter((game) => game.code !== gameId);
    } catch {
      return "Can't find game";
    }
  }
}

module.exports = WhoWroteIt;
