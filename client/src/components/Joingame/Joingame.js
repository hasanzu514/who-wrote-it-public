import Card from "../UI/Card";
import classes from "./Joingame.module.css";
import { useDispatch } from "react-redux";
import { lobbyActions, gameSetupActions } from "../../store";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Modal from "react-modal";
import { useSearchParams } from "react-router-dom"

const Joingame = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [code, setCode] = useState(null);
  const [username, setUsername] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  let [searchParams] = useSearchParams()

  useEffect(() => {
    setCode(searchParams.get("code"))
  }, [searchParams])

  const joinGameHandler = async () => {
    const response = await fetch("/api/join-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        username,
      }),
    });
    const data = await response.json()
    if (data.join === true) {
      const socket = io();
      dispatch(gameSetupActions.setUsername({ username }))
      dispatch(gameSetupActions.setSocket({ socket }));
      socket.on("join lobby", (usernames, code) => {
        dispatch(lobbyActions.setAllPlayers({ usernames }));
        dispatch(lobbyActions.setCode({ code }));
        dispatch(gameSetupActions.setStep({ step: "lobby" }));
        navigate("/lobby");
      });
      socket.emit("join game", code, username);
    } else {
      setErrorMessage(data.message)
      setShowModal(true)
    }

  };

  const codeChangeHandler = (event) => {
    setCode(event.target.value);
  };

  const usernameChangeHandler = (event) => {
    setUsername(event.target.value)
  }

  const closeModalHandler = () => {
    setShowModal(false)
  }

  return (
    <Card>
      <Modal
        isOpen={showModal}
        contentLabel="Join game error"
        className={classes.modal}
        overlayClassName={classes.overlay}
      >
        <p className={classes.modal_text} >
          {errorMessage}
        </p>
        <button className={classes.btn} onClick={closeModalHandler}>Close</button>
      </Modal>
      <p>Enter a username:</p>
      <input
        className={classes.username}
        type="text"
        placeholder="username"
        onChange={usernameChangeHandler}
        value={username}
      />
      <div className={classes.joingame}>
        <label htmlFor="code">Enter code to join game:</label>
        <input
          onChange={codeChangeHandler}
          type="text"
          placeholder="xxxx"
          id="code"
          value={code}
        ></input>
      </div>
      <button onClick={joinGameHandler} className={classes.btn}>
        Join Game
      </button>
    </Card>
  );
};

export default Joingame;
