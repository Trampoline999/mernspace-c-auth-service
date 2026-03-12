import { expressJwtSecret } from "jwks-rsa";
import { Config } from "../config/config";

const validateRefresh = expressJwtSecret({
  secret: Config.PRIVATE_KEY_SECRET,
  algorithms: ["HS256"],
  getToken(req) {
    const { refreshToken } = req.cookies;
    return refreshToken;
  },
});

export default validateRefresh;
