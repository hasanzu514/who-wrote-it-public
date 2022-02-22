import classes from "./Reveal.module.css";

import Participant from "./Participant";
import Score from "./Score";
import NextWord from "./NextWord";
import { FadingBalls } from "react-cssfx-loading";
import { useEffect, useState } from "react";
import Modal from "react-modal";

import { useSelector, useDispatch } from "react-redux";
import { gameSetupActions, wordsActions } from "../../store";
import { useNavigate } from "react-router";

const Reveal = (props) => {
  const navigate = useNavigate();
  const waitingForOthers = useSelector((state) => state.words.waitingForOthers);
  const reply = useSelector((state) => state.words.reply);
  const reveal = useSelector((state) => state.words.reveal);
  const guesses = useSelector((state) => state.words.guesses);
  const answer = useSelector((state) => state.words.answer);
  const isLoading = useSelector((state) => state.words.isLoading);
  const socket = useSelector((state) => state.gameSetup.socket);
  const questionNumber = useSelector((state) => state.words.questionNumber);
  const numQuestions = useSelector((state) => state.words.numQuestions);
  const dispatch = useDispatch();
  const host = useSelector((state) => state.gameSetup.host);
  const [showModal, setShowModal] = useState(false);
  const [modalFont, setModalFont] = useState(classes.modal_correct);

  useEffect(() => {
    if (socket) {
      socket.on("check answer", (answer, guess, score, correct, incorrect) => {
        dispatch(wordsActions.setAnswer({ answer }));
        dispatch(wordsActions.setScore({ score, correct, incorrect }));
        if (guess === answer) {
          setShowModal(true);
          setModalFont(classes.modal_correct);
          setTimeout(() => setShowModal(false), 1000);
        } else {
          setShowModal(true);
          setModalFont(classes.modal_incorrect);
          setTimeout(() => setShowModal(false), 1000);
        }
      });
      socket.on("ready for answer", () => {
        socket.emit("get answer");
      });
      socket.on("game over", () => {
        socket.emit("get scoreboard")
      })
      socket.on("go to scoreboard", (finalScores, correctArray, answerTimeArray) => {
        dispatch(gameSetupActions.setFinalScores({ finalScores, correctArray, answerTimeArray }));
        dispatch(gameSetupActions.setStep({ step: "gameOver" }));
        navigate("/gameover");
      });
    }
  }, [socket, dispatch, navigate]);

  const answerHandler = (guess) => {
    socket.emit("submit guess", guess);
  };
  const gameOverHandler = () => {
    socket.emit("game over");
  };

  return (
    <>
      <Modal
        isOpen={showModal}
        contentLabel="Show Result"
        className={classes.modal}
        overlayClassName={classes.overlay}
      >
        <p className={modalFont}>
          {modalFont === classes.modal_correct ? "Correct!" : "Incorrect!"}
        </p>
      </Modal>
      <Score />
      {!isLoading && (
        <>
          <p>
            Question {questionNumber}/{numQuestions}
          </p>
          <p>{reply}</p>
          {reply && (
            <>
              <div className={classes.guess_who}>Guess who wrote it:</div>
              <div>
                {guesses.map((participant) => {
                  return (
                    <Participant
                      key={Math.random()}
                      name={participant.name}
                      answerHandler={answerHandler}
                      answer={answer}
                    />
                  );
                })}
              </div>
              {waitingForOthers && !reveal && (
                <p>Waiting for others to answer...</p>
              )}
              {reveal && host && questionNumber !== numQuestions && (
                <div>
                  <NextWord />
                </div>
              )}
              {reveal && host && questionNumber === numQuestions && (
                <div>
                  <button onClick={gameOverHandler} className={classes.btn}>
                    Scoreboard
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
      {isLoading && (
        <div className={classes.loading}>
          <FadingBalls color="#20339e" />
        </div>
      )}
    </>
  );
};

export default Reveal;
