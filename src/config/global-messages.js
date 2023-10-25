export default {
  uncaughtException: {
    resultMessage: "Uncaught Exception Error.",
    resultCode: "00001",
  },
  unhandledRejection: {
    resultMessage: "Unhandled Rejection Error.",
    resultCode: "00002",
  },
  serverStatus: {
    resultMessage: "Project is successfully working.",
    resultCode: "00003",
  },
  serverError: {
    resultMessage: "internal server error.",
    resultCode: "00004",
  },
  clientError: {
    resultMessage: "client side error.",
    resultCode: "00005",
  },
  invalidRequest: {
    resultMessage: "Invalid request.",
    resultCode: "00006",
  },
  validationError: {
    resultMessage: "Validation error.",
    resultCode: "00007",
  },
  rateLimitError: {
    resultMessage: "Too many request.",
    resultCode: "00008",
  },
  accessDenied: {
    resultMessage: "Access denied. You do not have permission to access.",
    resultCode: "00009",
  },
  jwtRequired: {
    resultMessage:
      "JWT Required, Please provide jwt token to access resources.",
    resultCode: "00010",
  },
  jwtExpired: {
    resultMessage: "JWT Expired, your jwt is expired.",
    resultCode: "00011",
  },
  invalidJWT: {
    resultMessage: "Invalid JWT, provide valid jwt.",
    resultCode: "00012",
  },
  emailNotFound: {
    resultMessage: "Account with this email address was not found.",
    resultCode: "00013",
  },
  duplicateEmail: {
    resultMessage: "An account with this email already exist.",
    resultCode: "00014",
  },
  accountNotActivated: {
    resultMessage: "Your Account is not activated.",
    resultCode: "00015",
  },
  accountNotVerified: {
    resultMessage: "Your Account is not verified.",
    resultCode: "00016",
  },
  invalidCredentials: {
    resultMessage: "You have entered an invalid email or password.",
    resultCode: "00017",
  },
  passwordMustDifferent: {
    resultMessage:
      "Your new password should not be same with the old one, please try a different password.",
    resultCode: "00018",
  },
  passwordMustMatch: {
    resultMessage:
      "Your old password does not match with the password you entered, please enter the correct password.",
    resultCode: "00019",
  },
  dataNotFound: {
    resultMessage: "No Data found against this request.",
    resultCode: "00020",
  },
  invalidCode: {
    resultMessage: "invalid Code, Please provide valid code.",
    resultCode: "00021",
  },
  invalidData: {
    resultMessage: "invalid Data, data your are accessing is invalid.",
    resultCode: "00022",
  },
  sessionExpired: {
    resultMessage: "Your session is expired, please log in again.",
    resultCode: "00023",
  },
  duplicateData: {
    resultMessage: "Data already already exist.",
    resultCode: "00024",
  },

  //major used.
  createSuccess: {
    resultMessage: "Created Successfully.",
    resultCode: "00100",
  },
  readSuccess: {
    resultMessage: "Fetched Successfully.",
    resultCode: "00101",
  },
  updateSuccess: {
    resultMessage: "Updated Successfully.",
    resultCode: "00102",
  },
  deletedSuccess: {
    resultMessage: "Deleted Successfully.",
    resultCode: "00103",
  },
};
