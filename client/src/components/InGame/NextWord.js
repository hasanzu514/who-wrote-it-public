import classes from "./NextWord.module.css";

import { useSelector, useDispatch } from "react-redux";
import { wordsActions } from "../../store";


const NextWord = (props) => {
  const dispatch = useDispatch();
  const socket = useSelector((state) => state.gameSetup.socket);


  const nextReplyHandler = async () => {
    dispatch(wordsActions.setIsLoading({ isLoading: true }));
    socket.emit("next reply");
  };

  return (
    <>
      <button onClick={nextReplyHandler} className={classes.next}>
        Next reply
      </button>
    </>
  );
};

export default NextWord;
