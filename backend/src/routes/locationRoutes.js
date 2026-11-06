const express = require("express");
const {
  getCities,
  getLocalities,
  getSubLocalities,
  getSocieties,
} = require("../controllers/locationController");

const router = express.Router();

router.get("/cities", getCities);
router.get("/localities", getLocalities);
router.get("/sub-localities", getSubLocalities);
router.get("/societies", getSocieties);

module.exports = router;



