import classes from "./ExampleStartButton.module.css";

const ExampleStartButton = (props) => {
  const exampleHandler = () => {
    props.exampleHandler(props.social);
  };

  return (
    <button onClick={exampleHandler} className={classes.button}>
      {props.title}
    </button>
  );
};

export default ExampleStartButton;
