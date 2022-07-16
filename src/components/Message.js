import { Card, CardContent, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import "../Css/Message.css";
function Message({ username, message, isGroup }) {
  const [time, setTime] = useState("");
  const { ref: targetref, inView } = useInView();
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
  return (
    <Card
      className={`message_card ${
        message.username === username ? "right" : ""
      } ${inView ? "show" : ""}`}
      ref={targetref}
    >
      <CardContent>
        <Typography className="message_content" variant="h5" component="h2">
          {isGroup
            ? message.username === username
              ? ""
              : message.username + ": "
            : ""}
          {message.message}
        </Typography>
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
