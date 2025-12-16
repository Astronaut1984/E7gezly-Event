import { useState, useEffect, useContext, useMemo } from "react";
import { UserContext } from "@/UserContext";
import Input from "@/components/Input";
import { Spinner } from "@/components/ui/spinner";
import UserCard from "@/components/UserCard";

export default function OrganizerFollowers() {
  const { user } = useContext(UserContext);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [counts, setCounts] = useState({
    followers: 0,
  });

  const API_BASE_URL = "http://localhost:8000/attendeeUtils";

  useEffect(() => {
    fetchCounts();
    fetchFollowersData();
  }, []);

  const fetchCounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getfollowercounts`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setCounts(data);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const fetchFollowersData = async () => {
    setLoading(true);
    try {
      const username = user?.username;
      const response = await fetch(`${API_BASE_URL}/getfollowers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });
      const data = await response.json();
      setFollowers(data.followed || []);
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoading(false);
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
        setFollowers(followers.filter(a => a !== attendeeId));
        setCounts(prev => ({ followers: prev.followers - 1 }));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredFollowers = useMemo(() => {
    if (!searchTerm.trim()) return followers;
    return followers.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [followers, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full px-32 text-[30px] font-bold">
      <h1 className="text-sidebar-foreground">My Followers</h1>
      <div className="flex flex-wrap w-full px-32 shadow-2xl py-5 rounded-xl bg-card mt-3 border border-sidebar-border">
        <div className="flex w-full border-b border-sidebar-border mb-6">
          <div className="px-6 py-3 font-semibold text-[16px] border-b-4 border-blue-500 text-sidebar-foreground">
            Followers ({counts.followers})
          </div>
        </div>

        <div className="w-full">
          <div className="mb-4 w-full">
            <Input
              title="Search Followers"
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredFollowers.length === 0 ? (
            <div className="text-center py-12 w-full">
              <p className="text-sidebar-foreground/60 text-[16px]">
                {followers.length === 0 ? "You don't have any followers yet" : "No followers match your search"}
              </p>
            </div>
          ) : (
            <div className="w-full">
              {filteredFollowers.map((follower) => (
                <UserCard
                  key={follower}
                  userId={follower}
                  variant="follower-removable"
                  showButtons={true}
                  clickable={true}
                  onRemoveFollower={handleRemoveFollower}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}