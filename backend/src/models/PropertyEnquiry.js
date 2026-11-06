const mongoose = require("mongoose");

const propertyEnquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    buyerType: {
      type: String,
      enum: ["Individual", "Dealer"],
      required: true,
      trim: true,
    },
    buyReason: {
      type: String,
      enum: ["Investment", "Self Use"],
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    emailNotification: {
      attempted: {
        type: Boolean,
        default: false,
      },
      delivered: {
        type: Boolean,
        default: false,
      },
      error: {
        type: String,
        trim: true,
      },
    },
    smsNotification: {
      attempted: {
        type: Boolean,
        default: false,
      },
      delivered: {
        type: Boolean,
        default: false,
      },
      error: {
        type: String,
        trim: true,
      },
      supported: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

propertyEnquirySchema.index({ property: 1, createdAt: -1 });
propertyEnquirySchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("PropertyEnquiry", propertyEnquirySchema);
