import {
  Alert,
  Avatar,
  Button,
  Collapse,
  Divider,
  Drawer,
  Input,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AccountCircle,
  Add,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Person,
} from "@mui/icons-material";
import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router";
import "./ChatApp.css";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import Chatbox from "./Chatbox";

function ChatApp() {
  //States
  const [chats, setChats] = useState();
  const [user, setUser] = useState();
  const [openChat, setOpenChat] = useState(false);
  const [openGroupChat, setOpenGroupChat] = useState(false);
  const [openGroupInfo, setOpenGroupInfo] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);
  const [chatInfo, setChatInfo] = useState();
  const [addUsername, setAddUsername] = useState("");
  const [groupName, setGroupName] = useState("");
  const [openErrAlert, setOpenErrAlert] = useState(false);
  const [openSuccAlert, setOpenSuccAlert] = useState(false);
  const [alertMessage, setALertMessage] = useState("");
  let navigate = useNavigate();

  //useEffects
  useEffect(() => {
    async function getChat() {
      const unsub = onSnapshot(
        doc(db, "users", auth.currentUser.displayName),
        (doc) => {
          setChats(doc.data().chats);
        }
      );
    }
    if (auth.currentUser) {
      getChat();
    }
  }, [user]);

  useEffect(() => {
    onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        navigate("/", { replace: true });
      }
    });
  }, []);

  //Handlers

  const logout = (event) => {
    event.preventDefault();
    signOut(auth);
  };
  const handleClick = (ele) => {
    if (ele.type === "chat") {
      setChatInfo(ele);
      setOpenChat(true);
    } else {
      setChatInfo(ele);
      setOpenGroupChat(true);
    }
  };

  function inChats(element) {
    if (chats?.find((item) => item.messageID === element)) {
      return true;
    }
    return false;
  }

  const handleAdd = (username) => {
    if (username === "") return;
    if (username === auth.currentUser.displayName) {
      return;
    }
    async function isValid(username) {
      const docRef = doc(db, "users", username);
      const Doc = await getDoc(docRef);
      console.log(Doc.data());
      if (Doc.exists()) {
        console.log("exists");
        const collID = auth.currentUser.displayName + "_" + username;
        const collID1 = username + "_" + auth.currentUser.displayName;
        if (!inChats(collID) && !inChats(collID1)) {
          const colRef = collection(db, `messages/messages_doc/${collID}`);
          addDoc(colRef, {});
          updateDoc(doc(db, `users/${auth.currentUser.displayName}`), {
            chats: arrayUnion({
              messageID: collID,
              name: username,
              type: "chat",
            }),
          });
          updateDoc(doc(db, `users/${username}`), {
            chats: arrayUnion({
              messageID: collID,
              name: auth.currentUser.displayName,
              type: "chat",
            }),
          });
          console.log("Successfully added");
          setALertMessage("User Added Successfully!");
          setOpenSuccAlert(true);
        } else {
          setALertMessage("User Already Added!");
          setOpenErrAlert(true);
          return;
        }
      } else {
        setALertMessage("User Does Not Exist!");
        setOpenErrAlert(true);
        return;
      }
    }

    isValid(username);
    setAddUsername("");
    setOpenLeft(false);
  };
  const handleAddGroup = (group_name) => {
    console.log(group_name);

    async function isValidGroup(group_name) {
      const collID = auth.currentUser.displayName + "_" + group_name;
      if (!inChats(collID)) {
        const collRef = collection(db, `messages/messages_doc/${collID}`);
        const unsub = await addDoc(collRef, {});
        updateDoc(doc(db, `users/${auth.currentUser.displayName}`), {
          chats: arrayUnion({
            messageID: collID,
            name: group_name,
            type: "group",
            members: [auth.currentUser.displayName],
          }),
        });
        setALertMessage("Group Created Successfully!");
        setOpenSuccAlert(true);
      } else {
        setALertMessage("Group Name Already in Use!");
        setOpenErrAlert(true);
      }
    }
    isValidGroup(group_name);
    setGroupName("");
    setOpenLeft(false);
  };

  const handleAddMember = (member, groupInfo) => {
    console.log(member, groupInfo);
    const index = chats?.findIndex(
      (item) => item.messageID === groupInfo.messageID
    );
    console.log(index);
    var temp = [];
    temp = groupInfo.members;
    temp.push(member);
    groupInfo.members = temp;
    chats[index] = groupInfo;
    console.log(groupInfo);
    async function addMember(user, groupInfo) {
      const docSnap = await getDoc(doc(db, `users/${user}`));
      console.log("Users:", docSnap.data());
      if (docSnap.exists()) {
        const _chatInfo = docSnap.data();
        var temp = [];
        temp = _chatInfo.chats;
        const ind = temp.findIndex(
          (item) => item.messageID === groupInfo.messageID
        );
        if (ind === -1) {
          temp.push(groupInfo);
        } else {
          temp[ind] = groupInfo;
        }

        console.log("Chat: ", temp);
        updateDoc(doc(db, `users/${user}`), {
          chats: temp,
        });
      }
    }
    temp.forEach((element) => {
      addMember(element, groupInfo);
    });
  };

  function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.toUpperCase().split(" ")[0][0]}`,
    };
  }
  function isInChat(username) {
    if (username === auth.currentUser.displayName) return true;
    const flag = chats?.find((item) => item.name === username);
    return flag;
  }

  //Render
  return (
    <div className="chatapp">
      <div className="button_container">
        <h2
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            color: "white",
            fontSize: "38px",
          }}
        >
          Chat-Ter
        </h2>
        <Add
          className="add_btn"
          fontSize="large"
          onClick={() => setOpenLeft(true)}
        />
      </div>
      <Collapse in={openErrAlert} onClick={() => setOpenErrAlert(false)}>
        <Alert severity="error">{alertMessage}</Alert>
      </Collapse>
      <Collapse in={openSuccAlert} onClick={() => setOpenSuccAlert(false)}>
        <Alert severity="success">{alertMessage}</Alert>
      </Collapse>
      <div className="chats_container">
        {chats
          ? chats.map((ele) =>
              ele.type === "group" ? (
                <div
                  className="chat_cell"
                  key={ele.messageID}
                  onClick={() => handleClick(ele)}
                >
                  <Avatar
                    className="chat_avatar"
                    {...stringAvatar(ele.name ? ele.name : "A")}
                  />
                  <h1>{ele?.name}</h1>
                </div>
              ) : (
                <div
                  className="chat_cell"
                  key={ele.messageID}
                  onClick={() => handleClick(ele)}
                >
                  <Avatar
                    className="chat_avatar"
                    {...stringAvatar(ele.name ? ele.name : "A")}
                  />
                  <h1>{ele?.name}</h1>
                </div>
              )
            )
          : ""}
      </div>

      <Drawer open={openLeft} anchor="right" onClose={() => setOpenLeft(false)}>
        <div className="drawer">
          <List>
            <ListItem onClick={() => setOpenLeft(false)}>
              <ListItemIcon>
                <AccountCircle className="account_icon"></AccountCircle>
              </ListItemIcon>
              <h1 className="user_text">{auth.currentUser?.displayName}</h1>
            </ListItem>
            <Divider color="white"></Divider>
            <ListItem>Add a Person</ListItem>
            <ListItem>
              <Input
                className="drawer_input"
                placeholder="Add Username"
                value={addUsername}
                type="text"
                onChange={(e) => setAddUsername(e.target.value)}
              ></Input>
              <Button
                onClick={() => handleAdd(addUsername)}
                style={{
                  color: "white",
                  border: "1px solid #c5c5c5",
                  borderRadius: "15px",
                }}
              >
                Add
              </Button>
            </ListItem>
            <Divider color="white"></Divider>
            <ListItem>Add a Group</ListItem>
            <ListItem>
              <Input
                className="drawer_input"
                placeholder="Group Name"
                value={groupName}
                type="text"
                onChange={(e) => setGroupName(e.target.value)}
              ></Input>
              <Button
                onClick={() => handleAddGroup(groupName)}
                style={{
                  color: "white",
                  border: "1px solid #c5c5c5",
                  borderRadius: "15px",
                }}
              >
                Add
              </Button>
            </ListItem>
            <Divider color="white"></Divider>
            <ListItem>
              <Button className="logout_btn" onClick={logout}>
                logout
              </Button>
            </ListItem>
          </List>
        </div>
      </Drawer>

      <Drawer open={openChat} onClose={() => setOpenChat(false)}>
        <div className="drawer">
          <List className="chat_list">
            <ListItem>
              <ListItemIcon>
                <KeyboardArrowLeft
                  className="back_icon"
                  fontSize="large"
                  onClick={() => setOpenChat(false)}
                />
              </ListItemIcon>
              <ListItemText>
                <h3 className="chat_name">{chatInfo?.name}</h3>
              </ListItemText>
            </ListItem>
          </List>
          <Chatbox
            username={auth?.currentUser?.displayName}
            messageID={chatInfo?.messageID}
          ></Chatbox>
        </div>
      </Drawer>

      <Drawer open={openGroupChat} onClose={() => setOpenGroupChat(false)}>
        <div className="drawer">
          <List className="chat_list">
            <ListItem>
              <ListItemIcon>
                <KeyboardArrowLeft
                  className="back_icon"
                  fontSize="large"
                  onClick={() => setOpenGroupChat(false)}
                />
              </ListItemIcon>
              <ListItemText>
                <h3 className="chat_name">{chatInfo?.name}</h3>
              </ListItemText>
              <ListItemIcon>
                <Add
                  className="back_icon"
                  fontSize="large"
                  onClick={() => setOpenGroupInfo(true)}
                />
              </ListItemIcon>
            </ListItem>
          </List>
          <Chatbox
            username={auth?.currentUser?.displayName}
            messageID={chatInfo?.messageID}
            isGroup
          ></Chatbox>
        </div>
      </Drawer>
      <Drawer
        open={openGroupInfo}
        anchor="right"
        onClose={() => setOpenGroupInfo(false)}
      >
        <List className="chat_list">
          <ListItem>
            <ListItemIcon>
              <KeyboardArrowRight
                className="back_icon"
                fontSize="large"
                onClick={() => setOpenGroupInfo(false)}
              />
            </ListItemIcon>
          </ListItem>
        </List>
        <List className="members_list drawer">
          <Divider color="white"></Divider>
          <ListItem>Members</ListItem>
          <Divider color="white"></Divider>
          {chatInfo?.members?.map((member) => {
            return (
              <ListItem key={member}>
                <ListItemIcon>
                  <Person className="user_icon" />
                </ListItemIcon>
                <ListItemText>
                  <p className="member_text">{member}</p>
                </ListItemText>
                {isInChat(member) ? (
                  ""
                ) : (
                  <ListItemIcon onClick={() => handleAdd(member)}>
                    <Add className="add_icon" fontSize="small"></Add>
                  </ListItemIcon>
                )}
              </ListItem>
            );
          })}
          <Divider color="white"></Divider>
          <ListItem>Add Members</ListItem>
          <Divider color="white"></Divider>
          {chats?.map((ele) => {
            if (ele.type === "chat") {
              const flag = chatInfo?.members?.find((item) => item === ele.name);
              if (!flag) {
                return (
                  <ListItem key={ele.name}>
                    <ListItemText>
                      <p className="member_text">{ele.name}</p>
                    </ListItemText>
                    <ListItemIcon
                      onClick={() => handleAddMember(ele.name, chatInfo)}
                    >
                      <Add className="add_icon" fontSize="small"></Add>
                    </ListItemIcon>
                  </ListItem>
                );
              }
            }
          })}
        </List>
      </Drawer>
    </div>
  );
}

export default ChatApp;
