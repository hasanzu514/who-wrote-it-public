import classes from "./Participant.module.css";

import { useDispatch, useSelector } from "react-redux";
import { wordsActions } from "../../store";

const Participant = (props) => {
  const dispatch = useDispatch();
  const reveal = useSelector((state) => state.words.reveal);
  const waitingForOthers = useSelector((state) => state.words.waitingForOthers);
  const guess = useSelector(state => state.words.guess)

  const submitAnswerHandler = () => {
    if (waitingForOthers) {
      return;
    }
    dispatch(wordsActions.setSubmitAnswer({ guess: props.name }));
    props.answerHandler(props.name);
  };

  let button_classes = classes.participant;
  if (reveal) {
    if (props.name === props.answer) {
      button_classes = classes.participant_correct;
    } else {
      button_classes = classes.participant_incorrect;
    }
  }
  if (guess && props.name === guess) {
    button_classes = button_classes + ` ${classes.participant_guess}`
  }

  return (
    <button
      onClick={submitAnswerHandler}
      value={props.name}
      className={button_classes}
    >
      {props.name}
    </button>
  );
};

export default Participant;
