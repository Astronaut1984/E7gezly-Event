import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/UserContext";
import Input from "@/components/Input";
import { Spinner } from "@/components/ui/spinner";
import { UserMinus, UserCheck, UserX, UserPlus, Search } from "lucide-react";

export default function AttendeeFriends() {
  const { user } = useContext(UserContext);
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [unblockedUsers, setUnblockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("friends");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    user: null,
  });

  const API_BASE_URL = "http://localhost:8000/attendeeUtils";

  useEffect(() => {
    fetchAllFriendsData();
    fetchUnblockedUsers();
  }, []);

  const fetchAllFriendsData = async () => {
    setLoading(true);
    try {
      const username = user?.username;

      // Get friends
      const friendsRes = await fetch(`${API_BASE_URL}/getuserfriends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });
      const friendsData = await friendsRes.json();
      setFriends(friendsData.friends || []);

      // Get sent requests
      const sentRes = await fetch(`${API_BASE_URL}/getsentfriendrequests`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const sentData = await sentRes.json();
      setSentRequests(sentData.requests || []);

      // Get received requests
      const receivedRes = await fetch(
        `${API_BASE_URL}/getreceivedfriendrequests`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const receivedData = await receivedRes.json();
      setReceivedRequests(receivedData.requests || []);

      // Get blocked users
      const blockedRes = await fetch(`${API_BASE_URL}/getblockedusers`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const blockedData = await blockedRes.json();
      setBlockedUsers(blockedData.Blocked || []);
    } catch (error) {
      console.error("Error fetching friends data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnblockedUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getunblockedusers`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      setUnblockedUsers(data.unblockedUsers || []);
    } catch (error) {
      console.error("Error fetching unblocked users:", error);
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
        setSentRequests([...sentRequests, userId]);
        setConfirmDialog({ isOpen: false, type: null, user: null });
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/blockunblockuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee: friendId, action: true }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setFriends(friends.filter((f) => f !== friendId));
        setBlockedUsers([...blockedUsers, friendId]);
        setConfirmDialog({ isOpen: false, type: null, user: null });
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/blockunblockuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee: userId, action: false }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setBlockedUsers(blockedUsers.filter((u) => u !== userId));
        setUnblockedUsers([...unblockedUsers, userId]);
        setConfirmDialog({ isOpen: false, type: null, user: null });
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/respondtofriendrequest`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendee: userId, response: false }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!data.error) {
        setSentRequests(sentRequests.filter((r) => r !== userId));
        setConfirmDialog({ isOpen: false, type: null, user: null });
      }
    } catch (error) {
      console.error("Error canceling request:", error);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/respondtofriendrequest`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendee: userId, response: true }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!data.error) {
        setReceivedRequests(receivedRequests.filter((r) => r !== userId));
        setFriends([...friends, userId]);
        setConfirmDialog({ isOpen: false, type: null, user: null });
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/respondtofriendrequest`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendee: userId, response: false }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!data.error) {
        setReceivedRequests(receivedRequests.filter((r) => r !== userId));
        setConfirmDialog({ isOpen: false, type: null, user: null });
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const filterBySearch = (list) => {
    if (!searchTerm.trim()) return list;
    return list.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getAddFriendButtonState = (userId) => {
    if (friends.includes(userId)) return { disabled: true, text: "Friend", icon: null };
    if (sentRequests.includes(userId)) return { disabled: true, text: "Sent", icon: null };
    if (receivedRequests.includes(userId)) return { disabled: true, text: "Pending", icon: null };
    return { disabled: false, text: "Add Friend", icon: UserPlus };
  };

  const FriendCard = ({ userId }) => (
    <div className="flex justify-between items-center w-full border-2 border-gray-300 p-4 mb-3 rounded-lg hover:shadow-md transition-shadow bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {userId.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-gray-800">{userId}</span>
      </div>
      <button
        type="button"
        onClick={() =>
          setConfirmDialog({
            isOpen: true,
            type: "remove",
            user: userId,
          })
        }
        className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg"
      >
        <UserMinus className="w-4 h-4 mr-2" />
        Remove
      </button>
    </div>
  );

  const RequestCard = ({ userId, isSent }) => (
    <div className="flex justify-between items-center w-full border-2 border-gray-300 p-4 mb-3 rounded-lg hover:shadow-md transition-shadow bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {userId.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-gray-800">{userId}</span>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
          {isSent ? "Sent" : "Received"}
        </span>
      </div>
      <div className="flex gap-2">
        {isSent ? (
          <button
            type="button"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                type: "cancelRequest",
                user: userId,
              })
            }
            className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg"
          >
            <UserX className="w-4 h-4 mr-2" />
            Cancel
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                setConfirmDialog({
                  isOpen: true,
                  type: "acceptRequest",
                  user: userId,
                })
              }
              className="bg-green-500 hover:bg-green-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Accept
            </button>
            <button
              type="button"
              onClick={() =>
                setConfirmDialog({
                  isOpen: true,
                  type: "rejectRequest",
                  user: userId,
                })
              }
              className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg"
            >
              <UserX className="w-4 h-4 mr-2" />
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );

  const BlockedCard = ({ userId }) => (
    <div className="flex justify-between items-center w-full border-2 border-red-300 p-4 mb-3 rounded-lg hover:shadow-md transition-shadow bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {userId.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-gray-800">{userId}</span>
        <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full">
          Blocked
        </span>
      </div>
      <button
        type="button"
        onClick={() =>
          setConfirmDialog({
            isOpen: true,
            type: "unblock",
            user: userId,
          })
        }
        className="bg-green-500 hover:bg-green-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg"
      >
        <UserCheck className="w-4 h-4 mr-2" />
        Unblock
      </button>
    </div>
  );

  const AddFriendCard = ({ userId }) => {
    const state = getAddFriendButtonState(userId);
    return (
      <div className="flex justify-between items-center w-full border-2 border-gray-300 p-4 mb-3 rounded-lg hover:shadow-md transition-shadow bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userId.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-800">{userId}</span>
        </div>
        <button
          type="button"
          onClick={() =>
            setConfirmDialog({
              isOpen: true,
              type: "addFriend",
              user: userId,
            })
          }
          disabled={state.disabled}
          className={`text-[14px] flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg ${
            state.disabled
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {state.icon && <state.icon className="w-4 h-4 mr-2" />}
          {state.text}
        </button>
      </div>
    );
  };

  const ConfirmDialog = () => {
    if (!confirmDialog.isOpen) return null;

    const getDialogContent = () => {
      switch (confirmDialog.type) {
        case "addFriend":
          return {
            title: "Send Friend Request",
            message: `Send friend request to ${confirmDialog.user}?`,
            action: () => handleAddFriend(confirmDialog.user),
            buttonText: "Send",
            buttonClass: "bg-blue-500 hover:bg-blue-600",
          };
        case "remove":
          return {
            title: "Remove Friend",
            message: `Are you sure you want to remove ${confirmDialog.user} from your friends?`,
            action: () => handleRemoveFriend(confirmDialog.user),
            buttonText: "Remove",
            buttonClass: "bg-red-500 hover:bg-red-600",
          };
        case "cancelRequest":
          return {
            title: "Cancel Request",
            message: `Cancel friend request to ${confirmDialog.user}?`,
            action: () => handleCancelRequest(confirmDialog.user),
            buttonText: "Cancel",
            buttonClass: "bg-red-500 hover:bg-red-600",
          };
        case "acceptRequest":
          return {
            title: "Accept Request",
            message: `Accept friend request from ${confirmDialog.user}?`,
            action: () => handleAcceptRequest(confirmDialog.user),
            buttonText: "Accept",
            buttonClass: "bg-green-500 hover:bg-green-600",
          };
        case "rejectRequest":
          return {
            title: "Reject Request",
            message: `Reject friend request from ${confirmDialog.user}?`,
            action: () => handleRejectRequest(confirmDialog.user),
            buttonText: "Reject",
            buttonClass: "bg-red-500 hover:bg-red-600",
          };
        case "unblock":
          return {
            title: "Unblock User",
            message: `Unblock ${confirmDialog.user}? They'll be able to send you friend requests again.`,
            action: () => handleUnblock(confirmDialog.user),
            buttonText: "Unblock",
            buttonClass: "bg-green-500 hover:bg-green-600",
          };
        default:
          return null;
      }
    };

    const content = getDialogContent();
    if (!content) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
          <h2 className="text-xl font-bold mb-2">{content.title}</h2>
          <p className="text-gray-600 mb-6">{content.message}</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                setConfirmDialog({ isOpen: false, type: null, user: null })
              }
              className="bg-gray-300 hover:bg-gray-400 text-[14px] text-gray-800 flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={content.action}
              className={`${content.buttonClass} text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg`}
            >
              {content.buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1>My Friends</h1>
      <div className="flex flex-wrap w-full px-32 shadow-2xl py-5 rounded-xl bg-card mt-3">
        {/* Tabs Navigation */}
        <div className="flex w-full border-b-2 border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("friends");
              setSearchTerm("");
            }}
            className={`px-6 py-3 font-semibold text-[16px] border-b-4 transition-colors ${
              activeTab === "friends"
                ? "border-primary-hover text-primary-hover"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("requests");
              setSearchTerm("");
            }}
            className={`px-6 py-3 font-semibold text-[16px] border-b-4 transition-colors ${
              activeTab === "requests"
                ? "border-primary-hover text-primary-hover"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Requests ({sentRequests.length + receivedRequests.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("blocked");
              setSearchTerm("");
            }}
            className={`px-6 py-3 font-semibold text-[16px] border-b-4 transition-colors ${
              activeTab === "blocked"
                ? "border-primary-hover text-primary-hover"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Blocked ({blockedUsers.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("discover");
              setSearchTerm("");
            }}
            className={`px-6 py-3 font-semibold text-[16px] border-b-4 transition-colors ${
              activeTab === "discover"
                ? "border-primary-hover text-primary-hover"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Discover
          </button>
        </div>

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <div className="w-full">
            <div className="mb-4 w-full">
              <Input
                title="Search Friends"
                type="text"
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filterBySearch(friends).length === 0 ? (
              <div className="text-center py-12 w-full">
                <p className="text-gray-500 text-[16px]">
                  {friends.length === 0
                    ? "You don't have any friends yet"
                    : "No friends match your search"}
                </p>
              </div>
            ) : (
              <div className="w-full">
                {filterBySearch(friends).map((friend) => (
                  <FriendCard key={friend} userId={friend} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="w-full">
            {receivedRequests.length > 0 && (
              <div className="mb-6 w-full">
                <h3 className="font-semibold text-gray-800 mb-3 text-[18px]">
                  Received Requests
                </h3>
                <div className="w-full">
                  {receivedRequests.map((request) => (
                    <RequestCard
                      key={request}
                      userId={request}
                      isSent={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {sentRequests.length > 0 && (
              <div className="mb-6 w-full">
                <h3 className="font-semibold text-gray-800 mb-3 text-[18px]">
                  Sent Requests
                </h3>
                <div className="w-full">
                  {sentRequests.map((request) => (
                    <RequestCard key={request} userId={request} isSent={true} />
                  ))}
                </div>
              </div>
            )}

            {receivedRequests.length === 0 && sentRequests.length === 0 && (
              <div className="text-center py-12 w-full">
                <p className="text-gray-500 text-[16px]">
                  No pending friend requests
                </p>
              </div>
            )}
          </div>
        )}

        {/* Blocked Tab */}
        {activeTab === "blocked" && (
          <div className="w-full">
            {blockedUsers.length === 0 ? (
              <div className="text-center py-12 w-full">
                <p className="text-gray-500 text-[16px]">
                  You haven't blocked anyone
                </p>
              </div>
            ) : (
              <div className="w-full">
                {blockedUsers.map((user) => (
                  <BlockedCard key={user} userId={user} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === "discover" && (
          <div className="w-full">
            <div className="mb-4 w-full">
              <Input
                title="Search Users to Add"
                type="text"
                placeholder="Search by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filterBySearch(unblockedUsers).length === 0 ? (
              <div className="text-center py-12 w-full">
                <p className="text-gray-500 text-[16px]">
                  {unblockedUsers.length === 0
                    ? "No users available to add"
                    : "No users match your search"}
                </p>
              </div>
            ) : (
              <div className="w-full">
                {filterBySearch(unblockedUsers).map((user) => (
                  <AddFriendCard key={user} userId={user} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog />
    </div>
  );
}