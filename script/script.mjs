import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always use the project root (auth-service) as base for certs
const certsDir = path.join(__dirname, "..", "certs");

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048, // Standard secure key length
  privateKeyEncoding: {
    type: "pkcs1", // Recommended modern format
    format: "pem", // Human-readable text format
  },
  publicKeyEncoding: {
    type: "pkcs1", // Recommended modern format
    format: "pem", // Human-readable text format
  },
});

/* console.log("privateKey", privateKey);
console.log("publicKey", publicKey); */

fs.mkdirSync(certsDir, { recursive: true });
fs.writeFileSync(path.join(certsDir, "private.pem"), privateKey);
fs.writeFileSync(path.join(certsDir, "public.pem"), publicKey);
