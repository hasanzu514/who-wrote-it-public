import classes from "./Header.module.css";

import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { wordsActions, lobbyActions, gameSetupActions } from "../../store";

const Header = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSelector((state) => state.gameSetup.socket);
  const username = useSelector(state => state.gameSetup.username)
  const leaveGameHandler = async () => {
    socket.disconnect();
    navigate("/");
    dispatch(wordsActions.reset());
    dispatch(lobbyActions.reset());
    dispatch(gameSetupActions.reset());
  };

  return (
    <header className={classes.header}>
      <div className={classes.header_container}>
        <div className={classes.header_text}>
          <Link to="/">Guess who wrote it</Link>
        </div>
        {username && (
          <div className={classes.logout}>
            <span className={classes.username}>{username}</span>
            <button onClick={leaveGameHandler}>Exit Game</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
