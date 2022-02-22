import classes from "./Score.module.css";

import { useSelector } from "react-redux";

const Score = () => {
  const numCorrect = useSelector((state) => state.words.numCorrect);
  const numIncorrect = useSelector((state) => state.words.numIncorrect);
  const score = useSelector((state) => state.words.score);

  return (
    <div className={classes.score}>
      <span className={classes.score_correct}>
        Correct: <span className={classes.score_number}>{numCorrect}</span>
      </span>
      <span className={classes.score_incorrect}>
        Incorrect: <span className={classes.score_number}>{numIncorrect}</span>
      </span>
      <div className={classes.score_value}>
        Score: <span className={classes.score_number}>{score}</span>
      </div>
    </div>
  );
};

export default Score;
