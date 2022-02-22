import { FadingBalls } from "react-cssfx-loading";
import classes from "./LoadingBar.module.css";

const LoadingBar = () => {
  return (
    <div className={classes.loading}>
      <FadingBalls color="#20339e" />
    </div>
  );
};

export default LoadingBar;
