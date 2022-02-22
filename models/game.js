const Player = require("./player");

class Game {
  constructor() {
    this.state = {
      step: null,
      section: null,
    };
    this.code = this.generateRandomCode();
    this.players = [];
    this.settings = { numQuestions: 10 };
    this.questionNumber = 0;
    this.locked = false;
    this.winner = null;
    this.data = null;
    this.participants = [];
    this.numReplies = 0;
    this.answer = null;
    this.reply = null;
    this.selectedParticipants;
    this.waiting = true;
    this.questionSentTime = null;
    this.renameArray = [];
    this.finalScores = [];
  }

  deletePlayer(tokenId) {
    this.players = this.players.filter((player) => player.tokenId !== tokenId);
  }

  addPlayer(username, host = false, tokenId) {
    const newPlayer = new Player(username, host, tokenId);
    this.players.push(newPlayer);
    return newPlayer;
  }

  generateRandomCode() {
    return Math.random().toString(36).slice(8);
  }

  getSocketId(username) {
    return this.players.filter((player) => player.username === username)[0]
      .socketId;
  }

  checkAllGuesses(io) {
    if (this.players.filter((player) => player.guess === null).length === 0) {
      this.updateScore();
      this.waiting = false;
      io.to(this.code).emit("ready for answer");
    }
    // return this.players.filter((player) => player.guess === null);
  }

  resetAllGuesses() {
    for (let player of this.players) {
      player.guess = null;
      player.answerTime = null;
    }
  }

  allUsernames() {
    return this.players.map(function (player) {
      return player.username;
    });
  }

  updateScore() {
    const answerTimes = this.players.map((player) => player.answerTime);
    const longestTime = Math.max(...answerTimes);
    for (let player of this.players) {
      if (player.guess === this.answer) {
        player.correct = player.correct + 1;
        player.score =
          player.score + Math.floor((longestTime / player.answerTime) * 10);
      } else {
        player.incorrect = player.incorrect + 1;
      }
    }
  }

  setNextReply(answer, reply, selectedParticipants) {
    this.answer = answer;
    this.reply = reply;
    this.selectedParticipants = selectedParticipants;
    for (let name of this.renameArray) {
      if (name.originalName === answer && name.newName.trim() !== "") {
        this.answer = name.newName;
      }
      if (
        name.newName.trim() !== "" &&
        this.reply.includes(name.originalName)
      ) {
        this.reply = reply.replace(name.originalName, name.newName);
      }
      if (
        this.selectedParticipants.filter(
          (participant) => participant.name === name.originalName
        ).length > 0 &&
        name.newName.trim() !== ""
      ) {
        const index = this.selectedParticipants.findIndex(
          (participant) => participant.name === name.originalName
        );
        this.selectedParticipants[index].name = name.newName;
      }
    }
  }



  setFinalScores() {
    this.finalScores = this.players.map((player) => {
      return { name: player.username, score: player.score };
    });
    this.finalScores.sort((a, b) => b.score - a.score);
  }
}

module.exports = Game;
