import { expressJwtSecret } from "jwks-rsa";
import { Config } from "../config/config";
import { AppDataSource } from "../config/data-source.js";
import { RefreshToken } from "../entity/RefreshToken.js";
import logger from "../config/logger.js";

const validateRefresh = expressJwtSecret({
  secret: Config.PRIVATE_KEY_SECRET,
  algorithms: ["HS256"],
  getToken(req) {
    const { refreshToken } = req.cookies;
    return refreshToken;
  },
  async isRevoked(req, token) {
    try {
      const RefreshTokenrepository = AppDataSource.getRepository(RefreshToken);
      const refreshToken = await RefreshTokenrepository.findOne({
        where: {
          id: Number(token?.payload.id),
          user: Number({ id: token?.payload.sub }),
        },
      });
      return refreshToken === null;
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      logger.error("error while getting the refresh Token:", token.payload.id);
    }

    return true;
  },
});

export default validateRefresh;
