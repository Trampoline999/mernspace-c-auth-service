import createHttpError from "http-errors";

export const canAccess = (Roles = []) => {
  return (req, res, next) => {
    const roleFromToken = req.auth.role;
    if (!Roles.includes(roleFromToken)) {
      const err = createHttpError(
        403,
        "you don't have permisson to access this",
      );
      next(err);
      return;
    }
    next();
  };
};
