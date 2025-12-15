import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/sign up/signup.jsx";
import Events from "./pages/events/Events.jsx";
import "./index.css";
import User from "./pages/dashboards/att-dashboard/Attendee";
import AdminEvents from "./pages/dashboards/admin-dashboard/adminEvents";
import { Admin, adminItems } from "./pages/dashboards/admin-dashboard/Admin";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedAdminRoute";
import AdminVenues from "./pages/dashboards/admin-dashboard/adminVenues";
import AdminReportCases from "./pages/dashboards/admin-dashboard/AdminReportCases";
import AdminOrg from "./pages/dashboards/admin-dashboard/adminOrg";
import { DashboardSideBar } from "./components/DashboardComponents/DashboardSideBar";
import {
  Organizer,
  orgItems,
} from "./pages/dashboards/org-dashboard/Organizer";
import OrganizerAddEvents from "./pages/dashboards/org-dashboard/OrganizerAddEvents";
import OrganizerMyEvents from "./pages/dashboards/org-dashboard/OrganizerMyEvents";
import OrganizerFollowers from "./pages/dashboards/org-dashboard/OrganizerFollowers";
import OrganizerChat from "./pages/dashboards/org-dashboard/OrganizerChat";
import AdminPerformers from "./pages/dashboards/admin-dashboard/AdminPerformers";
import { attItems } from "./pages/dashboards/att-dashboard/Attendee";
import Attendee from "./pages/dashboards/att-dashboard/Attendee";
import AttendeeEvents from "./pages/dashboards/att-dashboard/AttendeeEvents";
import AttendeeFriends from "./pages/dashboards/att-dashboard/AttendeeFriends";
import AttendeeFollowedOrg from "./pages/dashboards/att-dashboard/AttendeeFollowedOrg";
import AttendeeWishlist from "./pages/dashboards/att-dashboard/AttendeeWishlist";
import EventPage from "./components/EventPage";
import UserView from "./pages/UserView";
import AttendeeChat from "./pages/dashboards/att-dashboard/AttendeeChat";

function App() {
  return (
    <Routes>
      <Route path="/" index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventPage />} />
      <Route path="/user" element={<User />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="Administrator">
            <Layout sidebar={<DashboardSideBar items={adminItems} />} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Admin />} />
        <Route path="venues" element={<AdminVenues />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="org" element={<AdminOrg />} />
        <Route path="reportcase" element={<AdminReportCases />} />
        <Route path="performers" element={<AdminPerformers />} />
        <Route path="user/:username" element={<UserView />} />
      </Route>
      
      {/* Organizer Routes */}
      <Route
        path="/org"
        element={
          <ProtectedRoute role="Organizer">
            <Layout sidebar={<DashboardSideBar items={orgItems} />} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Organizer />} />
        <Route path="add-events" element={<OrganizerAddEvents />} />
        <Route path="followers" element={<OrganizerFollowers />} />
        <Route path="my-events" element={<OrganizerMyEvents />} />
        <Route path="chat" element={<OrganizerChat />} />
        <Route path="user/:username" element={<UserView />} />
      </Route>
      
      {/* Attendee Routes */}
      <Route
        path="/att"
        element={
          <ProtectedRoute role="Attendee">
            <Layout sidebar={<DashboardSideBar items={attItems} />} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Attendee />} />
        <Route path="my-events" element={<AttendeeEvents />} />
        <Route path="friends" element={<AttendeeFriends />} />
        <Route path="followed-org" element={<AttendeeFollowedOrg />} />
        <Route path="wishlist" element={<AttendeeWishlist />} />
        <Route path="chat" element={<AttendeeChat />} />
        <Route path="user/:username" element={<UserView />} />
      </Route>
    </Routes>
  );
}

export default App;