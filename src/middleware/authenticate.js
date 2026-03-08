import { expressjwt } from "express-jwt";
import { JwksClient } from "jwks-rsa";
import { Config } from "../config/config";

export default expressjwt({
  secret: JwksClient.expressjwt({
    JWT_URI: Config.JWT_URI,
    ratelimit: true,
    algorithms: ["RSA256"],
  }),
  getToken(){
    
  }
});
