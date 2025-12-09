import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/sign up/signup.jsx";
import Events from "./pages/events/Events.jsx";
import "./index.css";
import User from "./pages/dashboards/user-dashboard/User";
import AdminEvents from "./pages/dashboards/admin-dashboard/adminEvents";
import { Admin, AdminSideBar } from "./pages/dashboards/admin-dashboard/Admin";
import Layout from "./components/Layout";
import AdminVenues from "./pages/dashboards/admin-dashboard/adminVenues";
import AdminOrg from "./pages/dashboards/admin-dashboard/adminOrg";

function App() {
  return (
    <Routes>
      <Route path="/" index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/events" element={<Events />} />
      <Route path="/user" element={<User />} />
      <Route path="/admin" element={<Layout sidebar={<AdminSideBar />} />}>
        <Route path="/admin" index element={<Admin />} />
        <Route path="/admin/venues" element={<AdminVenues />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/org" element={<AdminOrg />} />
      </Route>
    </Routes>
  );
}

export default App;
