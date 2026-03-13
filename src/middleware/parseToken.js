import { expressjwt } from "express-jwt";
import { Config } from "../config/config.js";

const parsedToken = expressjwt({
  secret: Config.PRIVATE_KEY_SECRET,
  algorithms: ["HS256"],
  getToken(req) {
    const { refreshToken } = req.cookies;
    return refreshToken;
  },
});

export default parsedToken;
