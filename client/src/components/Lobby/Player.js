import classes from "./Player.module.css";

const Player = (props) => {
  return <span className={classes.username}>{props.username}</span>;
};

export default Player;
