import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "@/UserContext";
import { Spinner } from "@/components/ui/spinner";
import UserCard from "@/components/UserCard";
import { MapPin, Users, UserCheck, UserPlus, Ban, UserMinus, UserX } from "lucide-react";

export default function UserView() {
  const { username } = useParams();
  const { user: currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [relationshipStatus, setRelationshipStatus] = useState(null);
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [canViewFriends, setCanViewFriends] = useState(false);
  const [canViewFollowers, setCanViewFollowers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:8000/attendeeUtils";

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

      // Fetch friends if user is Attendee
      if (userData.status === "Attendee") {
        const friendsRes = await fetch(`${API_BASE_URL}/getuserfriendswithprivacy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
          credentials: "include",
        });
        const friendsData = await friendsRes.json();
        setCanViewFriends(friendsData.can_view);
        setFriends(friendsData.friends || []);
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
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
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

  const handleUnfollow = async (userId) => {
    try {
      // TODO: Implement unfollow endpoint
      console.log("Unfollow:", userId);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getActionButtons = () => {
    if (relationshipStatus === "self") return null;
    if (!userData || userData.status !== "Attendee") return null; // TODO: Handle organizer actions

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
              <Ban className="w-4 h-4 mr-2" />
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
              <h1 className="text-3xl font-bold text-sidebar-foreground mb-2">
                {userData?.first_name} {userData?.last_name}
              </h1>
              <p className="text-sidebar-foreground/60 text-lg mb-1">@{userData?.username}</p>
              <div className="flex items-center gap-4 text-sidebar-foreground/60">
                {userData?.city && userData?.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{userData.city}, {userData.country}</span>
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

      {/* Friends Section */}
      {userData?.status === "Attendee" && canViewFriends && friends.length > 0 && (
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

      {/* Followers Section */}
      {userData?.status === "Organizer" && canViewFollowers && followers.length > 0 && (
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
                variant="view"
                showButtons={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Privacy Message */}
      {userData?.status === "Attendee" && !canViewFriends && relationshipStatus !== "self" && (
        <div className="w-full max-w-4xl bg-card border border-sidebar-border rounded-xl shadow-2xl p-8">
          <p className="text-center text-sidebar-foreground/60">
            This user's friends list is private
          </p>
        </div>
      )}

      {userData?.status === "Organizer" && !canViewFollowers && relationshipStatus !== "self" && (
        <div className="w-full max-w-4xl bg-card border border-sidebar-border rounded-xl shadow-2xl p-8">
          <p className="text-center text-sidebar-foreground/60">
            This user's followers list is private
          </p>
        </div>
      )}
    </div>
  );
}