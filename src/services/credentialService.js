import bcrypt from "bcryptjs";
export class CredentialService {
  async comparePassword(userPassword, hashedPassword) {
    return await bcrypt.compare(userPassword, hashedPassword);
  }
}
