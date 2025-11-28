import "./signup.css";
import Input from "../../components/Input";
import SelectType from "../../components/selectType";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import SignUp1, { SignUp2, SignUp3 } from "./SignUp1";

export default function SignUp() {
  const bgColor = "bg-gradient-to-tr from-blue-200 via-blue-400 to-blue-600";
  const [pageNumber, setPageNumber] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    accountType: "",
    country: "",
    city: "",
    phoneNumber: "",
    username: "",
    password: "",
    rePassword: "",
  });
  function handleSubmit() {
    // You can do validation here
    console.log("Final form data:", formData);

    // Send to backend
    fetch("http://localhost:8000/E7gezly/signup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  }
  function nextPageHandeler() {
    setPageNumber((currPageNumber) => currPageNumber + 1);
  }

  function previousPageHandler() {
    setPageNumber((currPageNumber) => currPageNumber - 1);
  }
  return (
    <>
      <Navbar />
      <main
        className={`${bgColor} flex justify-center items-center w-full min-h-screen relative`}
      >
        <div className="w-[500px] bg-white rounded-[10px] p-[65px] h-160 relative">
          <form className="w-full">
            <span className="block font-bold text-[39px] text-[#333333] leading-[1.2] text-center mb-4 text-blue-500">
              E7gezly Event Create Account
            </span>
            {pageNumber > 1 && (
              <i
                onClick={previousPageHandler}
                className="z-2 cursor-pointer fa-solid fa-arrow-left-long absolute -translate-y-37 -translate-x-7 text-2xl"
              ></i>
            )}

            {/* Pass formData and setFormData to children */}
            {pageNumber === 1 && (
              <SignUp1 formData={formData} setFormData={setFormData} />
            )}
            {pageNumber === 2 && (
              <SignUp2 formData={formData} setFormData={setFormData} />
            )}
            {pageNumber === 3 && (
              <SignUp3 formData={formData} setFormData={setFormData} />
            )}
            <div className="flex flex-wrap justify-center pt-7.5">
              <div className="w-full block relative z-1 rounded-[25px] overflow-hidden">
                {pageNumber === 3 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={
                      "bg-blue-400 transition-colors duration-300 text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold hover:bg-blue-600"
                    }
                  >
                    Create Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextPageHandeler}
                    className={
                      "bg-blue-400 transition-colors duration-300 text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold hover:bg-blue-600"
                    }
                  >
                    Next
                  </button>
                )}
              </div>
            </div>

            {/* Sign Up */}
            <div className="flex justify-center gap-1 items-center pt-7.5 transition-colors duration-300">
              I have an account{" "}
              <a href="#" className="hover:text-blue-600">
                {" "}
                Login ?{" "}
              </a>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
