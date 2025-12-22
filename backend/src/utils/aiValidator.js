function analyzeAadhaar(aadhaar) {
  let score = 0;
  let issues = [];

  if (!/^\d{12}$/.test(aadhaar)) {
    score += 40;
    issues.push("Invalid Aadhaar format");
  }

  if (/(\d)\1{5,}/.test(aadhaar)) {
    score += 30;
    issues.push("Repeated digits detected");
  }

  if (aadhaar.startsWith("0")) {
    score += 20;
    issues.push("Suspicious starting digit");
  }

  return {
    score,
    riskLevel: score < 30 ? "LOW" : score < 60 ? "MEDIUM" : "HIGH",
    issues,
  };
}

module.exports = { analyzeAadhaar };
