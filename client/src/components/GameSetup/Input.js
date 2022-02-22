import classes from "./Input.module.css";

const Input = (props) => {
  return (
    <>
      <div className={classes.input}>
        <label htmlFor={props.id}>{props.text}</label>
      </div>
      <div className={classes.input}>
        <input type={props.type} id={props.id} />
      </div>
    </>
  );
};

export default Input;
