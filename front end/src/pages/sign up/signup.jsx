import "./signup.css";
import Input from "../../components/Input";
import SelectType from "../../components/selectType";
import { useState } from "react";
import SignUp1, { SignUp2, SignUp3 } from "./SignUp1";

const optionsAcc = ["Attendee", "Organizer"];

export default function SignUp() {
  const bgColor = "bg-gradient-to-tr from-blue-200 via-blue-400 to-blue-600";
  const [pageNumber, setPageNumber] = useState(1);

  function nextPageHandeler() {
    setPageNumber((currPageNumber) => currPageNumber + 1);
  }
  return (
    <main
      className={`${bgColor} flex justify-center items-center w-full min-h-screen`}
    >
      <div className="w-[500px] bg-white rounded-[10px] p-[65px]">
        <form className="w-full">
          <span className="block font-bold text-[39px] text-[#333333] leading-[1.2] text-center mb-10 text-blue-500">
            E7gezly Event Create Account
          </span>
          {pageNumber === 1 && <SignUp1 />}
          {pageNumber === 2 && <SignUp2 />}
          {pageNumber === 3 && <SignUp3 />}
          <div className="flex flex-wrap justify-center pt-7.5">
            <div className="w-full block relative z-1 rounded-[25px] overflow-hidden">
              <button
                type="button"
                onClick={nextPageHandeler}
                className={
                  "bg-blue-400 transition-colors duration-300 text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold hover:bg-blue-600"
                }
              >
                Next
              </button>
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
  );
}
