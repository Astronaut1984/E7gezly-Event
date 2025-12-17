import { UserContext } from "@/UserContext";
import { useContext, useEffect, useState } from "react";
import Input from "./Input";
import InputEdit from "./InputEdit";
import PrivacySwitch from "./PrivacySwitch";

export default function EditInfoForm() {
  const { user, setUser } = useContext(UserContext);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    country: user?.country || "",
    city: user?.city || "",
    privacyChoice: user?.privacy_choice || "F",
  });

  // Store original values to detect changes
  const [originalData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "phone") {
      newValue = value.replace(/\D/g, "");
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    // Clear error and success message when user starts typing
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

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // First Name validation
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
        message: "First name can only contain letters",
      };
    }

    // Last Name validation
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
        message: "Last name can only contain letters",
      };
    }

    // Username validation
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
    } else if (formData.username.length > 20) {
      newErrors.username = {
        isError: true,
        message: "Username must be less than 20 characters",
      };
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = {
        isError: true,
        message: "Username can only contain letters, numbers, and underscores",
      };
    }

    // Email validation
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

    // Phone validation (optional field)
    if (formData.phone && formData.phone.length > 0) {
      if (formData.phone.length > 15) {
        newErrors.phone = {
          isError: true,
          message: "Phone number must be less than 15 digits",
        };
      }
    }

    // Country validation (optional field)
    if (formData.country && formData.country.trim().length > 0) {
      if (formData.country.length < 2) {
        newErrors.country = {
          isError: true,
          message: "Country name must be at least 2 characters",
        };
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.country)) {
        newErrors.country = {
          isError: true,
          message: "Country can only contain letters",
        };
      }
    }

    // City validation (optional field)
    if (formData.city && formData.city.trim().length > 0) {
      if (formData.city.length < 2) {
        newErrors.city = {
          isError: true,
          message: "City name must be at least 2 characters",
        };
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.city)) {
        newErrors.city = {
          isError: true,
          message: "City can only contain letters",
        };
      }
    }

    return newErrors;
  };

  async function handleUpdateInfo(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    // First, run basic validations
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Detect changes
    const usernameChanged = formData.username !== originalData.username;
    const emailChanged = formData.email !== originalData.email;

    const backendErrors = {};

    // Check username availability if changed
    if (usernameChanged) {
      try {
        const response = await fetch(
          "http://localhost:8000/account/checkusername/",
          {
            method: "PUT",
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
    }
    if (Object.keys(backendErrors).length > 0) {
      setErrors(backendErrors);
      setIsSubmitting(false);
      return;
    }
    // Check email availability if changed
    if (emailChanged) {
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
    }

    // If there are backend errors, show them and stop
    if (Object.keys(backendErrors).length > 0) {
      setErrors(backendErrors);
      setIsSubmitting(false);
      return;
    }

    // If all validations pass, submit the form
    try {
      const res = await fetch(
        "http://localhost:8000/account/editaccountinfo/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error updating information:", errorData);
        setErrors({
          submit: {
            isError: true,
            message: errorData.error || "Failed to update profile. Please try again.",
          },
        });
        setIsSubmitting(false);
        return;
      }
      
      // Update was successful
      const data = await res.json();
      console.log("Profile updated successfully!", data);
      setSuccessMessage("Profile updated successfully!");
      
      // FIXED: Use useEffect to update context after render completes
      // Update user context with the new data
      if (data.user) {
        // Use setTimeout to ensure state update happens after render
        setTimeout(() => {
          setUser(data.user);
        }, 0);
      }
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
    <div className="flex flex-col w-250 flex-wrap px-32 shadow-2xl py-5 rounded-xl bg-card mt-3 justify-center justifiy-between">
      <h1 className="text-xl mb-4">Change Account Info</h1>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-lg">
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

      {/* General Error Message */}
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
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
        <InputEdit
          title="Username"
          type="text"
          name="username"
          placeholder=""
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />
        <PrivacySwitch
          value={formData.privacyChoice}
          onChange={handleChange}
          error={errors.privacyChoice}
        />
      </div>
      <div className="text-[20px] flex justify-between gap-20">
        <InputEdit
          title="Email"
          type="email"
          name="email"
          placeholder=""
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          title="Phone"
          type="text"
          name="phone"
          placeholder=""
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
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
      <div className="flex flex-wrap justify-center pt-7.5">
        <div className="w-50 block relative z-1 rounded-[25px] overflow-hidden">
          <button
            type="button"
            onClick={handleUpdateInfo}
            disabled={isSubmitting}
            className={`${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-hover cursor-pointer"
            } select-none text-[16px] text-white flex justify-center items-center w-full h-[50px] border-0 font-semibold transition-colors`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                Updating...
              </div>
            ) : (
              "Update Info"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
