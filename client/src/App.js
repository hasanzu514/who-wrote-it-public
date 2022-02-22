import Homepage from "./routes/Homepage";
import Example from "./routes/Example";
import GameSetup from "./routes/GameSetup";
import InGame from "./routes/InGame";

import Header from "./components/Layout/Header";
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { gameSetupActions, wordsActions, lobbyActions } from "./store";
import Lobby from "./routes/Lobby";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import LoadingBar from "./components/UI/LoadingBar";
import Joingame from "./routes/Joingame";
import GameOver from "./routes/GameOver";
import { useNavigate } from "react-router";

const App = () => {
  const navigate = useNavigate();
  const socket = useSelector((state) => state.gameSetup.socket);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  useEffect(() => {
    setIsLoading(true);
    const updateData = async () => {
      const response = await fetch("/api/game-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.connect === true && !socket) {
        const socket = io();
        dispatch(gameSetupActions.setSocket({ socket }));
        socket.on(
          "rejoin game",
          (
            username,
            step,
            reply,
            guesses,
            score,
            correct,
            incorrect,
            guess,
            answer,
            host,
            questionNumber,
            numQuestions
          ) => {
            dispatch(gameSetupActions.setUsername({ username }));
            dispatch(gameSetupActions.setStep({ step }));
            dispatch(
              wordsActions.setNextReply({
                reply,
                guesses,
                questionNumber,
                numQuestions,
              })
            );
            dispatch(wordsActions.setSubmitAnswer({ guess }));
            dispatch(wordsActions.setAnswer({ answer }));
            dispatch(wordsActions.setScore({ score, correct, incorrect }));
            dispatch(gameSetupActions.setHost({ host }));
            navigate("/ingame");
          }
        );
        socket.on("rejoin lobby", (username, step, usernames, code, host) => {
          dispatch(gameSetupActions.setUsername({ username }));
          dispatch(gameSetupActions.setStep({ step }));
          dispatch(lobbyActions.setAllPlayers({ usernames }));
          dispatch(lobbyActions.setCode({ code }));
          dispatch(gameSetupActions.setHost({ host }));
          navigate("/lobby");
        });
        socket.on(
          "rejoin gameover",
          (username, step, finalScores, correctArray, answerTimeArray) => {
            dispatch(gameSetupActions.setUsername({ username }));
            dispatch(gameSetupActions.setStep({ step }));
            dispatch(
              gameSetupActions.setFinalScores({
                finalScores,
                correctArray,
                answerTimeArray,
              })
            );

            navigate("/gameover");
          }
        );
      }
      setIsLoading(false);
    };

    updateData();
  }, [navigate, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Header />
      {isLoading && <LoadingBar />}
      {!isLoading && (
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/gamesetup" element={<GameSetup />} />
          <Route path="/example" element={<Example />} />
          <Route path="/joingame" element={<Joingame />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/ingame" element={<InGame />} />
          <Route path="/gameover" element={<GameOver />} />
        </Routes>
      )}
    </>
  );
};

export default App;
