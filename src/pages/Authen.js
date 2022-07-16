import React, { useEffect, useState } from "react";
import { Input, Button, Link, Collapse, Alert } from "@mui/material";
import "./Authen.css";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router";
import { addDoc, doc, getDoc, setDoc } from "firebase/firestore";
function Authen() {
  //States
  const [toggler, setToggler] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [openSigninAlert, setOpenSigninAlert] = useState(false);
  const [openSignupAlert, setOpenSignupAlert] = useState(false);
  let navigate = useNavigate();

  //Handlers
  const handleSignin = (event) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, email, password).catch((err) => {
      setMessage(err.message);
      setOpenSigninAlert(true);
    });
    setEmail("");
    setPassword("");
  };
  const handleSignup = (event) => {
    event.preventDefault();

    async function helper() {
      const docSnap = await getDoc(doc(db, "users", username));
      if (docSnap.exists()) {
        console.log("user already exist", docSnap.data());
        return false;
      } else {
        console.log(username + " " + email + " " + password);
        setDoc(doc(db, "users", username), {
          email: email,
        });
        createUserWithEmailAndPassword(auth, email, password)
          .then(() => {
            updateProfile(auth.currentUser, {
              displayName: username,
            });
          })
          .catch((err) => {
            setMessage(err.message);
            setOpenSignupAlert(true);
          });
        console.log("user does not exist");
        return true;
      }
    }

    const flag = helper();
    setEmail("");
    setPassword("");
  };
  //UseEffects
  useEffect(() => {
    onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        navigate("/chats", { replace: true });
      } else {
        setUser(null);
      }
    });
  }, []);

  //Render
  return (
    <div className="authentication">
      <div className={`sign_in_container ${toggler ? "show" : ""}`}>
        <div className="sign_in_form">
          <Collapse
            in={openSigninAlert}
            onClick={() => setOpenSigninAlert(false)}
          >
            <Alert severity="error">{message}</Alert>
          </Collapse>
          <Input
            className="form_input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            className="form_input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="form_button" onClick={handleSignin}>
            Sign In
          </Button>
          <Link href="#" onClick={() => setToggler(false)}>
            Dont have an Account? Sign Up!!
          </Link>
        </div>
      </div>
      <div className={`sign_up_container ${toggler ? "" : "show"}`}>
        <div className="sign_up_form">
          <Collapse
            in={openSignupAlert}
            onClick={() => setOpenSignupAlert(false)}
          >
            <Alert severity="error">{message}</Alert>
          </Collapse>
          <Input
            className="form_input"
            placeholder="UserName"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            className="form_input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            className="form_input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="form_button" onClick={handleSignup}>
            Sign Up
          </Button>
          <Link href="#" onClick={() => setToggler(true)}>
            Already have an Account? Sign In!!
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Authen;
