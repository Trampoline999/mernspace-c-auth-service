import { checkSchema } from "express-validator";

export default checkSchema({
  firstName: {
    in: ["body"],
    trim: true,
    notEmpty: {
      errorMessage: "First name is required",
    },
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: "First name must be between 2 and 30 characters",
    },
  },
  lastName: {
    in: ["body"],
    trim: true,
    notEmpty: {
      errorMessage: "Last name is required",
    },
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: "Last name must be between 2 and 30 characters",
    },
  },
  email: {
    in: ["body"],
    normalizeEmail: true,
    notEmpty: {
      errorMessage: "Email is required",
    },
    isEmail: {
      errorMessage: "Invalid email address",
    },
  },
  password: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Password is required",
    },
    isLength: {
      options: { min: 8 },
      errorMessage: "Password should be at least 8 chars",
    },
  },
});
