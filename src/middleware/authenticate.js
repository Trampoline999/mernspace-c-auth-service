import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import { Config } from "../config/config.js";

//check if token is valid
export const authenticate = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: Config.JWKS_URI,
    cache: true,
    rateLimit: true,
    
  }),
  algorithms: ["RS256"],
  getToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.split(" ")[1] !== undefined) {
      const token = authHeader.split(" ")[1];

      if (token) {
        return token;
      }
    }
    const { accessToken } = req.cookies;
    return accessToken;
  },
});
