const mongoose = require("mongoose");

const subLocalitySchema = new mongoose.Schema(
  {
    locality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Locality",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

subLocalitySchema.index({ locality: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("SubLocality", subLocalitySchema);
