import classes from "./GameOver.module.css";

import Scoreboard from "./Scoreboard";
import Card from "../UI/Card";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { wordsActions, lobbyActions, gameSetupActions } from "../../store";
import WrongRoute from "../WrongRoute/WrongRoute";

const GameOver = () => {
  const socket = useSelector((state) => state.gameSetup.socket);
  const step = useSelector((state) => state.gameSetup.step);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const leaveGameHandler = () => {
    socket.disconnect();
    navigate("/");
    dispatch(wordsActions.reset());
    dispatch(lobbyActions.reset());
    dispatch(gameSetupActions.reset());
  };

  return (
    <Card>
      {step === "gameOver" && (
        <>
          <h3>Game Over</h3>
          <p>Scoreboard</p>
          <Scoreboard />
          <button className={classes.btn} onClick={leaveGameHandler}>
            Leave Game
          </button>
        </>
      )}
      {step !== "gameOver" && <WrongRoute />}
    </Card>
  );
};

export default GameOver;
