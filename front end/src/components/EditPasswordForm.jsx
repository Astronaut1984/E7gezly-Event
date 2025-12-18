import { UserContext } from "@/UserContext";
import { useContext, useEffect, useState } from "react";
import Input from "./Input";

export default function EditPasswordForm() {
  const { user, setUser } = useContext(UserContext);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
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
    if (!formData.oldPassword) {
      newErrors.oldPassword = {
        isError: true,
        message: "Old password is required",
      };
    }
    if (!formData.password) {
      newErrors.password = { isError: true, message: "Password is required" };
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = {
        isError: true,
        message: "Confirm Password is required",
      };
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = {
        isError: true,
        message: "Passwords do not match",
      };
    }
    return newErrors;
  };

  async function handleUpdateInfo(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/account/updatepassword/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: formData.oldPassword,
          new_password: formData.password,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error updating password", errorData.error);
        setSuccessMessage(""); // Clear success message on error
        setErrors({
          submit: {
            isError: true,
            message:
              errorData.error || "Failed to update password. Please try again.",
          },
        });
        setIsSubmitting(false);
        return;
      }
      const data = await res.json();
      console.log(data);
      console.log("Password updated successfully!");
      setErrors({}); // Clear errors on success
      setSuccessMessage("Password updated successfully!");
      setFormData({ oldPassword: "", password: "", confirmPassword: "" }); // Clear fields on success
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
      <h1 className="text-xl mb-4">Change Password</h1>

      {/* Success Message */}
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

      {/* General Error Message */}
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
      <div className="text-[20px] flex flex-col justify-between gap-5">
        <Input
          title="Old Password"
          type="password"
          name="oldPassword"
          placeholder="Enter your old password"
          value={formData.oldPassword}
          onChange={handleChange}
          error={errors.oldPassword}
        />
        <Input
          title="New Password"
          type="password"
          name="password"
          placeholder="Enter new password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          title="Confirm New Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
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
              "Update Password"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
