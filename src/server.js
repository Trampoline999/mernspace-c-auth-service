import { Config } from "./config/config.js";
import process from "process";
import logger from "./config/logger.js";
import app from "./app.js";
import { AppDataSource } from "./config/data-source.js";
import { User } from "./entity/User.js";
import { Roles } from "./constants/index.js";
import bcrypt from "bcryptjs";


const StartServer = async (req,res) => {
  try {
    await AppDataSource.initialize();
    logger.info("Database connected successfully...");

    // Ensure default admin user exists (idempotent & multi-instance safe)
    await DefaultAdmin(req,res);

    const port = Config.PORT || 1337;
    app.listen(port, () => {
      logger.info(`server is listening on port : ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const DefaultAdmin = async (req,res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: {
        email: Config.ADMIN_EMAIL,
      },
    });

    if (existingAdmin) {
      logger.info("Admin user already exists", {
        userId: existingAdmin.id,
        email: existingAdmin.email,
      });
      return;
    }
    const newAdminUser = {
      firstName: Config.ADMIN_FIRST_NAME,
      lastName: Config.ADMIN_LAST_NAME,
      email: Config.ADMIN_EMAIL,
      password: Config.ADMIN_PASSWORD,
      role: Roles.ADMIN,
      tenant: undefined,
    }

   
    
    // Hash the password securely (10 salt rounds)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newAdminUser.password, saltRounds);

    // Create admin user
    const adminUser = await userRepository.save({...newAdminUser, password: hashedPassword});

    logger.info("Admin user created successfully", {
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    /* const payload = {
      sub: String(adminUser.id),
      role: adminUser.role,
    }
    const tokenService = new TokenService();
    const persistedRefreshToken = await tokenService.persistRefreshToken(adminUser);
    const accessToken =  tokenService.generateAccessToken(payload);
    const refreshToken = tokenService.generateRefreshToken({...payload,id:String(persistedRefreshToken.id)});

    res.cookie("accessToken", accessToken, {
        domain: "localhost",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        httpOnly: true, // important
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7, // set ttl to 7 days
      });
 */
      logger.info("Admin user logged in successfully", {userId: adminUser.id});

  } catch (error) {
    // If error is duplicate key (admin created by another instance), that's OK
    if (error.code === "23505") {
      // PostgreSQL unique violation - admin was created by another instance
      logger.info("Admin user already exists (created by another instance)");
      return;
    }

    // Log error but don't crash - server can still start
    logger.error("Failed to create admin user", {
      error: error.message,
    });
  }
};

StartServer();
