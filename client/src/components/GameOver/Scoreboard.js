import classes from "./Scoreboard.module.css";

import { useSelector } from "react-redux";

const Scoreboard = () => {
  const finalScores = useSelector((state) => state.gameSetup.finalScores);
  const correctArray = useSelector((state) => state.gameSetup.correctArray);
  const answerTimeArray = useSelector((state) => state.gameSetup.answerTimeArray);

  let maxScore;
  if (finalScores && finalScores.length > 0) {
    maxScore = finalScores[0].score;
  }

  let statsArray = []
  if (correctArray) {
    for (let i = 0; i < correctArray.length; i++) {
      statsArray.push(
        <tr>
          <td className={classes.stats_question}>{`Q${i + 1}`}</td>
          <td className={classes.stats_correct}>{correctArray[i]}</td>
          <td className={classes.stats_time}>Answer time: {answerTimeArray[i]} s</td>
        </tr>
      )
    }
  }


  return (
    <>
      <table>
        {finalScores.map((finalScore) => {
          return (
            <tr>
              <td className={classes.name}>{finalScore.name}</td>
              <td className={classes.scorebar}>
                <div
                  style={{
                    width: `${Math.floor(
                      (finalScore.score / maxScore) * 100
                    )}%`,
                  }}
                ></div>
              </td>
              <td className={classes.score}>{finalScore.score}</td>
            </tr>
          );
        })}
      </table>
      <table>
        {statsArray}
      </table>

    </>
  );
};

export default Scoreboard;
