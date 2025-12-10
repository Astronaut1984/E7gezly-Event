import "../../index.css";
import SignUp1, { SignUp2, SignUp3 } from "./SignUp1";
import { validateForm1, validateForm2, validateForm3 } from "./validations";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function SignUp() {
  const bgColor = "bg-gradient-to-tr from-blue-200 via-blue-400 to-blue-600";
  const [pageNumber, setPageNumber] = useState(1);
  const [errors, setErrors] = useState({});
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
  async function handleSubmit() {
    // You can do validation here
    console.log("Final form data:", formData);

    let formErrors = await validateForm3(formData);
    if (Object.keys(formErrors).length !== 0) {
      setErrors(formErrors);
      if (formErrors.username) {
        setFormData((prevData) => ({
          ...prevData,
          username: "", // <--- This deletes the text you wrote
        }));
      }
      return;
    }

    // Send to backend
    fetch("http://localhost:8000/account/signup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
    //change the path to login page
    window.location.href = "/login";
  }
  async function nextPageHandeler() {
    if (pageNumber === 1) {
      let formErrors = await validateForm1(formData);
      console.log(formErrors);
      console.log(formData);
      if (Object.keys(formErrors).length === 0) {
        setPageNumber((currPageNumber) => currPageNumber + 1);
      } else {
        setErrors(formErrors);
        if (formErrors.email) {
          setFormData((prevData) => ({
            ...prevData,
            email: "", // <--- This deletes the text you wrote
          }));
        }
        return;
      }
    } else if (pageNumber === 2) {
      let formErrors = validateForm2(formData);
      if (Object.keys(formErrors).length === 0) {
        setPageNumber((currPageNumber) => currPageNumber + 1);
      } else {
        setErrors(formErrors);
        return;
      }
    }
  }

  function previousPageHandler() {
    setPageNumber((currPageNumber) => currPageNumber - 1);
  }
  return (
    <>
      <main
        className={`bg-background flex justify-center items-center w-full min-h-screen relative pt-16`}
      >
        <div className="w-[500px] bg-card rounded-[10px] p-[65px] h-160 relative">
          <form className="w-full">
            <span className="block font-bold text-[39px] leading-[1.2] text-center mb-4 text-primary">
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
              <SignUp1
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {pageNumber === 2 && (
              <SignUp2
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            )}
            {pageNumber === 3 && (
              <SignUp3
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
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
            <div className="flex justify-center gap-1 items-center pt-7.5 transition-colors duration-300 text-foreground">
              Already have an account?{" "}
              <NavLink to="/login" className="text-primary-hover">
                {" "}
                Login{" "}
              </NavLink>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
