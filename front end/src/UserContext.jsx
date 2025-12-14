import { createContext, useEffect, useState } from "react";

// This is the global place to store user info
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // starts empty

  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:8000/account/me/", {
          credentials: "include",
        });

        const data = await res.json();

        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to load user", err);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};
