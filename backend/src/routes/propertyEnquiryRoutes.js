const express = require("express");
const { createPropertyEnquiry } = require("../controllers/propertyEnquiryController");

const router = express.Router();

router.post("/", createPropertyEnquiry);

module.exports = router;
