import { checkSchema } from "express-validator";

export default checkSchema({

  currentPage: {
    customSanitizer: {
      options: (value) => {

        const parsedValue = Number(value)
        return Number.isNaN(parsedValue) || parsedValue <= 0 ? 1 : parsedValue
      }
    }
  },
  perPage: {
    customSanitizer: {
      options: (value) => {
        const parsedValue = Number(value)
        return Number.isNaN(parsedValue) || parsedValue <= 0 ? 10 : parsedValue
      }
    }
  },
  search: {
    optional: true,
    trim: true,
    isString: true,
    customSanitizer: {
      options: (value) => (value ? String(value).trim() : ""),
    },
  },
  role: {
    optional: true,
    trim: true,
    isString: true,
    customSanitizer: {
      // Normalize empty string or "all" to null/undefined so the query ignores it
      options: (value) => (!value || value === "all" ? null : String(value).trim()),
    },
  },
}, ["query"])