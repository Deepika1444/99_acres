const mongoose = require("mongoose");

const societySchema = new mongoose.Schema(
  {
    subLocality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubLocality",
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

societySchema.index({ subLocality: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("Society", societySchema);
