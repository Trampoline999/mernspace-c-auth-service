import createHttpError from "http-errors";

//check for admin role 
export const canAccess = (allowedRoles = []) => {
  return (req, res, next) => {
    // Extract the user's role from the authenticated token
    const userRole = req.auth?.role;

    // Check if user's role is authorized to access this route
    if (!allowedRoles.includes(userRole)) {
      // User doesn't have required role - deny access
      const error = createHttpError(
        403,
        "Access denied. You do not have permission to access this resource."
      );
      return next(error);
    }

    // User has required role - proceed to next middleware
    next();
  };
};
