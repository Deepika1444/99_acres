const mongoose = require("mongoose");

const localitySchema = new mongoose.Schema(
  {
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
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

localitySchema.index({ city: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("Locality", localitySchema);
