import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Authen from "./pages/Authen";
import Chatbox from "./pages/Chatbox";
import ChatApp from "./pages/ChatApp";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Authen />}></Route>
          <Route exact path="/chats" element={<ChatApp />}></Route>
          <Route exact path="/chatbox" element={<Chatbox />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
