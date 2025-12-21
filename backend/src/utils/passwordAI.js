function analyzePassword(password) {
  let score = 0;

  if (password.length >= 8) score += 30;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[@$!%*?&]/.test(password)) score += 30;

  return {
    strength:
      score < 40 ? "Weak" : score < 70 ? "Medium" : "Strong",
    score,
  };
}

module.exports = { analyzePassword };
