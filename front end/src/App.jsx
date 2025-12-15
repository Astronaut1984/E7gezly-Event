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

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="Administrator">
            <Layout sidebar={<DashboardSideBar items={adminItems} />} />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" index element={<Admin />} />
        <Route path="/admin/venues" element={<AdminVenues />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/org" element={<AdminOrg />} />
        <Route path="/admin/reportcase" element={<AdminReportCases />} />
        <Route path="/admin/performers" element={<AdminPerformers />} />
        <Route path="/admin/user/:username" element={<UserView />} />
      </Route>

      <Route
        path="/org"
        element={
          <ProtectedRoute role="Organizer">
            <Layout sidebar={<DashboardSideBar items={orgItems} />} />
          </ProtectedRoute>
        }
      >
        <Route path="/org" index element={<Organizer />} />
        <Route path="/org/add-events" element={<OrganizerAddEvents />} />
        <Route path="/org/followers" element={<OrganizerFollowers />} />
        <Route path="/org/my-events" element={<OrganizerMyEvents />} />
        <Route path="/org/chat" element={<OrganizerChat />} />
        <Route path="/org/user/:username" element={<UserView />} />
      </Route>

      <Route
        path="/att"
        element={
          <ProtectedRoute role="Attendee">
            <Layout sidebar={<DashboardSideBar items={attItems} />} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/att"
        element={
          <ProtectedRoute role="Attendee">
            <Layout sidebar={<DashboardSideBar items={attItems} />} />
          </ProtectedRoute>
        }
      >
        <Route path="/att" index element={<Attendee />} />
        <Route path="/att/my-events" index element={<AttendeeEvents />} />
        <Route path="/att/friends" index element={<AttendeeFriends />} />
        <Route
          path="/att/followed-org"
          index
          element={<AttendeeFollowedOrg />}
        />
        <Route path="/att/wishlist" index element={<AttendeeWishlist />} />
        <Route path="/att/user/:username" element={<UserView />} />
        <Route path="/att" index element={<Attendee />} />
        <Route path="/att/my-events" index element={<AttendeeEvents />} />
        <Route path="/att/friends" index element={<AttendeeFriends />} />
        <Route
          path="/att/followed-org"
          index
          element={<AttendeeFollowedOrg />}
        />
        <Route path="/att/wishlist" index element={<AttendeeWishlist />} />
        <Route path="/att/chat" element={<AttendeeChat />} />
      </Route>
    </Routes>
  );
}

export default App;
