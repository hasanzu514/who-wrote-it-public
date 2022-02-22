import Reveal from "./Reveal";
import Card from "../UI/Card";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { wordsActions } from "../../store";
import WrongRoute from "../WrongRoute/WrongRoute";

const InGame = () => {
  const socket = useSelector((state) => state.gameSetup.socket);
  const step = useSelector((state) => state.gameSetup.step);
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket) {
      socket.on("next reply", (reply, guesses, questionNumber, numQuestions) => {
        dispatch(
          wordsActions.setNextReply({
            reply,
            guesses,
            questionNumber,
            numQuestions,
          })
        );
        dispatch(wordsActions.setIsLoading({ isLoading: false }));
        dispatch(wordsActions.setReveal({ reveal: false }));
      });
    }

  }, [socket, dispatch]);

  return (
    <Card>
      {step === "inGame" && <Reveal />}
      {step !== "inGame" && <WrongRoute />}
    </Card>
  );
};

export default InGame;
