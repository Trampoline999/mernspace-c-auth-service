import bcrypt from "bcrypt";
export class CredentialService {
  async comparePassword(userPassword, hashedPassword) {
    return await bcrypt.compare(userPassword, hashedPassword);
  }
}
