const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  saveBasicDetails,
  getBasicDetails,
  getAreaUnits,
  saveLocationDetails,
  savePropertyProfile,
  saveMediaDetails,
  savePricingDetails,
  saveAmenitiesDetails,
  saveSellerDetails,
  getFloorPlanConfigurations,
  saveLocationOptions,
  getLocationSuggestions,
  getPropertyDetails,
  getMyProperties,
  getPropertiesByUserId,
  deleteProperty,
} = require("../controllers/propertyController");

const router = express.Router();

router.use(protect);

router.post("/basic-details", saveBasicDetails);
router.get("/basic-details", getBasicDetails);
router.get("/basic-details/:propertyId", getBasicDetails);
router.get("/", getMyProperties);
router.get("/my-listings", getMyProperties);
router.get("/my-properties", getMyProperties);
router.get("/owner", getMyProperties);
router.get("/user/:userId", getPropertiesByUserId);
router.get("/user", getMyProperties);
router.get("/area-units", getAreaUnits);
router.post("/location-details", saveLocationDetails);
router.post("/location-details/:propertyId", saveLocationDetails);
router.post("/location-options", saveLocationOptions);
router.post("/location-suggestions", getLocationSuggestions);
router.post("/property-profile", savePropertyProfile);
router.post("/property-profile/:propertyId", savePropertyProfile);
router.post("/media-details", saveMediaDetails);
router.post("/media-details/:propertyId", saveMediaDetails);
router.post("/pricing-details", savePricingDetails);
router.post("/pricing-details/:propertyId", savePricingDetails);
router.post("/amenities-details", saveAmenitiesDetails);
router.post("/amenities-details/:propertyId", saveAmenitiesDetails);
router.post("/seller-details", saveSellerDetails);
router.post("/seller-details/:propertyId", saveSellerDetails);
router.get("/floor-plans", getFloorPlanConfigurations);
router.get("/details/:propertyId", getPropertyDetails);
router.get("/property-details/:propertyId", getPropertyDetails);
router.get("/location-details/:propertyId", getPropertyDetails);
router.delete("/:propertyId", deleteProperty);
router.get("/:propertyId", getPropertyDetails);

module.exports = router;
