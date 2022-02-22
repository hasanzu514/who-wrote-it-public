class Player {
  constructor(name, host, tokenId) {
    this.socket;
    this.username = name;
    this.connected = true;
    this.host = host;
    this.tokenId = tokenId;
    this.score = 0;
    this.correct = 0;
    this.incorrect = 0;
    this.guess = null;
    this.answerTime = null;
    this.correctArray = []
    this.answerTimeArray = []
  }
}

module.exports = Player;
