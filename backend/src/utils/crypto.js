const crypto = require("crypto");

const key = Buffer.from(process.env.AES_KEY, "hex");
const iv = Buffer.from(process.env.AES_IV, "hex");

function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
}

module.exports = { encrypt, decrypt };
