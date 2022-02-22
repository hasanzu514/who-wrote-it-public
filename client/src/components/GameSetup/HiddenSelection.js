import classes from "./HiddenSelection.module.css";

const HiddenSelection = (props) => {
  return (
    <div className={classes.social}>
      <label for={props.text}>{props.text}</label>
      <input name="social" id={props.text} type="radio" />
    </div>
  );
};

export default HiddenSelection;
