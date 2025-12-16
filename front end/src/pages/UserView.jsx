import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "@/UserContext";
import { Spinner } from "@/components/ui/spinner";
import UserCard from "@/components/UserCard";
import Event from "@/components/Event";
import { MapPin, Users, UserCheck, UserPlus, UserMinus, UserX, Calendar, Star } from "lucide-react";

export default function UserView() {
  const { username } = useParams();
  const { user: currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [relationshipStatus, setRelationshipStatus] = useState(null);
  const [friends, setFriends] = useState([]);
  const [followedOrganizers, setFollowedOrganizers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [events, setEvents] = useState([]);
  const [canViewFriends, setCanViewFriends] = useState(false);
  const [canViewFollowedOrganizers, setCanViewFollowedOrganizers] = useState(false);
  const [canViewFollowers, setCanViewFollowers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:8000/attendeeUtils";
  const EVENT_API_BASE_URL = "http://localhost:8000/event";

  // Determine viewer and target user types
  const isViewerAttendee = currentUser?.status === "Attendee";
  const isViewerOrganizer = currentUser?.status === "Organizer";
  const isTargetAttendee = userData?.status === "Attendee";
  const isTargetOrganizer = userData?.status === "Organizer";

  useEffect(() => {
    fetchUserData();
  }, [username]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user info
      const userRes = await fetch(`${API_BASE_URL}/getuserview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });

      if (!userRes.ok) {
        setError("User not found");
        setLoading(false);
        return;
      }

      const userData = await userRes.json();
      
      if (userData.error) {
        setError(userData.message);
        setLoading(false);
        return;
      }

      setUserData(userData);

      // Fetch relationship status
      const relationRes = await fetch(`${API_BASE_URL}/getrelationshipstatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });
      const relationData = await relationRes.json();
      setRelationshipStatus(relationData.status);

      // Fetch friends and followed organizers if user is Attendee
      if (userData.status === "Attendee") {
        // Fetch friends
        const friendsRes = await fetch(`${API_BASE_URL}/getuserfriendswithprivacy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
          credentials: "include",
        });
        const friendsData = await friendsRes.json();
        setCanViewFriends(friendsData.can_view);
        setFriends(friendsData.friends || []);

        // Fetch followed organizers
        const followedRes = await fetch(`${API_BASE_URL}/getuserfollowedorganizerswithprivacy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
          credentials: "include",
        });
        const followedData = await followedRes.json();
        setCanViewFollowedOrganizers(followedData.can_view);
        setFollowedOrganizers(followedData.followed_organizers || []);
      }

      // Fetch followers if user is Organizer
      if (userData.status === "Organizer") {
        const followersRes = await fetch(`${API_BASE_URL}/getuserfollowerswithprivacy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
          credentials: "include",
        });
        const followersData = await followersRes.json();
        setCanViewFollowers(followersData.can_view);
        setFollowers(followersData.followers || []);

        // Fetch organizer's events (always visible)
        await fetchOrganizerEvents(username);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizerEvents = async (organizerUsername) => {
    setEventsLoading(true);
    try {
      const response = await fetch(`${EVENT_API_BASE_URL}/getevents/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_username: organizerUsername }),
        credentials: "include",
      });

      const data = await response.json();
      if (data.organizer_events) {
        setEvents(data.organizer_events);
      }
    } catch (error) {
      console.error("Error fetching organizer events:", error);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/addfriend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver: userId }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.sent) {
        setRelationshipStatus("sent_request");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/removefriend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee: userId }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setRelationshipStatus("none");
        fetchUserData();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cancelfriendrequests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee: userId }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setRelationshipStatus("none");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/respondtofriendrequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee: userId, response: true }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setRelationshipStatus("friends");
        fetchUserData();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/respondtofriendrequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee: userId, response: false }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setRelationshipStatus("none");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBlock = async (userId) => {
    try {
      // Only attendees can block other attendees (friends only)
      const response = await fetch(`${API_BASE_URL}/blockunblockuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee: userId, action: true }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        navigate(-1);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/followorganizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizer: userId }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setRelationshipStatus("following");
        fetchUserData();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unfolloworganizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizer: userId }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setRelationshipStatus("none");
        fetchUserData();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRemoveFollower = async (attendeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unfolloworganizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee: attendeeId }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        fetchUserData();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getActionButtons = () => {
    if (relationshipStatus === "self") return null;

    // ATTENDEE viewing ORGANIZER profile
    if (isViewerAttendee && isTargetOrganizer) {
      switch (relationshipStatus) {
        case "none":
          return (
            <button
              type="button"
              onClick={() => handleFollow(username)}
              className="bg-green-500 hover:bg-green-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Follow
            </button>
          );
        case "following":
          return (
            <button
              type="button"
              onClick={() => handleUnfollow(username)}
              className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
            >
              <UserX className="w-4 h-4 mr-2" />
              Unfollow
            </button>
          );
        default:
          return null;
      }
    }

    // ATTENDEE viewing ATTENDEE profile
    if (isViewerAttendee && isTargetAttendee) {
      switch (relationshipStatus) {
        case "none":
          return (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAddFriend(username)}
                className="bg-blue-500 hover:bg-blue-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </button>
              <button
                type="button"
                onClick={() => handleBlock(username)}
                className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Block
              </button>
            </div>
          );
        case "friends":
          return (
            <button
              type="button"
              onClick={() => handleRemoveFriend(username)}
              className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Remove Friend
            </button>
          );
        case "sent_request":
          return (
            <button
              type="button"
              onClick={() => handleCancelRequest(username)}
              className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
            >
              <UserX className="w-4 h-4 mr-2" />
              Cancel Request
            </button>
          );
        case "received_request":
          return (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAcceptRequest(username)}
                className="bg-green-500 hover:bg-green-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Accept
              </button>
              <button
                type="button"
                onClick={() => handleRejectRequest(username)}
                className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
              >
                <UserX className="w-4 h-4 mr-2" />
                Reject
              </button>
            </div>
          );
        default:
          return null;
      }
    }

    // ORGANIZER viewing ATTENDEE profile - no buttons
    return null;
  };

  const getFollowerStatusBadge = () => {
    // Show for organizer viewing attendee who follows them
    if (isViewerOrganizer && isTargetAttendee && relationshipStatus === "following") {
      return (
        <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
          Follows You
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold text-sidebar-foreground mb-4">404</h1>
        <p className="text-sidebar-foreground/60 mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full px-32 py-8">
      {relationshipStatus === "self" && (
        <div className="w-full max-w-4xl mb-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2">
            <p className="text-blue-600 dark:text-blue-400 font-semibold text-center">
              Public View - This is how others see your profile
            </p>
          </div>
        </div>
      )}

      {/* User Info Card */}
      <div className="w-full max-w-4xl bg-card border border-sidebar-border rounded-xl shadow-2xl p-8 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {userData?.first_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-sidebar-foreground">
                  {userData?.first_name} {userData?.last_name}
                </h1>
                {getFollowerStatusBadge()}
              </div>
              <p className="text-sidebar-foreground/60 text-lg mb-1">@{userData?.username}</p>
              <div className="flex items-center gap-4 text-sidebar-foreground/60">
                {userData?.city && userData?.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{userData.city}, {userData.country}</span>
                  </div>
                )}
                {userData?.status && (
                  <span className="bg-sidebar-accent text-sidebar-accent-foreground px-3 py-1 rounded-full text-sm">
                    {userData.status}
                  </span>
                )}
                {/* Show follower count for organizers (always visible) */}
                {isTargetOrganizer && userData?.follower_count !== null && (
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-4 h-4" />
                    <span>{userData.follower_count} Followers</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center">
            {getActionButtons()}
          </div>
        </div>
      </div>

      {/* Organizer Events Section - Always visible for organizers */}
      {isTargetOrganizer && (
        <div className="w-full max-w-4xl bg-card border border-sidebar-border rounded-xl shadow-2xl p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-sidebar-foreground" />
            <h2 className="text-2xl font-bold text-sidebar-foreground">
              Events ({events.length})
            </h2>
          </div>
          
          {eventsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sidebar-foreground/60">
                This organizer hasn't created any events yet
              </p>
            </div>
          ) : (
            <div className="flex gap-5 flex-wrap">
              {events.map((event) => (
                <Event
                  key={event.event_id}
                  eventId={event.event_id}
                  title={event.name}
                  img={event.banner || "/fallback.png"}
                  priceRange={{
                    minPrice: event.min_price || 0,
                    maxPrice: event.max_price || 0,
                    currency: "EGP",
                  }}
                  startDate={event.start_date}
                  endDate={event.end_date}
                  allEventsMode={false}
                  adminOrOrgMode={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friends Section - Only for Attendees */}
      {isTargetAttendee && canViewFriends && friends.length > 0 && (
        <div className="w-full max-w-4xl bg-card border border-sidebar-border rounded-xl shadow-2xl p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-sidebar-foreground" />
            <h2 className="text-2xl font-bold text-sidebar-foreground">
              Friends ({friends.length})
            </h2>
          </div>
          <div className="space-y-3">
            {friends.map((friend) => (
              <UserCard
                key={friend}
                userId={friend}
                variant="view"
                showButtons={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Followed Organizers Section - Only for Attendees */}
      {isTargetAttendee && canViewFollowedOrganizers && followedOrganizers.length > 0 && (
        <div className="w-full max-w-4xl bg-card border border-sidebar-border rounded-xl shadow-2xl p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-6 h-6 text-sidebar-foreground" />
            <h2 className="text-2xl font-bold text-sidebar-foreground">
              Following ({followedOrganizers.length})
            </h2>
          </div>
          <div className="space-y-3">
            {followedOrganizers.map((organizer) => (
              <UserCard
                key={organizer}
                userId={organizer}
                variant="view"
                showButtons={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Followers Section - Only for Organizers */}
      {isTargetOrganizer && canViewFollowers && followers.length > 0 && (
        <div className="w-full max-w-4xl bg-card border border-sidebar-border rounded-xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-6 h-6 text-sidebar-foreground" />
            <h2 className="text-2xl font-bold text-sidebar-foreground">
              Followers ({followers.length})
            </h2>
          </div>
          <div className="space-y-3">
            {followers.map((follower) => (
              <UserCard
                key={follower}
                userId={follower}
                variant={isViewerOrganizer && relationshipStatus === "self" ? "follower-removable" : "view"}
                showButtons={isViewerOrganizer && relationshipStatus === "self"}
                onRemoveFollower={isViewerOrganizer && relationshipStatus === "self" ? handleRemoveFollower : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Privacy Messages */}
      {isTargetAttendee && !canViewFriends && relationshipStatus !== "self" && (
        <div className="w-full max-w-4xl bg-card border border-sidebar-border rounded-xl shadow-2xl p-8 mb-6">
          <p className="text-center text-sidebar-foreground/60">
            This user's friends list is private
          </p>
        </div>
      )}

      {isTargetAttendee && !canViewFollowedOrganizers && relationshipStatus !== "self" && (
        <div className="w-full max-w-4xl bg-card border border-sidebar-border rounded-xl shadow-2xl p-8 mb-6">
          <p className="text-center text-sidebar-foreground/60">
            This user's followed organizers list is private
          </p>
        </div>
      )}

      {isTargetOrganizer && !canViewFollowers && relationshipStatus !== "self" && (
        <div className="w-full max-w-4xl bg-card border border-sidebar-border rounded-xl shadow-2xl p-8">
          <p className="text-center text-sidebar-foreground/60">
            This organizer's followers list is private
          </p>
        </div>
      )}
    </div>
  );
}