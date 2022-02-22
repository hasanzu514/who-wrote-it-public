import classes from "./HiddenInput.module.css";
import { gameSetupActions } from "../../store";
import { useDispatch } from "react-redux";
import { useState } from "react";

const HiddenInput = (props) => {
  const dispatch = useDispatch();
  const [fileName, setFileName] = useState("No file selected")

  const uploadHandler = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async function (event) {
      dispatch(gameSetupActions.setFileData({ fileData: event.target.result }));
      setFileName(file.name)


      // let consolidatedData;
      // let socialNetwork
      // if (file.name.includes(".txt")) {
      //   consolidatedData = convertWhatsappToJSON(event.target.result);
      //   socialNetwork = "whatsapp"
      // } else if (file.name.includes(".json")) {
      //   consolidatedData = convertFacebookToJSON(event.target.result);
      //   socialNetwork = "facebook"
      // }
      // const response = await fetch(
      //   `https://who-wrote-it-de845-default-rtdb.firebaseio.com/${socialNetwork}.json`,
      //   {
      //     method: "PUT",
      //     body: JSON.stringify(consolidatedData),
      //   }
      // );
      // if (!response.ok) {
      //   console.log(response);
      //   return;
      // }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <div className={classes.input}>
        <label htmlFor="text-input">{props.text}</label>
        <input type={props.type} onChange={uploadHandler} id="text-input" />
        <p className={classes.filename}>{fileName}</p>
      </div>
    </>
  );
};

export default HiddenInput;
