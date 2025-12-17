import { useState, useEffect, useContext, useMemo } from "react";
import { UserContext } from "@/UserContext";
import Input from "@/components/Input";
import { Spinner } from "@/components/ui/spinner";
import UserCard from "@/components/UserCard";

export default function AttendeeFollowedOrg() {
  const { user } = useContext(UserContext);
  const [following, setFollowing] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("following");
  const [searchTerm, setSearchTerm] = useState("");
  const [tabDataLoaded, setTabDataLoaded] = useState({
    following: false,
    discover: false,
  });
  const [counts, setCounts] = useState({
    following: 0,
  });

  const API_BASE_URL = "http://localhost:8000/attendeeUtils";

  useEffect(() => {
    fetchCounts();
    fetchFollowingData();
  }, []);

  useEffect(() => {
    if (!tabDataLoaded[activeTab]) {
      fetchTabData(activeTab);
    }
  }, [activeTab]);

  const fetchCounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getfollowcounts`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setCounts(data);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const fetchFollowingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/getfollowedorganizers`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setFollowing(data.followed || []);
      setTabDataLoaded(prev => ({ ...prev, following: true }));
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case "following":
          await fetchFollowingData();
          break;
        case "discover":
          await fetchDiscoverData();
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscoverData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getunblockedorganizers`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setOrganizers(data.organizers || []);
      setTabDataLoaded(prev => ({ ...prev, discover: true }));
    } catch (error) {
      console.error("Error fetching organizers:", error);
    }
  };

  const handleFollow = async (organizerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/followorganizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizer: organizerId }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setFollowing([...following, organizerId]);
        setOrganizers(organizers.filter(o => o !== organizerId));
        setCounts(prev => ({ following: prev.following + 1 }));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUnfollow = async (organizerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unfolloworganizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizer: organizerId }),
        credentials: "include",
      });
      const data = await response.json();
      if (!data.error) {
        setFollowing(following.filter(o => o !== organizerId));
        setOrganizers([...organizers, organizerId]);
        setCounts(prev => ({ following: prev.following - 1 }));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredFollowing = useMemo(() => {
    if (!searchTerm.trim()) return following;
    return following.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [following, searchTerm]);

  const filteredOrganizers = useMemo(() => {
    if (!searchTerm.trim()) return organizers;
    return organizers.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizers, searchTerm]);

  if (loading && activeTab === "following" && !tabDataLoaded.following) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1 className="text-sidebar-foreground">Followed Organizers</h1>
      <div className="flex flex-wrap w-full px-32 shadow-2xl py-5 rounded-xl bg-card mt-3 border border-sidebar-border">
        <div className="flex w-full border-b border-sidebar-border mb-6">
          {[
            { id: "following", label: "Following", count: counts.following },
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
            {activeTab === "following" && (
              <div className="w-full">
                <div className="mb-4 w-full">
                  <Input
                    title="Search Following"
                    type="text"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {filteredFollowing.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <p className="text-sidebar-foreground/60 text-[16px]">
                      {following.length === 0 ? "You're not following any organizers yet" : "No organizers match your search"}
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    {filteredFollowing.map((org) => (
                      <UserCard
                        key={org}
                        userId={org}
                        variant="following"
                        onUnfollow={handleUnfollow}
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
                    title="Search Organizers"
                    type="text"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {filteredOrganizers.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <p className="text-sidebar-foreground/60 text-[16px]">
                      {organizers.length === 0 ? "No organizers available" : "No organizers match your search"}
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    {filteredOrganizers.map((org) => (
                      <UserCard
                        key={org}
                        userId={org}
                        variant="organizer-view"
                        showButtons={true}
                        clickable={true}
                        onFollow={handleFollow}
                      />
                    ))}
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