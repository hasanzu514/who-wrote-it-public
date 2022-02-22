import classes from "./Homepage.module.css";
import { Link } from "react-router-dom";
import Card from "../UI/Card";

const Homepage = () => {
  return (
    <Card>

      <h2>Do you really know your friends?</h2>
      <p>
        Guess who wrote each reply in your Facebook or Whatsapp chats! Jump into the
        example to see how it works. If you're already familiar, start a game!
      </p>
      <div>
        <Link className={classes.btn} to="/gamesetup">
          New Game
        </Link>
        <Link className={classes.btn} to="/joingame">
          Join Game
        </Link>
      </div>
      <div>
        <Link className={classes.btn} to="/example">
          Jump to Examples
        </Link>
      </div>
    </Card>
  );
};

export default Homepage;
