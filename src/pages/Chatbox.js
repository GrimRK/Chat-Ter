import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import Message from "../components/Message";
import { auth, db } from "../firebase";
import { Input, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import "./Chatbox.css";
import { KeyboardArrowLeft, Send } from "@mui/icons-material";
import { useTimeout } from "usehooks-ts";
function Temp({ username, messageID, isGroup }) {
  //States
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const bottomref = useRef(null);
  let navigate = useNavigate();

  //Hooks

  useTimeout(() => {
    return bottomref.current?.scrollIntoView({ behavior: "smooth" });
  }, 700);

  useEffect(() => {
    if (messageID) {
      const q = query(
        collection(db, `messages/messages_doc/${messageID}`),
        orderBy("timestamp", "asc")
      );
      onSnapshot(q, (snap) => {
        var temp = [];
        snap.forEach((item) => {
          //console.log(item.data());
          temp.push(item.data());
        });
        setMessages(temp);
      });
    }
  }, [messageID]);

  //Handlers
  const handleSend = (event) => {
    event.preventDefault();
    if (message === "") return;

    async function sendMsg() {
      const collRef = collection(db, `messages/messages_doc/${messageID}`);
      const unsub = await addDoc(collRef, {
        username: auth.currentUser.displayName,
        timestamp: serverTimestamp(),
        message: message,
      })
        .then(() => {
          setMessage("");
        })
        .catch((err) => console.log(err));
    }
    if (messageID) {
      sendMsg();
      setMessage("");
      setTimeout(
        () => bottomref.current?.scrollIntoView({ behavior: "smooth" }),
        600
      );
    }
  };

  //Render
  if (isGroup) {
    return (
      <div className="chatbox">
        <div className="messages_container" id="messages">
          {messages.map((message, i) => {
            return (
              <Message key={i} username={username} message={message} isGroup />
            );
          })}
        </div>

        <form className="send_form">
          <Input
            placeholder="Enter Your Message..."
            className="send_text"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></Input>
          <Button className="send_button" type="submit" onClick={handleSend}>
            <Send className="send_icon"></Send>
          </Button>
        </form>
        <div ref={bottomref}></div>
      </div>
    );
  } else {
    return (
      <div className="chatbox">
        <div className="messages_container" id="messages">
          {messages.map((message, i) => {
            return <Message key={i} username={username} message={message} />;
          })}
        </div>

        <form className="send_form">
          <Input
            placeholder="Enter Your Message..."
            className="send_text"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></Input>
          <Button className="send_button" type="submit" onClick={handleSend}>
            <Send className="send_icon"></Send>
          </Button>
        </form>
        <div ref={bottomref} className="bottomreference"></div>
      </div>
    );
  }
}

export default Temp;
