import "./signup.css";
import Input from "../../components/Input";
import SelectType from "../../components/selectType";

const optionsAcc = ["Attendee", "Organizer"];

export default function SignUp() {
  let bgColor = "bg-gradient-to-tr from-blue-200 via-blue-400 to-blue-600";

  return (
    <main
      className={`${bgColor} flex justify-center items-center w-full min-h-screen`}
    >
      <div className="w-[900px] bg-white rounded-[100px] p-[65px]">
        <form className="w-full">
          <span className="block font-bold text-[39px] text-[#333333] leading-[1.2] text-center mb-10 text-blue-500">
            E7gezly Event Create Account
          </span>
          <div className="flex gap-10">
            <Input
              title="First Name"
              type="text"
              placeholder="Type your first name"
              name="firstName"
              classNameVar="ml-[20px]"
            />
            <Input
              title="Last Name"
              type="text"
              placeholder="Type your last name"
              name="lastName"
            />
            <Input
              title="Phone Number"
              type="digit"
              placeholder="Enter your phone"
              name="phoneNumber"
              classNameVar="ml-[140px] mr-[20px]"
            />
          </div>
          <div className="flex gap-10">
            <Input
              title="Username"
              type="text"
              placeholder="Type a username"
              name="username"
              classNameVar="ml-[20px]"
            />
            <Input
              title="Email"
              type="text"
              placeholder="Type your Email"
              name="email"
            />
            <Input
              title="Password"
              type="password"
              placeholder="Type a password"
              name="password"
              classNameVar="ml-[140px] mr-[20px]"
            />
          </div>
          <div className="flex gap-10">
            <Input
              title="Country"
              type="text"
              placeholder="Select your country"
              name="country"
              classNameVar="ml-[20px]"
            />
            <Input
              title="City"
              type="text"
              placeholder="Select your city"
              name="city"
            />
            <SelectType
              title="Account Type"
              type="text"
              options={optionsAcc}
              name="accountType"
              classNameVar="ml-[140px] mr-[20px]"
            />
          </div>

          {/* Sign Up Button */}
          <div className="flex flex-wrap justify-center pt-7.5">
            <div className="w-full block relative z-1 rounded-[25px] overflow-hidden">
              <button
                className={
                  "bg-blue-400 transition-colors duration-300 text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 cursor-pointer font-semibold hover:bg-blue-600"
                }
              >
                Create Account
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
