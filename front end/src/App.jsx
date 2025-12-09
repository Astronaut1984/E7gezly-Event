import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/sign up/signup.jsx";
import Events from "./pages/events/Events.jsx";
import "./index.css";
import User from "./pages/dashboards/user-dashboard/User";
import Admin from "./pages/dashboards/admin-dashboard/Admin";

function App() {
  return (
    <Routes>
      <Route path="/" index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/events" element={<Events />} />
      <Route path="/user" element={<User />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
