import { useState, useEffect, useContext, useMemo } from "react";
import { UserContext } from "@/UserContext";
import Input from "@/components/Input";
import { Spinner } from "@/components/ui/spinner";
import UserCard from "@/components/UserCard";

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

  const API_BASE_URL = "http://localhost:8000/attendeeUtils";

  useEffect(() => {
    fetchCounts();
    fetchFriendsData();
  }, []);

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
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // FIXED: Added handleBlock function
  const handleBlock = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/blockunblockuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendee: userId, action: true }), // action: true = block
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setUnblockedUsers(unblockedUsers.filter((u) => u !== userId));
        setBlockedUsers([...blockedUsers, userId]);
        // Remove from friends if they were friends
        setFriends(friends.filter((f) => f !== userId));
        // Remove from sent/received requests
        setSentRequests(sentRequests.filter((r) => r !== userId));
        setReceivedRequests(receivedRequests.filter((r) => r !== userId));
        setCounts(prev => ({ ...prev, blocked: prev.blocked + 1 }));
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
                      <UserCard
                        key={friend}
                        userId={friend}
                        variant="friend"
                        onRemoveFriend={handleRemoveFriend}
                      />
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
                        <UserCard
                          key={request}
                          userId={request}
                          variant="request-received"
                          onAcceptRequest={handleAcceptRequest}
                          onRejectRequest={handleRejectRequest}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {sentRequests.length > 0 && (
                  <div className="mb-6 w-full">
                    <h3 className="font-semibold text-sidebar-foreground mb-3 text-[18px]">Sent Requests</h3>
                    <div className="w-full">
                      {filteredSent.map((request) => (
                        <UserCard
                          key={request}
                          userId={request}
                          variant="request-sent"
                          onCancelRequest={handleCancelRequest}
                        />
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
                      <UserCard
                        key={user}
                        userId={user}
                        variant="blocked"
                        onUnblock={handleUnblock}
                      />
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
                    {filteredUnblocked.map((user) => {
                      const state = getAddFriendButtonState(user);
                      return (
                        <UserCard
                          key={user}
                          userId={user}
                          variant="view"
                          showButtons={true}
                          clickable={true}
                          onAddFriend={handleAddFriend}
                          onBlock={handleBlock}  // FIXED: Now using the actual handleBlock function
                          customButton={
                            state.disabled ? (
                              <button
                                type="button"
                                disabled
                                className="bg-sidebar-accent text-sidebar-accent-foreground cursor-not-allowed text-[14px] flex justify-center items-center px-4 h-10 border-0 font-semibold rounded-lg"
                              >
                                {state.text}
                              </button>
                            ) : null
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}