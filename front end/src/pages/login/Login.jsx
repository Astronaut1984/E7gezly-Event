import { useEffect, useState, useContext } from "react";
import "../../index.css";
import Input from "../../components/Input";
import NavBar from "../../components/NavBar";
import { UserContext } from "../../UserContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  let bgColor = "bg-background";
  const [userCount, setUserCount] = useState(0);
  const { user, setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/account/login/") // call Django view
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // see structure
        setUserCount(data.count); // extract the value
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    console.log(user);
  }, [user]);

  // 2. Create a dedicated function for the button click
  async function handleLogin(e) {
    e.preventDefault(); // Good practice to prevent reloads
    setError("");

    try {
      // Send credentials to backend
      const response = await fetch("http://localhost:8000/account/authuser/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include", // Include cookies
      });

      const data = await response.json();

      if (data.success) {
        console.log(data);
        setUser(data.user);
        // Redirect user here if needed
        if (data.user.status == "Attendee") {
          navigate("/");
        } else if (data.user.status == "Organizer") {
          navigate("/org");
        } else {
          navigate("/admin");
        }
      } else {
        // Show error from backend (e.g., "User not found")
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed");
    }
  }

  return (
    <>
      <NavBar />
      <main
        className={`${bgColor} flex justify-center items-center w-full min-h-screen pt-16`}
      >
        <div className="w-[400px] bg-card rounded-[10px] p-[65px] shadow">
          {/* Display backend data */}
          <div className="text-center mb-4 text-primary">
            Users in DB: {userCount}
          </div>

          <form className="w-full">
            <span className="block font-bold leading-[1.2] text-3xl text-center mb-10 text-primary">
              E7gezly Event
            </span>

            {/* --- 1. DISPLAY ERROR MESSAGE HERE --- */}
            {error && (
              <span className="block text-sm text-[15px] text-red-500 text-center mb-8">
                {error}
              </span>
            )}

            <Input
              title="Username"
              type="text"
              placeholder="Type your username"
              name="username"
              // --- 2. CONNECT INPUT TO STATE ---
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <Input
              title="Password"
              type="password"
              placeholder="Type your password"
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            {/* Forget password */}
            <div className="text-right">
              <a href="#" className="text-primary-hover">
                {" "}
                Forgot password?{" "}
              </a>
            </div>

            {/* Login Button */}
            <div className="flex flex-wrap justify-center pt-7.5">
              <div className="w-full block relative z-1 rounded-[25px] overflow-hidden">
                <button
                  type="button"
                  onClick={handleLogin}
                  className={
                    "bg-primary-hover text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold "
                  }
                >
                  Login
                </button>
              </div>
            </div>

            {/* Signup */}
            <div className="flex flex-col items-center pt-7.5 ">
              <a href="#" className="text-primary-hover">
                {" "}
                Sign Up{" "}
              </a>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
