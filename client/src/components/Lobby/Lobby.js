import classes from "./Lobby.module.css";

import Card from "../UI/Card";
import Player from "./Player";
import { useSelector, useDispatch } from "react-redux";
import { wordsActions, lobbyActions, gameSetupActions } from "../../store";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import WrongRoute from "../WrongRoute/WrongRoute";

const Lobby = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const players = useSelector((state) => state.lobby.players);
  const host = useSelector((state) => state.gameSetup.host);
  const socket = useSelector((state) => state.gameSetup.socket);
  const step = useSelector((state) => state.gameSetup.step);
  const gameCode = useSelector((state) => state.lobby.code);
  const numQuestions = useSelector((state) => state.words.numQuestions);
  const [timerMessage, setTimerMessage] = useState(null)
  const [copyButtonClass, setCopyButtonClass] = useState(classes.btn)

  useEffect(() => {
    if (socket) {
      socket.on("update lobby", (usernames) => {
        dispatch(lobbyActions.setAllPlayers({ usernames }));
      });
      socket.on("next reply", (reply, guesses, questionNumber, numQuestions) => {
        dispatch(
          wordsActions.setNextReply({
            reply,
            guesses,
            questionNumber,
            numQuestions,
          })
        );
        dispatch(gameSetupActions.setStep({ step: "inGame" }));
        navigate("/ingame");
      });
      socket.on("countdown", (timer) => {
        setTimerMessage(`Game starting in ${timer} seconds.`)
      });
    }

  }, [socket, dispatch, navigate]);

  const startGameHandler = () => {
    socket.emit("start game", numQuestions);
  };

  const upHandler = () => {
    if (numQuestions < 20) {
      dispatch(
        wordsActions.setNumQuestions({ numQuestions: numQuestions + 1 })
      );
    } else {
      dispatch(wordsActions.setNumQuestions({ numQuestions: 2 }));
    }
  };

  const downHandler = () => {
    if (numQuestions > 2) {
      dispatch(
        wordsActions.setNumQuestions({ numQuestions: numQuestions - 1 })
      );
    } else {
      dispatch(wordsActions.setNumQuestions({ numQuestions: 20 }));
    }
  };

  const copyHandler = () => {
    navigator.clipboard.writeText(window.location.href.split("/lobby")[0] + `/joingame?code=${gameCode}`)
    setCopyButtonClass(`${classes.btn} ${classes.btn_copy}`)
    setTimeout(() => setCopyButtonClass(classes.btn), 1000)
  }

  return (
    <Card>
      {step === "lobby" && (
        <>
          <h2>Game ID: {gameCode}</h2>
          <button className={copyButtonClass} onClick={copyHandler}>Copy link to join game</button>
          <h3>Players in lobby</h3>
          {players.map((player) => {
            return <Player username={player} key={player} />;
          })}
          {host && !timerMessage && (
            <>
              <div>
                <p>Number of questions: {numQuestions}</p>
                <button onClick={upHandler} className={classes.arrow}>
                  <i className={classes.arrow_up}></i>
                </button>
                <button onClick={downHandler} className={classes.arrow}>
                  <i className={classes.arrow_down}></i>
                </button>
              </div>
              <button onClick={startGameHandler} className={classes.btn}>
                Start Game
              </button>
            </>
          )}
          {!host && !timerMessage && <h3>waiting for host to start game...</h3>}
          {timerMessage && <p>{timerMessage}</p>}
        </>
      )}
      {step !== "lobby" && <WrongRoute />}
    </Card>
  );
};

export default Lobby;
