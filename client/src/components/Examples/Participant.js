import classes from "./Participant.module.css";

const Participant = (props) => {
  const answerHandler = () => {
    props.answerHandler(props.name);
  };

  let button_classes = classes.participant;
  if (props.reveal) {
    if (props.name === props.answer) {
      button_classes = classes.participant_correct;
    } else {
      button_classes = classes.participant_incorrect;
    }
  }
  if (props.guess === props.name) {
    button_classes = `${button_classes} ${classes.participant_selected}`;
  }

  return (
    <button
      onClick={answerHandler}
      value={props.name}
      className={button_classes}
    >
      {props.name}
    </button>
  );
};

export default Participant;
