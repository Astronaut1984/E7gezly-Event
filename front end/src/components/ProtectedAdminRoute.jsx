import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

/**
 * Wrapper component that checks if the user role allows them to access the children's URLs.
 * If not, redirects to home. If yes, renders the children.
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loadingUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingUser) {
      if (!user || user.status !== role) {
        navigate("/", { replace: true });
      }
    }
  }, [loadingUser, user, navigate]);

  // Show nothing while loading, or if user is not admin (they'll be redirected)
  if (loadingUser || !user || user.status !== role) {
    return null;
  }

  return children;
}
