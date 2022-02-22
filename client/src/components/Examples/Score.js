import classes from "./Score.module.css";


const Score = (props) => {
  return (
    <div className={classes.score}>
      <span className={classes.score_correct}>
        Correct: <span className={classes.score_number}>{props.correct}</span>
      </span>
      <span className={classes.score_incorrect}>
        Incorrect:{" "}
        <span className={classes.score_number}>{props.incorrect}</span>
      </span>
    </div>
  );
};

export default Score;
