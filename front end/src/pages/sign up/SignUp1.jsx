import "../../index.css";
import Input from "../../components/Input";
import SelectOnly from "../../components/SelectOnly";

export default function SignUp1({ formData, setFormData, errors }) {
  const optionsAcc = ["Attendee", "Organizer"];

  return (
    <>
      <div className="flex gap-10 mt-4">
        <Input
          title="First Name"
          type="text"
          placeholder="John"
          error={errors.firstName}
          value={formData.firstName}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[0-9]/g, "");
            setFormData({ ...formData, firstName: e.target.value });
          }}
        />
        <Input
          title="Last Name"
          type="text"
          placeholder="Doe"
          value={formData.lastName}
          error={errors.lastName}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[0-9]/g, "");
            setFormData({ ...formData, lastName: e.target.value });
          }}
        />
      </div>
      <Input
        title="Email"
        type="email"
        placeholder="email@example.com"
        value={formData.email}
        error={errors.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <SelectOnly
        title="Account Type"
        options={optionsAcc}
        placeholder="Select account type"
        value={formData.accountType}
        error={!formData.accountType}
        onSelect={(option) => setFormData({ ...formData, accountType: option })}
      />
    </>
  );
}
export function SignUp2({ formData, setFormData, errors }) {
  return (
    <>
      <Input
        title="Country"
        type="text"
        placeholder="Select your country"
        value={formData.country}
        error={errors.country}
        onChange={(e) => {
          e.target.value = e.target.value.replace(/[0-9]/g, "");
          setFormData({ ...formData, country: e.target.value });
        }}
      />
      <Input
        title="City"
        type="text"
        placeholder="Select your city"
        value={formData.city}
        error={errors.city}
        onChange={(e) => {
          e.target.value = e.target.value.replace(/[0-9]/g, "");
          setFormData({ ...formData, city: e.target.value });
        }}
      />
      <Input
        title="Phone Number"
        type="text"
        pattern="\d{11}"
        placeholder="Enter your phone"
        value={formData.phoneNumber}
        error={errors.phoneNumber}
        onChange={(e) =>
          setFormData({ ...formData, phoneNumber: e.target.value })
        }
      />
    </>
  );
}
export function SignUp3({ formData, setFormData, errors }) {
  return (
    <>
      <Input
        title="Username"
        type="text"
        placeholder="Type a username"
        value={formData.username}
        error={errors.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <Input
        title="Password"
        type="password"
        placeholder="Type a password"
        value={formData.password}
        error={errors.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <Input
        title="Reconfirm Password"
        type="password"
        placeholder="Re-type a password"
        value={formData.rePassword}
        error={errors.rePassword}
        onChange={(e) =>
          setFormData({ ...formData, rePassword: e.target.value })
        }
      />
    </>
  );
}
