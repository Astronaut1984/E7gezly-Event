// Step 1: Async because it calls backend
export async function validateForm1(formData) {
  const errors = {};

  // First Name
  if (!formData.firstName) {
    errors.firstName = { isError: true, message: "Enter your first name" };
  } else {
    delete errors.firstName;
  }

  // Last Name
  if (!formData.lastName) {
    errors.lastName = { isError: true, message: "Enter your last name" };
  } else {
    delete errors.lastName;
  }

  // Email
  if (!formData.email) {
    errors.email = { isError: true, message: "Enter your email" };
  } else {
    const input = document.querySelector('input[type="email"]');
    if (input && !input.validity.valid) {
      errors.email = { isError: true, message: "Invalid email format" };
    } else {
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
          errors.email = {
            isError: true,
            message: "This email is already registered",
          };
        } else {
          delete errors.email;
        }
      } catch (err) {
        console.error("Error checking email:", err);
        errors.email = {
          isError: true,
          message: "Unable to verify email",
        };
      }
    }
  }

  // Account Type
  if (!formData.accountType) {
    errors.accountType = { isError: true, message: "Choose account type" };
  } else {
    delete errors.accountType;
  }

  return errors;
}

// Step 2: Sync validations for form 2
export function validateForm2(formData) {
  const errors = {};

  if (!formData.country) {
    errors.country = { isError: true, message: "Enter your country" };
  } else {
    delete errors.country;
  }

  if (!formData.city) {
    errors.city = { isError: true, message: "Enter your city" };
  } else {
    delete errors.city;
  }

  if (!formData.phoneNumber) {
    errors.phoneNumber = { isError: true, message: "Enter your phone number" };
  } else {
    delete errors.phoneNumber;
  }

  return errors;
}

// Step 3: Sync validations for form 3
export async function validateForm3(formData) {
  const errors = {};

  if (!formData.username) {
    errors.username = { isError: true, message: "Enter your username" };
  } else {
    delete errors.username;
  }

  if (!formData.password) {
    errors.password = { isError: true, message: "Enter your password" };
  } else {
    delete errors.password;
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
        errors.username = {
          isError: true,
          message: "This username is already registered",
        };
      } else {
        delete errors.username;
      }
    } catch (err) {
      console.error("Error checking username:", err);
      errors.username = {
        isError: true,
        message: "Unable to verify username",
      };
    }
  }

  if (!formData.rePassword) {
    errors.rePassword = { isError: true, message: "Re-enter your password" };
  } else if (formData.rePassword !== formData.password) {
    errors.rePassword = { isError: true, message: "Passwords do not match" };
  } else {
    delete errors.rePassword;
  }

  return errors;
}
