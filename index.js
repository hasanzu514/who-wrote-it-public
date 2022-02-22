const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const convertFacebookToJSON = require("./chatCoversions/facebookConversion");
const convertWhatsappToJSON = require("./chatCoversions/whatsappConversion");
const nextReply = require("./nextReply");
const WhoWroteIt = require("./models/whoWroteIt");
const Game = require("./models/game");
const PORT = process.env.PORT || 3000
const signature = require("cookie-signature")

const prefix = "connect.sid=s:";
const SECRET = "Shhh, its a secret!"



const root = require("path").join(__dirname, "client", "build");
const sessionMiddleware = {
  secret: SECRET, resave: true, saveUninitialized: true, cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
const session = require("express-session")(sessionMiddleware)
app.use(express.json({ limit: "50mb" }));
app.use(session);
app.use(express.static(root));



const whoWroteIt = new WhoWroteIt();
const io = new Server(server);



app.post("/api/game-status", (req, res) => {
  const { game } = whoWroteIt.findGameAndPlayer(req.sessionID);
  if (game) {
    res.json({ connect: true })

  } else {
    res.json({ connect: false })
  }
})

app.post("/api/join-game", (req, res) => {
  const game = whoWroteIt.findGame(req.body.code);
  if (!game) {
    res.json({ join: false, message: "Could not find game with the given code." })
  }
  else if (game.locked) {
    res.json({ join: false, message: "This game has already started." })
  }
  else if (req.body.username.trim() === "") {
    res.json({ join: false, message: "Enter a valid username." })
  }
  else if (game.allUsernames().includes(req.body.username)) {
    res.json({ join: false, message: "That username is already in use for this game, try another one." })
  }
  else if (game && !game.locked && !game.allUsernames().includes(req.body.username)) {
    res.json({ join: true })

  }
})

app.post("/api/upload-data", (req, res) => {
  const { game } = whoWroteIt.findGameAndPlayer(req.sessionID);
  if (game) {
    res.json({message:"failed", text:"You're already in a game!"})
  }
  const data = req.body;
  let consolidatedData;
  if (data.social === "Whatsapp") {
    consolidatedData = convertWhatsappToJSON(data.data);
  } else if (data.social === "Facebook") {
    consolidatedData = convertFacebookToJSON(data.data);
  }
  const newGame = new Game();
  newGame.data = consolidatedData.replies;
  newGame.participants = consolidatedData.participants;
  newGame.numReplies = consolidatedData.numReplies;
  newGame.addPlayer(
    data.username,
    true,
    req.sessionID
  );
  newGame.state.step = "lobby";
  whoWroteIt.games.push(newGame);
  res.json({
    message: "success",
    gameCode: newGame.code,
    participants: consolidatedData.participants,
  });
});
app.post("/api/update-names", (req, res) => {
  const tokenId = req.sessionID
  const { game } = whoWroteIt.findGameAndPlayer(tokenId);

  const renameArray = req.body.renameArray;
  game.renameArray = renameArray;
  res.json({
    message: "success",
    gameCode: game.code,
  });
});
app.get("/api/examplereply", (req, res) => {
  const social = req.headers.social;
  const {
    data,
    participants,
    numReplies,
  } = require(`./examples/examples.js`);
  const { answer, reply, selectedParticipants } = nextReply(
    data,
    numReplies,
    participants
  );
  res.json({
    message: "success",
    answer,
    reply: reply.replace(": ", ""),
    selectedParticipants,
  });
});

app.get("*", (req, res) => {
  res.sendFile("index.html", { root });
});

io.use((socket, next) => {
  const socketCookie = decodeURIComponent(socket.handshake.headers.cookie)
  const real_sid = socketCookie.replace(prefix, "")
  const tokenId = signature.unsign(real_sid, SECRET);
  socket.data.tokenId = tokenId
  next()
});


io.on("connection", (socket) => {
  const { game, player } = whoWroteIt.findGameAndPlayer(socket.data.tokenId);

  if (game && !socket.rooms.has(game.code)) {
    socket.join(game.code);

    if (game.state.step === "inGame") {
      let gameAnswer = null;
      if (!game.waiting) {
        gameAnswer = game.answer;
      }
      socket.emit(
        "rejoin game",
        player.username,
        game.state.step,
        game.reply,
        game.selectedParticipants,
        player.score,
        player.correct,
        player.incorrect,
        player.guess,
        gameAnswer,
        player.host,
        game.questionNumber,
        game.settings.numQuestions
      );
    }
    if (game.state.step === "lobby") {
      socket.emit(
        "rejoin lobby",
        player.username,
        game.state.step,
        game.allUsernames(),
        game.code,
        player.host
      );
    }
    if (game.state.step === "gameOver") {
      socket.emit("rejoin gameover", player.username, game.state.step, game.finalScores, player.correctArray, player.answerTimeArray);
    }
  }

  console.log("client connected: ", socket.id);

  socket.on("disconnect", (reason) => {
    const { game } = whoWroteIt.findGameAndPlayer(socket.data.tokenId);
    if (game && reason === "client namespace disconnect") {
      game.deletePlayer(socket.data.tokenId);
      const usernames = game.allUsernames();
      io.to(game.code).emit("update lobby", usernames);
      if (game.players.length === 0) {
        whoWroteIt.deleteGame(game.code);
        console.log("game has been deleted");
      }
    }
    socket.leave(game?.code);
    console.log(reason);
  });
  socket.on("join channel", () => {
    const { game } = whoWroteIt.findGameAndPlayer(socket.data.tokenId);
    if (game) {
      socket.join(game.code);
    }
  });
  socket.on("join game", (code, username) => {
    const { inGame } = whoWroteIt.findGameAndPlayer(socket.data.tokenId);
    if (!inGame) {
      const game = whoWroteIt.findGame(code);
      if (game && !game.locked) {
        game.addPlayer(username, false, socket.data.tokenId);
        const usernames = game.allUsernames();
        socket.join(game.code);
        socket.emit("join lobby", usernames, game.code);
        io.to(game.code).emit("update lobby", usernames);
      } else {
        socket.emit("no game");
      }
    }
  });
  socket.on("start game", (numQuestions) => {
    const { game, player } = whoWroteIt.findGameAndPlayer(socket.data.tokenId);
    if (player.host) {
      game.locked = true;
      game.state.step = "inGame";
      game.settings.numQuestions = numQuestions;
      const { answer, reply, selectedParticipants } = nextReply(
        game.data,
        game.numReplies,
        game.participants
      );
      game.setNextReply(answer, reply, selectedParticipants);
      game.questionNumber++;
      game.questionSentTime = new Date().getTime();
      let timer = 5
      io.to(game.code).emit("countdown", timer)
      const timerId = setInterval(() => {
        timer--
        if (timer === 0) {
          io.to(game.code).emit(
            "next reply",
            reply,
            selectedParticipants,
            game.questionNumber,
            game.settings.numQuestions
          );
          clearInterval(timerId)
        } else {
          io.to(game.code).emit("countdown", timer)
        }

      }, 1000)
    }

  });
  socket.on("next reply", () => {
    const { game } = whoWroteIt.findGameAndPlayer(socket.data.tokenId);
    const { answer, reply, selectedParticipants } = nextReply(
      game.data,
      game.numReplies,
      game.participants
    );
    game.resetAllGuesses();
    game.waiting = true;
    game.setNextReply(answer, reply, selectedParticipants);
    game.questionNumber++;
    game.questionSentTime = new Date().getTime();
    io.to(game.code).emit(
      "next reply",
      reply,
      selectedParticipants,
      game.questionNumber,
      game.settings.numQuestions
    );
  });
  socket.on("submit guess", (guess) => {
    const { game, player } = whoWroteIt.findGameAndPlayer(socket.data.tokenId);
    const receivedTime = new Date().getTime();
    const answerTime = receivedTime - game.questionSentTime;
    player.guess = guess;
    player.answerTime = answerTime;
    player.correctArray.push(guess === game.answer ? "Correct" : "Incorrect")
    player.answerTimeArray.push(Math.round(answerTime / 1000 * 10) / 10)
    game.checkAllGuesses(io)
  });
  socket.on("get answer", () => {
    const { game, player } = whoWroteIt.findGameAndPlayer(socket.data.tokenId);
    socket.emit(
      "check answer",
      game.answer,
      player.guess,
      player.score,
      player.correct,
      player.incorrect
    );
  });
  socket.on("game over", () => {
    io.to(game.code).emit("game over");
  });
  socket.on("get scoreboard", () => {
    const { game, player } = whoWroteIt.findGameAndPlayer(socket.data.tokenId);
    game.state.step = "gameOver";
    game.setFinalScores();
    socket.emit("go to scoreboard", game.finalScores, player.correctArray, player.answerTimeArray);
  });
});

server.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log("Server running on Port ", PORT);
});
