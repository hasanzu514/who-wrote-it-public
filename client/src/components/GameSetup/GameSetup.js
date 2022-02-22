import classes from "./GameSetup.module.css";

import { io } from "socket.io-client";

import HiddenInput from "./HiddenInput";
import Card from "../UI/Card";
import { useState } from "react";
import { gameSetupActions } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { FadingBalls } from "react-cssfx-loading";
import { useNavigate } from "react-router";
import { lobbyActions, wordsActions } from "../../store";
import Modal from "react-modal";
import LoadingBar from "../UI/LoadingBar";

const GameSetup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [username, setUsername] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileData = useSelector((state) => state.gameSetup.fileData);
  const [socialSite, setSocialSite] = useState(null);

  const socialSites = ["Whatsapp", "Facebook"];

  const selectHandler = (event) => {
    setSocialSite(event.target.id);
  };

  const loadChatHandler = async () => {
    setIsLoading(true);
    if (username.trim() === "") {
      setErrorMessage("Please enter a valid username.");
      setShowModal(true);
    } else {
      const response = await fetch("/api/upload-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: fileData,
          social: socialSite,
          username,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.message === "success") {
          dispatch(wordsActions.reset());
          dispatch(lobbyActions.reset());
          dispatch(gameSetupActions.reset());
          dispatch(lobbyActions.addPlayer({ username }));
          dispatch(gameSetupActions.setHost({ host: true }));
          setShowParticipants(true);
          setIsLoading(false);
          setParticipants(
            data.participants.map((participant) => participant.name)
          );
        } else {
          setErrorMessage(data.text);
          setShowModal(true);
        }
      } else {
        setErrorMessage(
          "There was an error uploading your file, please try again."
        );
        setShowModal(true);
      }
    }
    setIsLoading(false);
  };
  const joinLobbyHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const socket = io();
    dispatch(gameSetupActions.setSocket({ socket }));
    let renameArray = [];
    for (let i = 0; i < participants.length; i++) {
      renameArray.push({
        originalName: participants[i],
        newName: event.target[i].value.trim(),
      });
    }
    const response = await fetch("/api/update-names", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        renameArray,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.message === "success") {
        dispatch(gameSetupActions.setUsername({ username }));
        dispatch(lobbyActions.setCode({ code: data.gameCode }));
        socket.emit("join channel");
        dispatch(gameSetupActions.setStep({ step: "lobby" }));
        navigate("/lobby");
      }
    } else {
      setErrorMessage("There was an error creating the game, please try again");
      setShowModal(true);
    }

    setIsLoading(false);
  };
  const usernameChangeHandler = (event) => {
    setUsername(event.target.value);
  };

  const closeModalHandler = () => {
    setShowModal(false);
  };

  const showInfoModalHandler = () => {
    setShowInfoModal(true);
  };

  const closeInfoModalHandler = () => {
    setShowInfoModal(false);
  };

  return (
    <Card>
      <Modal
        isOpen={showModal}
        contentLabel="Join game error"
        className={classes.modal}
        overlayClassName={classes.overlay}
      >
        <p className={classes.modal_text}>{errorMessage}</p>
        <button className={classes.btn} onClick={closeModalHandler}>
          Close
        </button>
      </Modal>
      <Modal
        isOpen={showInfoModal}
        contentLabel="Join game error"
        className={classes.modal_info}
        overlayClassName={classes.overlay}
      >
        <div className={classes.info_div}>
          <span className={classes.info_text}>
            Use the links below to see how to download your chat!
          </span>
          <div>
            <a
              className={classes.info_anchor}
              href="https://www.facebook.com/help/1701730696756992"
              target="_blank"
            >
              Facebook (json file)
            </a>
          </div>
          <div>
            <a
              className={classes.info_anchor}
              href="https://faq.whatsapp.com/android/chats/how-to-save-your-chat-history/?lang=en"
              target="_blank"
            >
              Whatsapp (txt file)
            </a>
          </div>
        </div>
        <button className={classes.btn} onClick={closeInfoModalHandler}>
          Close
        </button>
      </Modal>
      {!showParticipants && (
        <>
          <p>Enter a username:</p>
          <input
            className={classes.username}
            type="text"
            placeholder="username"
            onChange={usernameChangeHandler}
            value={username}
          />
          <p>
            Choose a file type to upload:
            <span onClick={showInfoModalHandler} className={classes.info_btn}>
              Where do I get a chat file?
            </span>
          </p>

          {socialSites.map((site) => (
            <button
              key={site}
              id={site}
              onClick={selectHandler}
              className={
                socialSite === site ? classes.btn_selected : classes.btn
              }
            >
              {site}
            </button>
          ))}
          {socialSite && (
            <>
              <p>Upload your {socialSite} chat file: </p>
              <HiddenInput type="file" text="Chat File" />
              <button className={classes.btn} onClick={loadChatHandler}>
                Load Chat
              </button>
            </>
          )}
        </>
      )}
      {showParticipants && (
        <p>
          These are the names found in the chat. You can change them before
          creating the game.
        </p>
      )}
      <form onSubmit={joinLobbyHandler}>
        {participants.map((participant) => {
          return (
            <>
              <div className={classes.participant}>
                <label className={classes.participant_label} for={participant}>
                  {participant}
                </label>
                <input
                  className={classes.participant_input}
                  id={participant}
                  type="text"
                  placeholder="rename"
                />
              </div>
            </>
          );
        })}
        {showParticipants && (
          <button type="submit" className={classes.btn}>
            Create Game
          </button>
        )}
      </form>
      {isLoading && <LoadingBar />}
    </Card>
  );
};

export default GameSetup;
