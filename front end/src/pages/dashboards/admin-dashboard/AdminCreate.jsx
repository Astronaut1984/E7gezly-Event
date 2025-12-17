import { useState } from "react";
import Input from "@/components/Input";

export default function AdminCreate() {
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    country: "",
    city: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "phoneNumber") {
      newValue = value.replace(/\D/g, "");
    } else if (
      name === "firstName" ||
      name === "lastName" ||
      name === "country" ||
      name === "city"
    ) {
      newValue = value.replace(/[^a-zA-Z\s'-]/g, "");
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = {
        isError: true,
        message: "First name is required",
      };
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = {
        isError: true,
        message: "First name must be at least 2 characters",
      };
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) {
      newErrors.firstName = {
        isError: true,
        message:
          "Name can only contain letters, spaces, hyphens, and apostrophes.",
      };
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = {
        isError: true,
        message: "Last name is required",
      };
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = {
        isError: true,
        message: "Last name must be at least 2 characters",
      };
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) {
      newErrors.lastName = {
        isError: true,
        message:
          "Name can only contain letters, spaces, hyphens, and apostrophes.",
      };
    }

    if (!formData.username.trim()) {
      newErrors.username = {
        isError: true,
        message: "Username is required",
      };
    } else if (formData.username.length < 3) {
      newErrors.username = {
        isError: true,
        message: "Username must be at least 3 characters",
      };
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = {
        isError: true,
        message: "Username can only contain letters, numbers, and underscores",
      };
    }

    if (!formData.email.trim()) {
      newErrors.email = {
        isError: true,
        message: "Email is required",
      };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = {
        isError: true,
        message: "Please enter a valid email address",
      };
    }

    if (!formData.password) {
      newErrors.password = {
        isError: true,
        message: "Password is required",
      };
    } else if (formData.password.length < 8) {
      newErrors.password = {
        isError: true,
        message: "Password must be at least 8 characters",
      };
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = {
        isError: true,
        message: "phone number is required",
      };
    } else if (formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = {
        isError: true,
        message: "Phone number must be at least 10 digits",
      };
    } else if (formData.phoneNumber.length > 15) {
      newErrors.phoneNumber = {
        isError: true,
        message: "Phone number must be less than 15 digits",
      };
    }

    if (!formData.country.trim()) {
      newErrors.country = {
        isError: true,
        message: "Country is required",
      };
    }

    if (!formData.city.trim()) {
      newErrors.city = {
        isError: true,
        message: "City is required",
      };
    }

    return newErrors;
  };

  async function handleCreateAdmin(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors({
        ...validationErrors,
        submit: {
          isError: true,
          message: "Please fix the errors below.",
        },
      });
      setIsSubmitting(false);
      return;
    }

    const backendErrors = {};

    try {
      const response = await fetch(
        "http://localhost:8000/account/checkusername/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: formData.username }),
        }
      );

      const data = await response.json();
      if (data.usernameExists) {
        backendErrors.username = {
          isError: true,
          message: "This username is already registered",
        };
      }
    } catch (err) {
      console.error("Error checking username:", err);
      backendErrors.username = {
        isError: true,
        message: "Unable to verify username",
      };
    }
    if (Object.keys(backendErrors).length > 0) {
      setErrors(backendErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/account/checkemail/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      const data = await response.json();
      if (data.emailExists) {
        backendErrors.email = {
          isError: true,
          message: "This email is already registered",
        };
      }
    } catch (err) {
      console.error("Error checking email:", err);
      backendErrors.email = {
        isError: true,
        message: "Unable to verify email",
      };
    }

    if (Object.keys(backendErrors).length > 0) {
      setErrors(backendErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/adminUtils/createadmin/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error creating admin");
        setErrors({
          submit: {
            isError: true,
            message: data.error || "Failed to create admin. Please try again.",
          },
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Admin created successfully!");
      setSuccessMessage("Admin created successfully!");
      setFormData({
        username: "",
        email: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        country: "",
        city: "",
        password: "",
      });
    } catch (err) {
      console.error(err);
      setErrors({
        submit: {
          isError: true,
          message: "An error occurred. Please try again.",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col w-250 flex-wrap px-32 shadow-2xl py-5 rounded-xl bg-card mt-3">
        <h1 className="text-xl mb-4">Create New Admin</h1>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{errors.submit.message}</span>
            </div>
          </div>
        )}

        <div className="text-[20px] flex justify-between gap-20">
          <Input
            title="First Name"
            type="text"
            name="firstName"
            placeholder=""
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
          />
          <Input
            title="Last Name"
            type="text"
            name="lastName"
            placeholder=""
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
          />
        </div>
        <div className="text-[20px] flex justify-between gap-20">
          <Input
            title="Username"
            type="text"
            name="username"
            placeholder=""
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />
        </div>
        <div className="text-[20px] flex justify-between gap-20">
          <Input
            title="Email"
            type="email"
            name="email"
            placeholder=""
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            title="phoneNumber"
            type="text"
            name="phoneNumber"
            placeholder=""
            value={formData.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
          />
        </div>
        <div className="text-[20px] flex justify-between gap-20">
          <Input
            title="Country"
            type="text"
            name="country"
            placeholder=""
            value={formData.country}
            onChange={handleChange}
            error={errors.country}
          />
          <Input
            title="City"
            type="text"
            name="city"
            placeholder=""
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
          />
        </div>
        <div className="text-[20px] flex justify-between gap-20">
          <Input
            title="Password"
            type="password"
            name="password"
            placeholder=""
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
        </div>
        <div className="flex flex-wrap justify-center pt-7.5">
          <div className="w-50 block relative z-1 rounded-[25px] overflow-hidden">
            <button
              type="button"
              onClick={handleCreateAdmin}
              disabled={isSubmitting}
              className={`${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-hover cursor-pointer"
              } select-none text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 font-semibold transition-colors`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create Admin"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
