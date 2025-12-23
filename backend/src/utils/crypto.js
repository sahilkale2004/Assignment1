const crypto = require("crypto");

const KEY_HEX = process.env.AES_KEY;
const IV_HEX = process.env.AES_IV;

if (!KEY_HEX || !IV_HEX) {
  throw new Error("AES_KEY or AES_IV missing in env");
}

const key = Buffer.from(KEY_HEX, "hex");
const iv = Buffer.from(IV_HEX, "hex");

if (key.length !== 32) {
  throw new Error("AES_KEY must be 32 bytes (64 hex chars)");
}

if (iv.length !== 16) {
  throw new Error("AES_IV must be 16 bytes (32 hex chars)");
}

function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
}

module.exports = { encrypt, decrypt };
