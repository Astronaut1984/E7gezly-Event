import { useEffect, useState } from "react";
import "./login.css";
import Input from "../../components/Input";
import NavBar from "../../components/NavBar";

export default function Login() {
  let bgColor = "bg-gradient-to-tr from-blue-200 via-blue-400 to-blue-600";
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8000/E7gezly/login/") // call Django view
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // see structure
        setUserCount(data.count); // extract the value
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <NavBar />
      <main
        className={`${bgColor} flex justify-center items-center w-full min-h-screen`}
      >
        <div className="w-[400px] bg-white rounded-[10px] p-[65px]">
          {/* Display backend data */}
          <div className="text-center mb-4 text-blue-500">
            Users in DB: {userCount}
          </div>

          <form className="w-full">
            <span className="block font-bold leading-[1.2] text-center mb-10 text-blue-500">
              E7gezly Event
            </span>
            <Input
              title="Username"
              type="text"
              placeholder="Type your username"
              name="username"
            />
            <Input
              title="Password"
              type="password"
              placeholder="Type your password"
              name="password"
            />

            {/* Forget password */}
            <div className="text-right hover:text-blue-600 transition-colors duration-300">
              <a href="#"> Forgot password? </a>
            </div>

            {/* Login Button */}
            <div className="flex flex-wrap justify-center pt-7.5">
              <div className="w-full block relative z-1 rounded-[25px] overflow-hidden">
                <button
                  className={
                    "bg-blue-400 transition-colors duration-300 text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold hover:bg-blue-600"
                  }
                >
                  Login
                </button>
              </div>
            </div>

            {/* Signup */}
            <div className="flex flex-col items-center pt-7.5 transition-colors duration-300 hover:text-blue-600">
              <a href="#"> Sign Up </a>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
