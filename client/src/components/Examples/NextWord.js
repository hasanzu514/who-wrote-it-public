import classes from "./NextWord.module.css";

const NextWord = (props) => {
  const nextReplyHandler = () => {
    props.getReplyHandler();
  };

  return (
    <button onClick={nextReplyHandler} className={classes.next}>
      Next reply
    </button>
  );
};

export default NextWord;
