import "./signup.css";
import Input from "../../components/Input";
import SelectType from "../../components/selectType";
export default function SignUp1({ formData, setFormData }) {
  const optionsAcc = ["Attendee", "Organizer"];

  return (
    <>
      <div className="flex gap-10 mt-4">
        <Input
          title="First Name"
          type="text"
          placeholder="Type your first name"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
        />
        <Input
          title="Last Name"
          type="text"
          placeholder="Type your last name"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
        />
      </div>
      <Input
        title="Email"
        type="text"
        placeholder="Type your Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <SelectType
        title="Account Type"
        options={optionsAcc}
        value={formData.accountType}
        onChange={(e) =>
          setFormData({ ...formData, accountType: e.target.value })
        }
      />
    </>
  );
}
export function SignUp2({ formData, setFormData }) {
  return (
    <>
      <Input
        title="Country"
        type="text"
        placeholder="Select your country"
        value={formData.country}
        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
      />
      <Input
        title="City"
        type="text"
        placeholder="Select your city"
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
      />
      <Input
        title="Phone Number"
        type="digit"
        placeholder="Enter your phone"
        value={formData.phoneNumber}
        onChange={(e) =>
          setFormData({ ...formData, phoneNumber: e.target.value })
        }
      />
    </>
  );
}
export function SignUp3({ formData, setFormData }) {
  return (
    <>
      <Input
        title="Username"
        type="text"
        placeholder="Type a username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <Input
        title="Password"
        type="password"
        placeholder="Type a password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <Input
        title="Reconfirm Password"
        type="password"
        placeholder="Re-type a password"
        value={formData.rePassword}
        onChange={(e) =>
          setFormData({ ...formData, rePassword: e.target.value })
        }
      />
    </>
  );
}
