import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import Message from "../components/Message";
import { auth, db, storage } from "../firebase";
import { Input, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Chatbox.css";
import { Send, Add } from "@mui/icons-material";
import { useTimeout, useEventListener } from "usehooks-ts";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
function Temp({ username, messageID, isGroup }) {
  //States
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(-4);
  const [file, setFile] = useState();
  const bottomref = useRef(null);
  let navigate = useNavigate();
  const addRef = useRef(null);
  //Hooks

  // useTimeout(() => {
  //   return bottomref.current?.scrollIntoView({ behavior: "smooth" });
  // }, 700);

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

  const handleAdd = () => {
    if (addRef !== null) {
      document.getElementById("file_upload").click();
    }
  };
  useEventListener("click", handleAdd, addRef);
  //Handlers
  const handleFileSelect = (e) => {
    const currFile = e.target.files[0];

    if (currFile) {
      if (currFile.size > 26214400) {
        alert("Max File Size is 25Mb!");
        return;
      }
      const storageref = ref(
        storage,
        "chat_media/" + messageID + "/" + currFile.name
      );
      const uploadTask = uploadBytesResumable(storageref, currFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          console.log(error);
          alert(error.message);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            async function sendMedia() {
              const collRef = collection(
                db,
                `messages/messages_doc/${messageID}`
              );
              const unsub = await addDoc(collRef, {
                username: auth.currentUser.displayName,
                timestamp: serverTimestamp(),
                type: currFile.type.split("/")[0],
                url: downloadURL,
              }).catch((err) => console.log(err));
            }
            sendMedia();
            setProgress(-4);
            setTimeout(
              () => bottomref.current?.scrollIntoView({ behavior: "smooth" }),
              600
            );
          });
        }
      );
    }
  };
  const handleSend = (event) => {
    event.preventDefault();
    if (message === "") return;

    async function sendMsg() {
      const collRef = collection(db, `messages/messages_doc/${messageID}`);
      const unsub = await addDoc(collRef, {
        username: auth.currentUser.displayName,
        timestamp: serverTimestamp(),
        type: "message",
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

  return (
    <div className="chatbox">
      <div
        className="messages_container"
        id="messages"
        onLoad={() => {
          setTimeout(
            () => bottomref.current?.scrollIntoView({ behavior: "smooth" }),
            350
          );
        }}
      >
        {messages.map((message, i) => {
          return (
            <Message
              key={i}
              username={username}
              message={message}
              isGroup={isGroup}
            />
          );
        })}
      </div>

      <form className="send_form">
        <input
          id="file_upload"
          className="file_upload"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
        ></input>

        <Add
          className={`add_file_btn ${progress === -4 ? "" : "hidden_toggle"}`}
          ref={addRef}
        />

        <CircularProgress
          className={`progress_circle ${
            progress === -4 ? "hidden_toggle" : ""
          }`}
          variant="determinate"
          value={progress}
        />

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

export default Temp;
