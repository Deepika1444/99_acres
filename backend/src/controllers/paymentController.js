const crypto = require("crypto");
const mongoose = require("mongoose");
const getRazorpayInstance = require("../config/razorpayConfig");
const Payment = require("../models/Payment");

function sendResponse(res, status, message, data = null) {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data,
  });
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeCurrency(value) {
  return normalizeText(value || "INR").toUpperCase();
}

function normalizeNotes(notes = {}) {
  if (!notes || typeof notes !== "object" || Array.isArray(notes)) {
    return {};
  }

  return Object.entries(notes).reduce((accumulator, [key, value]) => {
    const normalizedKey = normalizeText(key);
    const normalizedValue = normalizeText(value);

    if (normalizedKey && normalizedValue) {
      accumulator[normalizedKey] = normalizedValue;
    }

    return accumulator;
  }, {});
}

function isValidOptionalObjectId(value) {
  return !value || mongoose.Types.ObjectId.isValid(value);
}

async function createOrder(req, res) {
  try {
    const amount = Number(req.body?.amount);
    const currency = normalizeCurrency(req.body?.currency);
    const userId = normalizeText(req.body?.userId || req.user?.id);
    const propertyId = normalizeText(req.body?.propertyId);
    const notes = normalizeNotes(req.body?.notes);

    if (!Number.isFinite(amount) || amount <= 0) {
      return sendResponse(res, 400, "amount must be a number greater than 0");
    }

    if (!isValidOptionalObjectId(userId)) {
      return sendResponse(res, 400, "userId is invalid");
    }

    if (!isValidOptionalObjectId(propertyId)) {
      return sendResponse(res, 400, "propertyId is invalid");
    }

    const razorpay = getRazorpayInstance();
    const amountInSmallestUnit = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        ...notes,
        ...(userId ? { userId } : {}),
        ...(propertyId ? { propertyId } : {}),
      },
    });

    await Payment.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      userId: userId || undefined,
      propertyId: propertyId || undefined,
      notes: order.notes || {},
      status: "created",
    });

    return sendResponse(res, 201, "Razorpay order created successfully", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      notes: order.notes || {},
    });
  } catch (error) {
    return sendResponse(res, 500, error.message || "Failed to create Razorpay order");
  }
}

async function verifyPayment(req, res) {
  try {
    const razorpayOrderId = normalizeText(req.body?.razorpay_order_id);
    console.log("orderID", razorpayOrderId);
    const razorpayPaymentId = normalizeText(req.body?.razorpay_payment_id);
    const razorpaySignature = normalizeText(req.body?.razorpay_signature);

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return sendResponse(
        res,
        400,
        "razorpay_order_id, razorpay_payment_id and razorpay_signature are required"
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", String(process.env.RAZORPAY_KEY_SECRET || "").trim())
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return sendResponse(res, 400, "Payment verification failed");
    }

    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpayOrderId },
      {
        $set: {
          paymentId: razorpayPaymentId,
          razorpaySignature,
          status: "paid",
        },
      },
      { new: true }
    );

    if (!payment) {
      return sendResponse(res, 404, "Payment record not found for this order");
    }

    return sendResponse(res, 200, "Payment verified successfully", {
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      userId: payment.userId,
      propertyId: payment.propertyId,
      status: payment.status,
    });
  } catch (error) {
    return sendResponse(res, 500, error.message || "Failed to verify payment");
  }
  
  
}

module.exports = {
  createOrder,
  verifyPayment,
};
