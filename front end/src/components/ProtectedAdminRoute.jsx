import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

/**
 * Wrapper component that checks if the user is an admin.
 * If not, redirects to home. If yes, renders the children.
 */
export default function ProtectedAdminRoute({ children }) {
  const { user, loadingUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingUser) {
      if (!user || user.status !== "Administrator") {
        navigate("/", { replace: true });
      }
    }
  }, [loadingUser, user, navigate]);

  // Show nothing while loading, or if user is not admin (they'll be redirected)
  if (loadingUser || !user || user.status !== "Administrator") {
    return null;
  }

  return children;
}
