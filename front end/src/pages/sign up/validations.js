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
