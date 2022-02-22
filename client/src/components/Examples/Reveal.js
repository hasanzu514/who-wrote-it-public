import classes from "./Reveal.module.css";

import Participant from "./Participant";
import Score from "./Score";
import NextWord from "./NextWord";
import Modal from "react-modal";
import LoadingBar from "../UI/LoadingBar";

import { useState, useEffect } from "react";

const Reveal = (props) => {
  const [guess, setGuess] = useState(null);
  const [reply, setReply] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [isStart, setIsStart] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalFont, setModalFont] = useState(classes.modal_correct);

  const social = props.social;

  const getReply = async () => {
    setIsLoading(true);
    const response = await fetch("api/examplereply", {
      method: "GET",
      headers: { "Content-Type": "application/json", social },
    });
    const data = await response.json();
    setAnswer(data.answer);
    setGuesses(data.selectedParticipants);
    setReply(data.reply);
    setGuess(false);
    setReveal(false);
    setIsLoading(false);
    setIsStart(false);
  };
  const answerHandler = (guess) => {
    if (guess === answer) {
      setCorrect(correct + 1);
      setShowModal(true);
      setModalFont(classes.modal_correct);
      setTimeout(() => setShowModal(false), 1000);
    } else {
      setIncorrect(incorrect + 1);
      setShowModal(true);
      setModalFont(classes.modal_incorrect);
      setTimeout(() => setShowModal(false), 1000);
    }
    setReveal(true);
    setGuess(guess);
  };

  useEffect(() => {});

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

      <Score correct={correct} incorrect={incorrect} />
      {!isLoading && (
        <>
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
                      reveal={reveal}
                      guess={guess}
                    />
                  );
                })}
              </div>
              {reveal && (
                <div>
                  <NextWord getReplyHandler={getReply} />
                </div>
              )}
            </>
          )}
        </>
      )}
      {isLoading && <LoadingBar />}
      {isStart && (
        <button className={classes.start} onClick={getReply}>
          Start game
        </button>
      )}
    </>
  );
};

export default Reveal;
