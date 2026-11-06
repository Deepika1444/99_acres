const mongoose = require("mongoose");
const Property = require("../models/Property");
const PropertyEnquiry = require("../models/PropertyEnquiry");
const User = require("../models/User");
const { sendPropertyEnquiryEmail } = require("../utils/emailSender");

const buyerTypeValues = ["Individual", "Dealer"];
const buyReasonValues = ["Investment", "Self Use"];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function buildPropertyTitle(property) {
  const subType = normalizeText(property?.propertySubType).replace(/_/g, " ");
  const lookingTo = normalizeText(property?.lookingTo).replace(/_/g, " ");
  return [subType, lookingTo].filter(Boolean).join(" for ") || "Property";
}

function buildPropertyLocation(property) {
  const location = property?.locationDetails || {};
  return [
    normalizeText(location?.houseNumber),
    normalizeText(location?.apartmentSociety),
    normalizeText(location?.subLocality),
    normalizeText(location?.locality),
    normalizeText(location?.city),
  ]
    .filter(Boolean)
    .join(", ");
}

async function createPropertyEnquiry(req, res) {
  try {
    const propertyId = normalizeText(req.body?.propertyId);
    const ownerId = normalizeText(req.body?.ownerId);
    const ownerEmail = normalizeText(req.body?.ownerEmail).toLowerCase();
    const buyerType = normalizeText(req.body?.buyerType);
    const buyReason = normalizeText(req.body?.buyReason);
    const name = normalizeText(req.body?.name);
    const phone = normalizeText(req.body?.phone);
    const message = normalizeText(req.body?.message);

    if (!propertyId || !ownerId || !ownerEmail || !buyerType || !buyReason || !name || !phone || !message) {
      return sendResponse(
        res,
        400,
        "propertyId, ownerId, ownerEmail, buyerType, buyReason, name, phone and message are required"
      );
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return sendResponse(res, 400, "propertyId is invalid");
    }

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return sendResponse(res, 400, "ownerId is invalid");
    }

    if (!emailRegex.test(ownerEmail)) {
      return sendResponse(res, 400, "ownerEmail is invalid");
    }

    if (!buyerTypeValues.includes(buyerType)) {
      return sendResponse(res, 400, `buyerType must be one of: ${buyerTypeValues.join(", ")}`);
    }

    if (!buyReasonValues.includes(buyReason)) {
      return sendResponse(res, 400, `buyReason must be one of: ${buyReasonValues.join(", ")}`);
    }

    const property = await Property.findById(propertyId)
      .select("_id user propertySubType lookingTo locationDetails")
      .lean();
    if (!property) {
      return sendResponse(res, 404, "Property not found");
    }

    if (String(property.user) !== ownerId) {
      return sendResponse(res, 400, "ownerId does not match this property");
    }

    const owner = await User.findById(ownerId).select("_id fullName email phoneNumber").lean();
    if (!owner) {
      return sendResponse(res, 404, "Owner not found");
    }

    if (owner.email && owner.email.toLowerCase() !== ownerEmail) {
      return sendResponse(res, 400, "ownerEmail does not match this property owner");
    }

    const enquiry = await PropertyEnquiry.create({
      property: property._id,
      owner: owner._id,
      ownerEmail,
      buyerType,
      buyReason,
      name,
      phone,
      message,
      emailNotification: {
        attempted: true,
        delivered: false,
        error: "",
      },
      smsNotification: {
        attempted: false,
        delivered: false,
        error: "SMS support is not configured",
        supported: false,
      },
    });

    const emailResult = await sendPropertyEnquiryEmail({
      to: ownerEmail,
      ownerName: owner.fullName,
      propertyTitle: buildPropertyTitle(property),
      propertyLocation: buildPropertyLocation(property),
      buyerType,
      buyReason,
      buyerName: name,
      buyerPhone: phone,
      message,
    });

    enquiry.emailNotification = {
      attempted: true,
      delivered: Boolean(emailResult.ok),
      error: emailResult.ok ? "" : String(emailResult.reason || "Unable to send email"),
    };
    await enquiry.save();

    return sendResponse(
      res,
      201,
      emailResult.ok ? "Enquiry sent successfully" : "Enquiry saved successfully, but email notification could not be sent",
      {
        enquiryId: enquiry._id,
        emailNotificationSent: Boolean(emailResult.ok),
        emailNotificationError: emailResult.ok ? "" : enquiry.emailNotification.error,
        smsSupported: false,
      }
    );
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

module.exports = {
  createPropertyEnquiry,
};
