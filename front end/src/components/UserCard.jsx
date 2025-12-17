import { useNavigate } from "react-router-dom";
import { UserMinus, UserCheck, UserX, UserPlus, Ban } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/UserContext";

export default function UserCard({ 
  userId, 
  variant = "view",
  onAddFriend,
  onRemoveFriend,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
  onBlock,
  onUnblock,
  onUnfollow,
  onFollow,
  onRemoveFollower,
  showButtons = true,
  clickable = true,
  customButton = null,
}) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    if (clickable) {
      let basePath = "/att";
      if (user?.status === "Administrator") basePath = "/admin";
      else if (user?.status === "Organizer") basePath = "/org";
      
      navigate(`${basePath}/user/${userId}`);
    }
  };

  const getGradient = () => {
    switch (variant) {
      case "friend":
        return "from-purple-400 to-blue-500";
      case "request-sent":
      case "request-received":
        return "from-yellow-400 to-orange-500";
      case "blocked":
        return "from-red-400 to-red-600";
      case "following":
        return "from-green-400 to-teal-500";
      case "organizer-view":
        return "from-indigo-400 to-purple-500";
      case "follower-removable":
        return "from-blue-400 to-cyan-500";
      default:
        return "from-blue-400 to-indigo-500";
    }
  };

  const renderButtons = () => {
    if (!showButtons) return null;
    if (customButton) return customButton;

    switch (variant) {
      case "view":
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAddFriend(userId)}
              className="bg-blue-500 hover:bg-blue-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Friend
            </button>
            <button
              type="button"
              onClick={() => onBlock(userId)}
              className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block
            </button>
          </div>
        );

      case "organizer-view":
        return (
          <button
            type="button"
            onClick={() => onFollow(userId)}
            className="bg-green-500 hover:bg-green-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Follow
          </button>
        );

      case "friend":
        return (
          <button
            type="button"
            onClick={() => onRemoveFriend(userId)}
            className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
          >
            <UserMinus className="w-4 h-4 mr-2" />
            Remove
          </button>
        );

      case "request-sent":
        return (
          <button
            type="button"
            onClick={() => onCancelRequest(userId)}
            className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
          >
            <UserX className="w-4 h-4 mr-2" />
            Cancel
          </button>
        );

      case "request-received":
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAcceptRequest(userId)}
              className="bg-green-500 hover:bg-green-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => onRejectRequest(userId)}
              className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
            >
              <UserX className="w-4 h-4 mr-2" />
              Reject
            </button>
          </div>
        );

      case "blocked":
        return (
          <button
            type="button"
            onClick={() => onUnblock(userId)}
            className="bg-green-500 hover:bg-green-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Unblock
          </button>
        );

      case "following":
        return (
          <button
            type="button"
            onClick={() => onUnfollow(userId)}
            className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
          >
            <UserX className="w-4 h-4 mr-2" />
            Unfollow
          </button>
        );

      case "follower-removable":
        return (
          <button
            type="button"
            onClick={() => onRemoveFollower(userId)}
            className="bg-red-500 hover:bg-red-600 text-[14px] text-white flex justify-center items-center px-4 h-10 border-0 cursor-pointer font-semibold rounded-lg transition-colors"
          >
            <UserMinus className="w-4 h-4 mr-2" />
            Remove
          </button>
        );

      default:
        return null;
    }
  };

  const getBadge = () => {
    switch (variant) {
      case "request-sent":
        return (
          <span className="text-xs bg-sidebar-accent text-sidebar-accent-foreground px-3 py-1 rounded-full">
            Sent
          </span>
        );
      case "request-received":
        return (
          <span className="text-xs bg-sidebar-accent text-sidebar-accent-foreground px-3 py-1 rounded-full">
            Received
          </span>
        );
      case "blocked":
        return (
          <span className="text-xs bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full">
            Blocked
          </span>
        );
      case "following":
        return (
          <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
            Following
          </span>
        );
      case "organizer-view":
        return (
          <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full">
            Organizer
          </span>
        );
      case "follower-removable":
        return (
          <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
            Follower
          </span>
        );
      default:
        return null;
    }
  };

  const borderClass = variant === "blocked" ? "border-red-500/30" : "border-sidebar-border";
  const hoverClass = variant === "blocked" ? "hover:bg-red-500/10" : "hover:bg-sidebar-accent";
  const cursorClass = clickable ? "cursor-pointer" : "";

  return (
    <div 
      onClick={handleCardClick}
      className={`flex justify-between items-center w-full border ${borderClass} p-4 mb-3 rounded-lg ${hoverClass} transition-colors bg-card ${cursorClass}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${getGradient()} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
          {userId.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-sidebar-foreground">{userId}</span>
        {getBadge()}
      </div>
      {renderButtons()}
    </div>
  );
}