const Razorpay = require("razorpay");

function getRazorpayInstance() {
  const keyId = String(process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in environment variables");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

module.exports = getRazorpayInstance;
