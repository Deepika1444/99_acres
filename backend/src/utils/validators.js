const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function isValidEmail(value) {
  return emailRegex.test(String(value || "").trim());
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function sanitizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidPhone(value) {
  const digits = sanitizePhone(value);
  return digits.length === 10;
}

function isStrongPassword(value) {
  return strongPasswordRegex.test(String(value || ""));
}

module.exports = {
  isValidEmail,
  normalizeEmail,
  sanitizePhone,
  isValidPhone,
  isStrongPassword,
};
