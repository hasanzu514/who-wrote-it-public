import classes from "./WrongRoute.module.css";

import { Link } from "react-router-dom";

const WrongRoute = () => {
  return (
    <>
      <p>Looks like you're not supposed to be here...</p>
      <Link className={classes.btn} to="/">
        Back to Homepage
      </Link>
    </>
  );
};

export default WrongRoute;
