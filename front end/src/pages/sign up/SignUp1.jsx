import "./signup.css";
import Input from "../../components/Input";
import SelectType from "../../components/selectType";

export default function SignUp1() {
  const optionsAcc = ["Attendee", "Organizer"];
  return (
    <>
      <div className="flex gap-10 mt-4">
        <Input
          title="First Name"
          type="text"
          placeholder="Type your first name"
          name="firstName"
        />
        <Input
          title="Last Name"
          type="text"
          placeholder="Type your last name"
          name="lastName"
        />
      </div>
      <Input
        title="Email"
        type="text"
        placeholder="Type your Email"
        name="email"
      />
      <SelectType
        title="Account Type"
        type="text"
        options={optionsAcc}
        name="accountType"
      />
    </>
  );
}

export function SignUp2() {
  return (
    <>
      <Input
        title="Country"
        type="text"
        placeholder="Select your country"
        name="country"
      />
      <Input
        title="City"
        type="text"
        placeholder="Select your city"
        name="city"
      />
      <Input
        title="Phone Number"
        type="digit"
        placeholder="Enter your phone"
        name="phoneNumber"
      />
    </>
  );
}

export function SignUp3() {
  return (
    <>
      <Input
        title="Username"
        type="text"
        placeholder="Type a username"
        name="username"
      />
      <Input
        title="Password"
        type="password"
        placeholder="Type a password"
        name="password"
      />
      <Input
        title="Reconfirm Password"
        type="password"
        placeholder="Re-type a password"
        name="rePassword"
      />
    </>
  );
}
