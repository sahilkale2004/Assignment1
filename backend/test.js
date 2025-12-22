const bcrypt = require("bcryptjs");

bcrypt.hash("123456", 10).then(hash => {
  console.log("HASH:", hash);
  return bcrypt.compare("123456", hash);
}).then(result => {
  console.log("MATCH:", result);
});
