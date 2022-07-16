import { Card, CardContent, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import { useEventListener } from "usehooks-ts";
import "../Css/Message.css";
function Message({ username, message, isGroup }) {
  const [time, setTime] = useState("");
  const { ref: targetref, inView } = useInView();
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (message.timestamp) {
      var date = new Date(message.timestamp.toDate());

      var h = date.getHours();
      var m = date.getMinutes();
      if (h < 10) h = "0" + h;
      if (m < 10) m = "0" + m;
      setTime(h + ":" + m);
      return;
    }
  }, [message]);

  useEventListener(
    "ended",
    () => {
      setPlaying(false);
    },
    videoRef
  );
  const handleVideoClick = () => {
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };
  return (
    <Card
      className={`message_card ${
        message.username === username ? "right" : ""
      } ${inView ? "show" : "hidden_message"}`}
      ref={targetref}
    >
      <CardContent>
        <Typography className="message_content" variant="h5" component="h2">
          {isGroup
            ? message.username === username
              ? ""
              : message.username + ": "
            : ""}
          {message.type === "message" ? message.message : ""}
        </Typography>
        {message.type === "image" ? (
          <div className="image_container">
            <img className="chat_image" src={message?.url} alt="" />
          </div>
        ) : message.type === "video" ? (
          <div className="video_container" onClick={handleVideoClick}>
            <video ref={videoRef} className="chat_video" src={message?.url} />
            <PlayCircleFilledRoundedIcon
              className={`play_btn ${playing ? "pause" : ""}`}
            />
          </div>
        ) : (
          ""
        )}
        <p
          className={`timestamp ${
            message.username === username ? "right_timestamp" : ""
          }`}
        >
          {time}
        </p>
      </CardContent>
    </Card>
  );
}

export default Message;
