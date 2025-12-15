import { useState, useEffect, useContext, useMemo } from "react";
import { UserContext } from "@/UserContext";
import Input from "@/components/Input";
import { Spinner } from "@/components/ui/spinner";
import { UserMinus, UserCheck, UserX, UserPlus } from "lucide-react";

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
  const [tabDataLoaded, setTabDataLoaded] = useState({
    friends: false,
    requests: false,
    blocked: false,
    discover: false,
  });
  const [counts, setCounts] = useState({
    friends: 0,
    total_requests: 0,
    blocked: 0,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    user: null,
  });

  const API_BASE_URL = "http://localhost:8000/attendeeUtils";

  // Fetch counts on mount
  useEffect(() => {
    fetchCounts();
    fetchFriendsData();
  }, []);

  // Lazy load data when switching tabs
  useEffect(() => {
    if (!tabDataLoaded[activeTab]) {
      fetchTabData(activeTab);
    }
  }, [activeTab]);

  const fetchCounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getfriendscounts`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setCounts(data);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const fetchFriendsData = async () => {
    setLoading(true);
    try {
      const username = user?.username;
      const response = await fetch(`${API_BASE_URL}/getuserfriends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });
      const data = await response.json();
      setFriends(data.friends || []);
      setTabDataLoaded(prev => ({ ...prev, friends: true }));
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case "friends":
          await fetchFriendsData();
          break;
        case "requests":
          await fetchRequestsData();
          break;
        case "blocked":
          await fetchBlockedData();
          break;
        case "discover":
          await fetchDiscoverData();
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestsData = async () => {
    try {
      const [sentRes, receivedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/getsentfriendrequests`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/getreceivedfriendrequests`, {
          method: "GET",
          credentials: "include",
        }),
      ]);

      const [sentData, receivedData] = await Promise.all([
        sentRes.json(),
        receivedRes.json(),
      ]);

      setSentRequests(sentData.requests || []);
      setReceivedRequests(receivedData.requests || []);
      setTabDataLoaded(prev => ({ ...prev, requests: true }));
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchBlockedData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getblockedusers`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setBlockedUsers(data.Blocked || []);
      setTabDataLoaded(prev => ({ ...prev, blocked: true }));
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  };

  const fetchDiscoverData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getunblockedusers`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setUnblockedUsers(data.unblockedUsers || []);
      setTabDataLoaded(prev => ({ ...prev, discover: true }));
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
        setUnblockedUsers(unblockedUsers.filter(u => u !== userId));
        setCounts(prev => ({ ...prev, total_requests: prev.total_requests + 1 }));
        setConfirmDialog({ isOpen: false, type: null, user: null });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/removefriend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee: friendId }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setFriends(friends.filter((f) => f !== friendId));
        setUnblockedUsers([...unblockedUsers, friendId]);
        setCounts(prev => ({ ...prev, friends: prev.friends - 1 }));
        setConfirmDialog({ isOpen: false, type: null, user: null });
      }
    } catch (error) {
      console.error("Error:", error);
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
        setCounts(prev => ({ ...prev, blocked: prev.blocked - 1 }));
        setConfirmDialog({ isOpen: false, type: null, user: null });
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
        setSentRequests(sentRequests.filter((r) => r !== userId));
        setUnblockedUsers([...unblockedUsers, userId]);
        setCounts(prev => ({ ...prev, total_requests: prev.total_requests - 1 }));
        setConfirmDialog({ isOpen: false, type: null, user: null });
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
        setReceivedRequests(receivedRequests.filter((r) => r !== userId));
        setFriends([...friends, userId]);
        setCounts(prev => ({ 
          ...prev, 
          friends: prev.friends + 1,
          total_requests: prev.total_requests - 1 
        }));
        setConfirmDialog({ isOpen: false, type: null, user: null });
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
        setReceivedRequests(receivedRequests.filter((r) => r !== userId));
        setUnblockedUsers([...unblockedUsers, userId]);
        setCounts(prev => ({ ...prev, total_requests: prev.total_requests - 1 }));
        setConfirmDialog({ isOpen: false, type: null, user: null });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friends;
    return friends.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friends, searchTerm]);

  const filteredSent = useMemo(() => {
    if (!searchTerm.trim()) return sentRequests;
    return sentRequests.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sentRequests, searchTerm]);

  const filteredReceived = useMemo(() => {
    if (!searchTerm.trim()) return receivedRequests;
    return receivedRequests.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [receivedRequests, searchTerm]);

  const filteredBlocked = useMemo(() => {
    if (!searchTerm.trim()) return blockedUsers;
    return blockedUsers.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blockedUsers, searchTerm]);

  const filteredUnblocked = useMemo(() => {
    if (!searchTerm.trim()) return unblockedUsers;
    return unblockedUsers.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [unblockedUsers, searchTerm]);

  const getAddFriendButtonState = (userId) => {
    if (friends.includes(userId)) return { disabled: true, text: "Friend" };
    if (sentRequests.includes(userId)) return { disabled: true, text: "Sent" };
    if (receivedRequests.includes(userId)) return { disabled: true, text: "Pending" };
    return { disabled: false, text: "Add Friend" };
  };

  const FriendCard = ({ userId }) => (
    <div className="flex justify-between items-center w-full border border-sidebar-border p-4 mb-3 rounded-lg hover:bg-sidebar-accent transition-colors bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {userId.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-sidebar-foreground">{userId}</span>
      </div>
      <button
        type="button"
        onClick={() => setConfirmDialog({ isOpen: true, type: "remove", user: userId })}
        className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
      >
        <UserMinus className="w-4 h-4 mr-2" />
        Remove
      </button>
    </div>
  );

  const RequestCard = ({ userId, isSent }) => (
    <div className="flex justify-between items-center w-full border border-sidebar-border p-4 mb-3 rounded-lg hover:bg-sidebar-accent transition-colors bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {userId.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-sidebar-foreground">{userId}</span>
        <span className="text-xs bg-sidebar-accent text-sidebar-accent-foreground px-3 py-1 rounded-full">
          {isSent ? "Sent" : "Received"}
        </span>
      </div>
      <div className="flex gap-2">
        {isSent ? (
          <button
            type="button"
            onClick={() => setConfirmDialog({ isOpen: true, type: "cancelRequest", user: userId })}
            className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
          >
            <UserX className="w-4 h-4 mr-2" />
            Cancel
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setConfirmDialog({ isOpen: true, type: "acceptRequest", user: userId })}
              className="bg-green-500 hover:bg-green-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => setConfirmDialog({ isOpen: true, type: "rejectRequest", user: userId })}
              className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
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
    <div className="flex justify-between items-center w-full border border-red-500/30 p-4 mb-3 rounded-lg hover:bg-red-500/10 transition-colors bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {userId.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-sidebar-foreground">{userId}</span>
        <span className="text-xs bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full">
          Blocked
        </span>
      </div>
      <button
        type="button"
        onClick={() => setConfirmDialog({ isOpen: true, type: "unblock", user: userId })}
        className="bg-green-500 hover:bg-green-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
      >
        <UserCheck className="w-4 h-4 mr-2" />
        Unblock
      </button>
    </div>
  );

  const AddFriendCard = ({ userId }) => {
    const state = getAddFriendButtonState(userId);
    return (
      <div className="flex justify-between items-center w-full border border-sidebar-border p-4 mb-3 rounded-lg hover:bg-sidebar-accent transition-colors bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userId.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-sidebar-foreground">{userId}</span>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDialog({ isOpen: true, type: "addFriend", user: userId })}
          disabled={state.disabled}
          className={`text-[14px] flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors ${
            state.disabled
              ? "bg-sidebar-accent text-sidebar-accent-foreground cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {!state.disabled && <UserPlus className="w-4 h-4 mr-2" />}
          {state.text}
        </button>
      </div>
    );
  };

  const ConfirmDialog = () => {
    if (!confirmDialog.isOpen) return null;

    const getDialogContent = () => {
      const dialogMap = {
        addFriend: {
          title: "Send Friend Request",
          message: `Send friend request to ${confirmDialog.user}?`,
          action: () => handleAddFriend(confirmDialog.user),
          buttonText: "Send",
          buttonClass: "bg-blue-500 hover:bg-blue-600",
        },
        remove: {
          title: "Remove Friend",
          message: `Remove ${confirmDialog.user} from your friends?`,
          action: () => handleRemoveFriend(confirmDialog.user),
          buttonText: "Remove",
          buttonClass: "bg-red-500 hover:bg-red-600",
        },
        cancelRequest: {
          title: "Cancel Request",
          message: `Cancel friend request to ${confirmDialog.user}?`,
          action: () => handleCancelRequest(confirmDialog.user),
          buttonText: "Cancel",
          buttonClass: "bg-red-500 hover:bg-red-600",
        },
        acceptRequest: {
          title: "Accept Request",
          message: `Accept friend request from ${confirmDialog.user}?`,
          action: () => handleAcceptRequest(confirmDialog.user),
          buttonText: "Accept",
          buttonClass: "bg-green-500 hover:bg-green-600",
        },
        rejectRequest: {
          title: "Reject Request",
          message: `Reject friend request from ${confirmDialog.user}?`,
          action: () => handleRejectRequest(confirmDialog.user),
          buttonText: "Reject",
          buttonClass: "bg-red-500 hover:bg-red-600",
        },
        unblock: {
          title: "Unblock User",
          message: `Unblock ${confirmDialog.user}?`,
          action: () => handleUnblock(confirmDialog.user),
          buttonText: "Unblock",
          buttonClass: "bg-green-500 hover:bg-green-600",
        },
      };
      return dialogMap[confirmDialog.type];
    };

    const content = getDialogContent();
    if (!content) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border border-sidebar-border rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
          <h2 className="text-xl font-bold mb-2 text-sidebar-foreground">{content.title}</h2>
          <p className="text-sidebar-foreground/70 mb-6">{content.message}</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmDialog({ isOpen: false, type: null, user: null })}
              className="bg-sidebar-accent hover:bg-sidebar-accent/80 text-[14px] text-sidebar-accent-foreground flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={content.action}
              className={`${content.buttonClass} text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors`}
            >
              {content.buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && activeTab === "friends" && !tabDataLoaded.friends) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1 className="text-sidebar-foreground">My Friends</h1>
      <div className="flex flex-wrap w-full px-32 shadow-2xl py-5 rounded-xl bg-card mt-3 border border-sidebar-border">
        <div className="flex w-full border-b border-sidebar-border mb-6">
          {[
            { id: "friends", label: "Friends", count: counts.friends },
            { id: "requests", label: "Requests", count: counts.total_requests },
            { id: "blocked", label: "Blocked", count: counts.blocked },
            { id: "discover", label: "Discover", count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm("");
              }}
              className={`px-6 py-3 font-semibold text-[16px] border-b-4 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-sidebar-foreground"
                  : "border-transparent text-sidebar-foreground/50 hover:text-sidebar-foreground"
              }`}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </div>

        {loading && !tabDataLoaded[activeTab] ? (
          <div className="flex items-center justify-center w-full py-12">
            <Spinner />
          </div>
        ) : (
          <>
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
                {filteredFriends.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <p className="text-sidebar-foreground/60 text-[16px]">
                      {friends.length === 0 ? "You don't have any friends yet" : "No friends match your search"}
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    {filteredFriends.map((friend) => (
                      <FriendCard key={friend} userId={friend} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div className="w-full">
                {receivedRequests.length > 0 && (
                  <div className="mb-6 w-full">
                    <h3 className="font-semibold text-sidebar-foreground mb-3 text-[18px]">Received Requests</h3>
                    <div className="w-full">
                      {filteredReceived.map((request) => (
                        <RequestCard key={request} userId={request} isSent={false} />
                      ))}
                    </div>
                  </div>
                )}
                {sentRequests.length > 0 && (
                  <div className="mb-6 w-full">
                    <h3 className="font-semibold text-sidebar-foreground mb-3 text-[18px]">Sent Requests</h3>
                    <div className="w-full">
                      {filteredSent.map((request) => (
                        <RequestCard key={request} userId={request} isSent={true} />
                      ))}
                    </div>
                  </div>
                )}
                {receivedRequests.length === 0 && sentRequests.length === 0 && (
                  <div className="text-center py-12 w-full">
                    <p className="text-sidebar-foreground/60 text-[16px]">No pending friend requests</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "blocked" && (
              <div className="w-full">
                {filteredBlocked.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <p className="text-sidebar-foreground/60 text-[16px]">
                      {blockedUsers.length === 0 ? "You haven't blocked anyone" : "No blocked users match your search"}
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    {filteredBlocked.map((user) => (
                      <BlockedCard key={user} userId={user} />
                    ))}
                  </div>
                )}
              </div>
            )}

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
                {filteredUnblocked.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <p className="text-sidebar-foreground/60 text-[16px]">
                      {unblockedUsers.length === 0 ? "No users available to add" : "No users match your search"}
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    {filteredUnblocked.map((user) => (
                      <AddFriendCard key={user} userId={user} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog />
    </div>
  );
}