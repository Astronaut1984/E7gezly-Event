export function validateForm1(formData) {
  let errors = {};
  if (formData.firstName === "") {
    errors = {
      ...errors,
      firstName: {
        isError: true,
        message: "Enter your first name",
      },
    };
  } else {
    console.log(errors);
    delete errors.firstName;
  }
  if (formData.lastName === "") {
    errors = {
      ...errors,
      lastName: {
        isError: true,
        message: "Enter your last name",
      },
    };
  } else {
    delete errors.lastName;
  }
  if (formData.email === "") {
    errors = {
      ...errors,
      email: {
        isError: true,
        message: "Enter your email",
      },
    };
  } else {
    delete errors.email;
  }
  if (formData.accountType === "") {
    errors = {
      ...errors,
      accountType: {
        isError: true,
        message: "Choose account type",
      },
    };
  } else {
    delete errors.accountType;
  }
  return errors;
}

export function validateForm2(formData) {
  let errors = {};
  if (formData.country === "") {
    errors = {
      ...errors,
      country: {
        isError: true,
        message: "Enter your country",
      },
    };
  } else {
    delete errors.country;
  }
  if (formData.city === "") {
    errors = {
      ...errors,
      city: {
        isError: true,
        message: "Enter your city",
      },
    };
  } else {
    delete errors.city;
  }
  if (formData.phoneNumber === "") {
    errors = {
      ...errors,
      phoneNumber: {
        isError: true,
        message: "Enter your phone number",
      },
    };
  } else {
    delete errors.phoneNumber;
  }
  return errors;
}
export function validateForm3(formData) {
  let errors = {};
  if (formData.username === "") {
    errors = {
      ...errors,
      username: {
        isError: true,
        message: "Enter your username",
      },
    };
  } else {
    delete errors.username;
  }
  if (formData.password === "") {
    errors = {
      ...errors,
        password: {
        isError: true,
        message: "Enter your password",
        },
    };
    } else {
    delete errors.password;
    }
    if (formData.rePassword === "") {
    errors = {
        ...errors,
        rePassword: {
        isError: true,
        message: "Re-enter your password",
        },
    };
    } else if (formData.rePassword !== formData.password) {
    errors = {
        ...errors,
        rePassword: {
        isError: true,
        message: "Passwords do not match",
        },
    };
    } else {
    delete errors.rePassword;
    }
  return errors;
}
