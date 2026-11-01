import rsaPemToJwk from "rsa-pem-to-jwk";
import fs from "node:fs";

//# note : this file is used to convert rsa private key to jwks
// command : node script/rsaPemToJwk.js

const privateKey = fs.readFileSync("./certs/private.pem");

const jwk = rsaPemToJwk(privateKey, { use: "sig" }, "public");
console.log(JSON.stringify(jwk));
