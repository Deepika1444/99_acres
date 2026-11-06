const Property = require("../models/Property");
const City = require("../models/City");
const Locality = require("../models/Locality");
const SubLocality = require("../models/SubLocality");
const Society = require("../models/Society");
const mongoose = require("mongoose");
const lookingToValues = ["sell", "rent_lease", "pg"];
const propertyKindValues = ["residential", "commercial"];
const defaultAreaUnits = [
  { key: "sq.ft.", label: "sq.ft.", order: 1 },
  { key: "sq.yards", label: "sq.yards", order: 2 },
  { key: "sq.m.", label: "sq.m.", order: 3 },
  { key: "acres", label: "acres", order: 4 },
  { key: "marla", label: "marla", order: 5 },
  { key: "cents", label: "cents", order: 6 },
];

const allowedSubTypes = {
  residential: [
    "flat_apartment",
    "independent_house_villa",
    "independent_builder_floor",
    "plot_land",
    "studio_apartment",
    "serviced_apartment",
    "farmhouse",
    "other",
  ],
  commercial: [
    "office",
    "retail",
    "commercial_land",
    "warehouse_godown",
    "industrial_shed",
    "other",
  ],
};

function sendResponse(res, status, message, data = null) {
  return res.status(status).json({
    message,
    data,
    success: status >= 200 && status < 300,
  });
}

function normalizeInput(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\/\s-]+/g, "_");
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function getCompletionPercent(payload, fallbackValue) {
  const raw = payload?.completionPercent;
  if (raw === undefined || raw === null || raw === "") {
    return { value: fallbackValue };
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return { error: "completionPercent must be a number between 0 and 100" };
  }

  return { value: parsed };
}

function toLocationPayload(payload) {
  const city = String(payload?.city || "").trim();
  const locality = String(payload?.locality || "").trim();
  const subLocality = String(payload?.subLocality || "").trim();
  const apartmentSociety = String(payload?.apartmentSociety || "").trim();
  const houseNumber = String(payload?.houseNumber || "").trim();

  if (!city) {
    return { error: "city is required" };
  }

  return {
    value: {
      city,
      locality,
      subLocality,
      apartmentSociety,
      houseNumber,
    },
  };
}

function getPropertyIdFromRequest(req) {
  return String(req.params?.propertyId || req.body?.propertyId || req.query?.propertyId || "").trim();
}

function getPropertyFilterForUser(req, propertyId) {
  return { _id: propertyId, user: req.user.id };
}

function getCreatedAtSortOrder(sortValue) {
  const normalized = String(sortValue || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if (["oldest", "oldest_first", "asc", "ascending", "1"].includes(normalized)) {
    return 1;
  }

  return -1;
}

async function saveLocationDetails(req, res) {
  try {
    const propertyId = getPropertyIdFromRequest(req);

    if (!propertyId) {
      return sendResponse(res, 400, "propertyId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return sendResponse(res, 400, "propertyId is invalid");
    }

    const { error, value } = toLocationPayload(req.body || {});
    if (error) {
      return sendResponse(res, 400, error);
    }

    const completion = getCompletionPercent(req.body, undefined);
    if (completion.error) {
      return sendResponse(res, 400, completion.error);
    }

    const setPayload = {
      locationDetails: value,
    };
    if (completion.value !== undefined) {
      setPayload.completionPercent = completion.value;
    }

    const property = await Property.findOneAndUpdate(
      { _id: propertyId, user: req.user.id },
      {
        $set: setPayload,
      },
      { new: true }
    ).lean();

    if (!property) {
      return sendResponse(res, 404, "Property not found for this user");
    }

    return sendResponse(res, 200, "Location details saved successfully", {
      propertyId: property._id,
      locationDetails: property.locationDetails || null,
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

function validateBasicDetails(payload) {
  const lookingTo = normalizeInput(payload.lookingTo);
  const propertyKind = normalizeInput(payload.propertyKind);
  const propertySubType = normalizeInput(payload.propertySubType);

  if (!lookingTo || !propertyKind || !propertySubType) {
    return { error: "lookingTo, propertyKind and propertySubType are required" };
  }

  if (!lookingToValues.includes(lookingTo)) {
    return { error: `lookingTo must be one of: ${lookingToValues.join(", ")}` };
  }

  if (!propertyKindValues.includes(propertyKind)) {
    return { error: `propertyKind must be one of: ${propertyKindValues.join(", ")}` };
  }

  const allowedForKind = allowedSubTypes[propertyKind] || [];
  if (!allowedForKind.includes(propertySubType)) {
    return {
      error: `propertySubType is invalid for ${propertyKind}. Allowed: ${allowedForKind.join(", ")}`,
    };
  }

  return {
    value: {
      lookingTo,
      propertyKind,
      propertySubType,
    },
  };
}

async function saveBasicDetails(req, res) {
  try {
    const { error, value } = validateBasicDetails(req.body || {});
    if (error) {
      return sendResponse(res, 400, error);
    }

    const completion = getCompletionPercent(req.body, 20);
    if (completion.error) {
      return sendResponse(res, 400, completion.error);
    }
    const propertyId = getPropertyIdFromRequest(req);
    let saved;

    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return sendResponse(res, 400, "propertyId is invalid");
      }

      saved = await Property.findOneAndUpdate(
        getPropertyFilterForUser(req, propertyId),
        {
          $set: {
            lookingTo: value.lookingTo,
            propertyKind: value.propertyKind,
            propertySubType: value.propertySubType,
            currentStep: 1,
            completionPercent: completion.value,
          },
        },
        { new: true }
      ).lean();

      if (!saved) {
        return sendResponse(res, 404, "Property not found for this user");
      }
    } else {
      saved = await Property.create({
        user: req.user.id,
        currentStep: 1,
        lookingTo: value.lookingTo,
        propertyKind: value.propertyKind,
        propertySubType: value.propertySubType,
        completionPercent: completion.value,
      });
    }

    return sendResponse(res, 200, "Basic details saved successfully", {
      propertyId: saved._id,
      basicDetails: {
        lookingTo: saved.lookingTo,
        propertyKind: saved.propertyKind,
        propertySubType: saved.propertySubType,
      },
    });
  } catch (error) {
    console.error("saveBasicDetails error:", error);
    return sendResponse(res, 500, "Internal server error");
  }
}

async function getBasicDetails(req, res) {
  try {
    const propertyId = getPropertyIdFromRequest(req);
    let property;

    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return sendResponse(res, 400, "propertyId is invalid");
      }

      property = await Property.findOne(getPropertyFilterForUser(req, propertyId)).lean();
    } else {
      property = await Property.findOne({ user: req.user.id, currentStep: 1 })
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!property) {
      return sendResponse(res, 404, "No basic details found for this user");
    }

    return sendResponse(res, 200, "Basic details fetched successfully", {
      propertyId: property._id,
      basicDetails: {
        lookingTo: property.lookingTo,
        propertyKind: property.propertyKind,
        propertySubType: property.propertySubType,
      },
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function getAreaUnits(_req, res) {
  try {
    const units = [...defaultAreaUnits].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    return sendResponse(res, 200, "Area units fetched successfully", { units });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}


function toNonNegativeNumber(value) {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}


async function savePropertyProfile(req, res) {
  try {
    const payload = req.body || {};
    const propertyId = getPropertyIdFromRequest(req);
    if (!propertyId) {
      return sendResponse(res, 400, "propertyId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return sendResponse(res, 400, "propertyId is invalid");
    }

    const completion = getCompletionPercent(payload, 60);
    if (completion.error) {
      return sendResponse(res, 400, completion.error);
    }

    const builtUpAreaValue = toNonNegativeNumber(payload?.builtUpArea?.value);
    if (builtUpAreaValue === null || builtUpAreaValue === undefined) {
      return sendResponse(res, 400, "builtUpArea.value must be a non-negative number");
    }

    const propertyOnFloor = String(payload?.propertyOnFloor || "").trim();

    const totalFloors = toNonNegativeNumber(payload?.totalFloors);
    if (totalFloors === null) {
      return sendResponse(res, 400, "totalFloors must be a non-negative number");
    }

    const bedrooms = toNonNegativeNumber(payload?.roomDetails?.bedrooms);
    const bathrooms = toNonNegativeNumber(payload?.roomDetails?.bathrooms);
    const balconies = toNonNegativeNumber(payload?.roomDetails?.balconies);
    if (bedrooms === null || bathrooms === null || balconies === null) {
      return sendResponse(res, 400, "roomDetails values must be non-negative numbers");
    }

    const carpetAreaValue = toNonNegativeNumber(payload?.areaDetails?.carpetArea?.value);
    if (carpetAreaValue === null) {
      return sendResponse(res, 400, "areaDetails.carpetArea.value must be a non-negative number");
    }

    const coveredParking = toNonNegativeNumber(payload?.parking?.covered);
    const openParking = toNonNegativeNumber(payload?.parking?.open);
    if (coveredParking === null || openParking === null) {
      return sendResponse(res, 400, "parking values must be non-negative numbers");
    }

    const selectedConfigurationPayload = payload?.selectedConfiguration || null;
    let selectedConfiguration;
    if (selectedConfigurationPayload) {
      const selectedArea = toNonNegativeNumber(selectedConfigurationPayload?.superBuiltUpArea);
      const selectedBathrooms = toNonNegativeNumber(selectedConfigurationPayload?.bathrooms);
      const selectedBalconies = toNonNegativeNumber(selectedConfigurationPayload?.balconies);
      if (selectedArea === null || selectedBathrooms === null || selectedBalconies === null) {
        return sendResponse(
          res,
          400,
          "selectedConfiguration values must be non-negative numbers"
        );
      }
      selectedConfiguration = {
        apartmentType: String(selectedConfigurationPayload?.apartmentType || "").trim(),
        superBuiltUpArea: selectedArea,
        bathrooms: selectedBathrooms,
        balconies: selectedBalconies,
        availability: String(selectedConfigurationPayload?.availability || "").trim(),
        image: String(selectedConfigurationPayload?.image || "").trim(),
      };
    }

    const propertyProfile = {
      configuration: String(payload?.configuration || "").trim(),
      selectedConfiguration,
      builtUpArea: {
        value: builtUpAreaValue,
        unit: String(payload?.builtUpArea?.unit || "sqft").trim() || "sqft",
      },
      propertyOnFloor,
      totalFloors,
      roomDetails: {
        bedrooms,
        bathrooms,
        balconies,
        otherRooms: Array.isArray(payload?.roomDetails?.otherRooms)
          ? payload.roomDetails.otherRooms.map((item) => String(item || "").trim()).filter(Boolean)
          : [],
      },
      areaDetails: {
        carpetArea: {
          value: carpetAreaValue,
          unit: String(payload?.areaDetails?.carpetArea?.unit || "sqft").trim() || "sqft",
        },
      },
      parking: {
        covered: coveredParking ?? 0,
        open: openParking ?? 0,
      },
      flooringTypes: Array.isArray(payload?.flooringTypes)
        ? payload.flooringTypes.map((item) => String(item || "").trim()).filter(Boolean)
        : [],
      furnishingStatus: String(payload?.furnishingStatus || "").trim(),
      furnishingItems: Array.isArray(payload?.furnishingItems)
        ? payload.furnishingItems.map((item) => String(item || "").trim()).filter(Boolean)
        : [],
      availabilityStatus: String(payload?.availabilityStatus || "").trim(),
      ageOfProperty: String(payload?.ageOfProperty || "").trim(),
      possessionBy: String(payload?.possessionBy || "").trim(),
      ownershipType: String(payload?.ownershipType || "").trim(),
      propertyFacing: String(payload?.propertyFacing || "").trim(),
    };

    const property = await Property.findOneAndUpdate(
      getPropertyFilterForUser(req, propertyId),
      {
        $set: {
          propertyProfile,
          completionPercent: completion.value,
        },
      },
      { new: true }
    ).lean();

    if (!property) {
      return sendResponse(res, 404, "Basic details not found. Save Step-1 first.");
    }

    return sendResponse(res, 200, "Property profile saved successfully", {
      propertyId: property._id,
      propertyProfile: property.propertyProfile || null,
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function getFloorPlanConfigurations(req, res) {
  try {
    const apartmentType = String(req.query?.apartmentType || "").trim();
    const city = String(req.query?.city || "").trim();
    const locality = String(req.query?.locality || "").trim();
    const apartmentSociety = String(req.query?.apartmentSociety || "").trim();

    if (!apartmentType) {
      return sendResponse(res, 400, "apartmentType is required");
    }

    const filter = {
      "propertyProfile.configuration": apartmentType,
      "propertyProfile.builtUpArea.value": { $gt: 0 },
    };

    if (apartmentSociety) {
      filter["locationDetails.apartmentSociety"] = apartmentSociety;
    } else if (locality) {
      filter["locationDetails.locality"] = locality;
      if (city) filter["locationDetails.city"] = city;
    } else if (city) {
      filter["locationDetails.city"] = city;
    }

    const docs = await Property.find(filter)
      .sort({ updatedAt: -1 })
      .limit(30)
      .select({
        propertyProfile: 1,
        mediaDetails: 1,
      })
      .lean();

    const plans = [];
    const seen = new Set();

    for (const doc of docs) {
      const profile = doc?.propertyProfile || {};
      const config = String(profile?.configuration || "").trim();
      const area = Number(profile?.builtUpArea?.value || 0);
      const bathrooms = Number(profile?.roomDetails?.bathrooms || 0);
      const balconies = Number(profile?.roomDetails?.balconies || 0);
      if (!config || !area) continue;

      const key = `${config}|${area}|${bathrooms}|${balconies}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const firstPhoto = Array.isArray(doc?.mediaDetails?.photos)
        ? doc.mediaDetails.photos.find((p) => String(p?.url || "").trim())
        : null;

      plans.push({
        apartmentType: config,
        superBuiltUpArea: area,
        bathrooms: bathrooms || Number(config.split(" ")[0]) || 1,
        balconies: balconies || 1,
        availability: profile?.availabilityStatus
          ? String(profile.availabilityStatus).replace(/_/g, " ")
          : "Ready To Move",
        image:
          String(profile?.selectedConfiguration?.image || "").trim() ||
          String(firstPhoto?.url || "").trim() ||
          "",
      });

      if (plans.length >= 8) break;
    }

    return sendResponse(res, 200, "Floor plans fetched successfully", {
      apartmentType,
      plans,
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function saveMediaDetails(req, res) {
  try {
    const payload = req.body || {};
    const propertyId = getPropertyIdFromRequest(req);
    if (!propertyId) {
      return sendResponse(res, 400, "propertyId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return sendResponse(res, 400, "propertyId is invalid");
    }

    const completion = getCompletionPercent(payload, 80);
    if (completion.error) {
      return sendResponse(res, 400, completion.error);
    }
    const photoItems = Array.isArray(payload.photos) ? payload.photos : [];

    if (photoItems.length > 50) {
      return sendResponse(res, 400, "photos can have maximum 50 items");
    }

    const photos = photoItems
      .map((item, index) => {
        const url = String(item?.url || "").trim();
        const name = String(item?.name || "").trim();
        if (!url && !name) return null;
        return {
          url,
          name,
          caption: String(item?.caption || "").trim(),
          order: toNonNegativeNumber(item?.order) ?? index,
          isCover: Boolean(item?.isCover),
        };
      })
      .filter(Boolean);

    const contactEmail = String(payload?.contactEmail || "").trim().toLowerCase();
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return sendResponse(res, 400, "contactEmail is invalid");
    }

    const mediaDetails = {
      video: {
        url: String(payload?.video?.url || "").trim(),
        title: String(payload?.video?.title || "").trim(),
        fileName: String(payload?.video?.fileName || payload?.videoName || "").trim(),
      },
      photos,
      propertyDescription: String(payload?.propertyDescription || payload?.description || "").trim(),
      contactEmail,
      continueWithoutPhotos: Boolean(payload?.continueWithoutPhotos),
    };

    const property = await Property.findOneAndUpdate(
      getPropertyFilterForUser(req, propertyId),
      {
        $set: {
          mediaDetails,
          completionPercent: completion.value,
        },
      },
      { new: true }
    ).lean();

    if (!property) {
      return sendResponse(res, 404, "Basic details not found. Save Step-1 first.");
    }

    return sendResponse(res, 200, "Media details saved successfully", {
      propertyId: property._id,
      mediaDetails: property.mediaDetails || null,
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function savePricingDetails(req, res) {
  try {
    const payload = req.body || {};
    const propertyId = getPropertyIdFromRequest(req);
    if (!propertyId) {
      return sendResponse(res, 400, "propertyId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return sendResponse(res, 400, "propertyId is invalid");
    }

    const completion = getCompletionPercent(payload, 100);
    if (completion.error) {
      return sendResponse(res, 400, completion.error);
    }

    const expectedPriceRaw = toNonNegativeNumber(payload?.priceDetails?.expectedPrice);
    if (expectedPriceRaw === null) {
      return sendResponse(res, 400, "priceDetails.expectedPrice must be a non-negative number");
    }
    const expectedPrice = expectedPriceRaw ?? 0;

    const pricePerSqft = toNonNegativeNumber(payload?.priceDetails?.pricePerSqft);
    if (pricePerSqft === null) {
      return sendResponse(res, 400, "priceDetails.pricePerSqft must be a non-negative number");
    }

    const maintenanceAmount = toNonNegativeNumber(payload?.additionalPriceDetails?.maintenance?.amount);
    const expectedRentalIncome = toNonNegativeNumber(payload?.additionalPriceDetails?.expectedRentalIncome);
    const bookingAmount = toNonNegativeNumber(payload?.additionalPriceDetails?.bookingAmount);
    const annualDuesPayable = toNonNegativeNumber(payload?.additionalPriceDetails?.annualDuesPayable);
    if (
      maintenanceAmount === null ||
      expectedRentalIncome === null ||
      bookingAmount === null ||
      annualDuesPayable === null
    ) {
      return sendResponse(res, 400, "additionalPriceDetails values must be non-negative numbers");
    }

    const brokerageValue = toNonNegativeNumber(payload?.brokerage?.value);
    if (brokerageValue === null) {
      return sendResponse(res, 400, "brokerage.value must be a non-negative number");
    }

    const pricingDetails = {
      ownershipType: String(payload?.ownershipType || "").trim(),
      priceDetails: {
        expectedPrice,
        expectedPriceUnit: String(payload?.priceDetails?.expectedPriceUnit || "INR").trim() || "INR",
        pricePerSqft,
        allInclusivePrice: Boolean(payload?.priceDetails?.allInclusivePrice),
        taxAndGovtChargesExcluded: Boolean(payload?.priceDetails?.taxAndGovtChargesExcluded),
        priceNegotiable: Boolean(payload?.priceDetails?.priceNegotiable),
      },
      additionalPriceDetails: {
        maintenance: {
          amount: maintenanceAmount,
          frequency: String(payload?.additionalPriceDetails?.maintenance?.frequency || "").trim(),
        },
        expectedRentalIncome,
        bookingAmount,
        annualDuesPayable,
      },
      brokerage: {
        charged: Boolean(payload?.brokerage?.charged),
        type: String(payload?.brokerage?.type || "").trim(),
        value: brokerageValue,
        negotiable: Boolean(payload?.brokerage?.negotiable),
      },
      propertyDescription: String(payload?.propertyDescription || "").trim(),
    };

    if (!pricingDetails.brokerage.charged) {
      pricingDetails.brokerage.type = "";
      pricingDetails.brokerage.value = undefined;
      pricingDetails.brokerage.negotiable = false;
    }

    if (pricingDetails.priceDetails.pricePerSqft === undefined && payload?.builtUpArea) {
      const areaValue = toNonNegativeNumber(payload?.builtUpArea);
      if (areaValue && areaValue > 0) {
        pricingDetails.priceDetails.pricePerSqft = Number((expectedPrice / areaValue).toFixed(2));
      }
    }

    const property = await Property.findOneAndUpdate(
      getPropertyFilterForUser(req, propertyId),
      {
        $set: {
          pricingDetails,
          completionPercent: completion.value,
        },
      },
      { new: true }
    ).lean();

    if (!property) {
      return sendResponse(res, 404, "Basic details not found. Save Step-1 first.");
    }

    return sendResponse(res, 200, "Pricing details saved successfully", {
      propertyId: property._id,
      pricingDetails: property.pricingDetails || null,
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  const single = String(value || "").trim();
  return single ? [single] : [];
}

function getCoverPhoto(mediaDetails) {
  const photos = Array.isArray(mediaDetails?.photos) ? mediaDetails.photos : [];
  const cover = photos.find((item) => Boolean(item?.isCover) && String(item?.url || "").trim());
  if (cover) return cover;
  return photos.find((item) => String(item?.url || "").trim()) || null;
}

function toPropertyListItem(property) {
  const coverPhoto = getCoverPhoto(property?.mediaDetails);
  return {
    propertyId: property?._id,
    _id: property?._id,
    basicDetails: {
      lookingTo: property?.lookingTo || "",
      propertyKind: property?.propertyKind || "",
      propertySubType: property?.propertySubType || "",
    },
    locationDetails: property?.locationDetails || {},
    propertyProfile: property?.propertyProfile || {},
    pricingDetails: property?.pricingDetails || {},
    mediaDetails: property?.mediaDetails || {},
    amenitiesDetails: property?.amenitiesDetails || {},
    sellerDetails: property?.sellerDetails || {},
    completionPercent: Number(property?.completionPercent || 0),
    currentStep: Number(property?.currentStep || 1),
    createdAt: property?.createdAt || null,
    updatedAt: property?.updatedAt || null,
    propertySubType: property?.propertySubType || "",
    city: property?.locationDetails?.city || "",
    locality: property?.locationDetails?.locality || "",
    subLocality: property?.locationDetails?.subLocality || "",
    priceDetails: property?.pricingDetails?.priceDetails || {},
    expectedPrice: property?.pricingDetails?.priceDetails?.expectedPrice,
    coverImageUrl: String(coverPhoto?.url || "").trim(),
    image: String(coverPhoto?.url || "").trim(),
    photos: Array.isArray(property?.mediaDetails?.photos) ? property.mediaDetails.photos : [],
    totalResponses: 0,
  };
}

function toFullPropertyPayload(property) {
  return {
    ...toPropertyListItem(property),
    propertyProfile: property?.propertyProfile || {},
    amenitiesDetails: property?.amenitiesDetails || {},
    sellerDetails: property?.sellerDetails || {},
  };
}

async function saveAmenitiesDetails(req, res) {
  try {
    const payload = req.body || {};
    const propertyId = getPropertyIdFromRequest(req);
    if (!propertyId) {
      return sendResponse(res, 400, "propertyId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return sendResponse(res, 400, "propertyId is invalid");
    }

    const completion = getCompletionPercent(payload, 100);
    if (completion.error) {
      return sendResponse(res, 400, completion.error);
    }

    const roadWidthValue = toNonNegativeNumber(payload?.widthOfFacingRoad?.value);
    if (roadWidthValue === null) {
      return sendResponse(res, 400, "widthOfFacingRoad.value must be a non-negative number");
    }
    const coveredParking = toNonNegativeNumber(payload?.reservedParking?.covered);
    const openParking = toNonNegativeNumber(payload?.reservedParking?.open);
    if (coveredParking === null || openParking === null) {
      return sendResponse(res, 400, "reservedParking values must be non-negative numbers");
    }

    const amenitiesDetails = {
      otherRooms: normalizeStringArray(payload?.otherRooms),
      furnishingStatus: String(payload?.furnishingStatus || "").trim(),
      furnishingItems: normalizeStringArray(payload?.furnishingItems),
      reservedParking: {
        covered: coveredParking ?? 0,
        open: openParking ?? 0,
      },
      amenities: normalizeStringArray(payload?.amenities),
      propertyFeatures: normalizeStringArray(payload?.propertyFeatures),
      societyFeatures: normalizeStringArray(payload?.societyFeatures),
      additionalFeatures: normalizeStringArray(payload?.additionalFeatures),
      overlooking: normalizeStringArray(payload?.overlooking),
      otherFeatures: {
        cornerProperty: Boolean(payload?.otherFeatures?.cornerProperty),
        inGatedSociety: Boolean(payload?.otherFeatures?.inGatedSociety),
      },
      powerBackup: String(payload?.powerBackup || "").trim(),
      propertyFacing: normalizeStringArray(payload?.propertyFacing),
      typeOfFlooring: String(payload?.typeOfFlooring || "").trim(),
      widthOfFacingRoad: {
        value: roadWidthValue,
        unit: String(payload?.widthOfFacingRoad?.unit || "ft").trim() || "ft",
      },
      locationAdvantages: normalizeStringArray(payload?.locationAdvantages),
      description: String(payload?.description || "").trim(),
    };

    const property = await Property.findOneAndUpdate(
      getPropertyFilterForUser(req, propertyId),
      {
        $set: {
          amenitiesDetails,
          completionPercent: completion.value,
        },
      },
      { new: true }
    ).lean();

    if (!property) {
      return sendResponse(res, 404, "Basic details not found. Save Step-1 first.");
    }

    return sendResponse(res, 200, "Amenities details saved successfully", {
      propertyId: property._id,
      amenitiesDetails: property.amenitiesDetails || null,
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function saveSellerDetails(req, res) {
  try {
    const payload = req.body || {};
    const propertyId = getPropertyIdFromRequest(req);
    if (!propertyId) {
      return sendResponse(res, 400, "propertyId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return sendResponse(res, 400, "propertyId is invalid");
    }

    const completion = getCompletionPercent(payload, 100);
    if (completion.error) {
      return sendResponse(res, 400, completion.error);
    }

    const registrationStatus = String(payload?.rera?.registrationStatus || "").trim();
    const allowedReraStatuses = ["yes", "applied", "not_applicable"];
    if (!allowedReraStatuses.includes(registrationStatus)) {
      return sendResponse(
        res,
        400,
        `rera.registrationStatus must be one of: ${allowedReraStatuses.join(", ")}`
      );
    }

    const primaryNumber = String(payload?.contactDetails?.primaryNumber || "").trim();
    if (!primaryNumber) {
      return sendResponse(res, 400, "contactDetails.primaryNumber is required");
    }

    const sellerDetails = {
      rera: {
        registrationStatus,
        reraId: String(payload?.rera?.reraId || "").trim(),
        state: String(payload?.rera?.state || "").trim(),
        registrationDate: String(payload?.rera?.registrationDate || "").trim(),
        expiryDate: String(payload?.rera?.expiryDate || "").trim(),
      },
      licenseType: String(payload?.licenseType || "").trim(),
      companyDetails: {
        name: String(payload?.companyDetails?.name || "").trim(),
        url: String(payload?.companyDetails?.url || "").trim(),
        addressLine1: String(payload?.companyDetails?.addressLine1 || "").trim(),
        addressLine2: String(payload?.companyDetails?.addressLine2 || "").trim(),
        city: String(payload?.companyDetails?.city || "").trim(),
        description: String(payload?.companyDetails?.description || "").trim(),
      },
      contactDetails: {
        countryCode: String(payload?.contactDetails?.countryCode || "+91").trim() || "+91",
        primaryNumber,
        alternateNumbers: normalizeStringArray(payload?.contactDetails?.alternateNumbers).slice(0, 4),
        updateViaWhatsapp: Boolean(payload?.contactDetails?.updateViaWhatsapp),
      },
    };

    if (registrationStatus === "yes" || registrationStatus === "applied") {
      if (!sellerDetails.rera.reraId || !sellerDetails.rera.state) {
        return sendResponse(
          res,
          400,
          "rera.reraId and rera.state are required when registrationStatus is yes or applied"
        );
      }
    } else {
      sellerDetails.rera.reraId = "";
      sellerDetails.rera.state = "";
      sellerDetails.rera.registrationDate = "";
      sellerDetails.rera.expiryDate = "";
    }

    const property = await Property.findOneAndUpdate(
      getPropertyFilterForUser(req, propertyId),
      {
        $set: {
          sellerDetails,
          completionPercent: completion.value,
        },
      },
      { new: true }
    ).lean();

    if (!property) {
      return sendResponse(res, 404, "Basic details not found. Save Step-1 first.");
    }

    return sendResponse(res, 200, "Seller details saved successfully", {
      propertyId: property._id,
      sellerDetails: property.sellerDetails || null,
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function saveLocationOptions(req, res) {
  try {
    const cityName = String(req.body?.city || "").trim();
    const localityName = String(req.body?.locality || "").trim();
    const subLocalityName = String(req.body?.subLocality || "").trim();
    const societyName = String(req.body?.apartmentSociety || "").trim();

    if (!cityName) {
      return sendResponse(res, 400, "city is required");
    }
    if (subLocalityName && !localityName) {
      return sendResponse(res, 400, "locality is required when subLocality is provided");
    }
    if (societyName && !subLocalityName) {
      return sendResponse(res, 400, "subLocality is required when apartmentSociety is provided");
    }

    const city = await City.findOneAndUpdate(
      { key: toKey(cityName) },
      {
        $setOnInsert: {
          name: cityName,
          key: toKey(cityName),
        },
      },
      { upsert: true, new: true }
    ).lean();

    let locality = null;
    if (localityName) {
      locality = await Locality.findOneAndUpdate(
        { city: city._id, key: toKey(localityName) },
        {
          $setOnInsert: {
            city: city._id,
            name: localityName,
            key: toKey(localityName),
          },
        },
        { upsert: true, new: true }
      ).lean();
    }

    let subLocality = null;
    if (subLocalityName) {
      subLocality = await SubLocality.findOneAndUpdate(
        { locality: locality._id, key: toKey(subLocalityName) },
        {
          $setOnInsert: {
            locality: locality._id,
            name: subLocalityName,
            key: toKey(subLocalityName),
          },
        },
        { upsert: true, new: true }
      ).lean();
    }

    let society = null;
    if (societyName) {
      society = await Society.findOneAndUpdate(
        { subLocality: subLocality._id, key: toKey(societyName) },
        {
          $setOnInsert: {
            subLocality: subLocality._id,
            name: societyName,
            key: toKey(societyName),
          },
        },
        { upsert: true, new: true }
      ).lean();
    }

    return sendResponse(res, 200, "Location options saved successfully", {
      CityID: String(city._id),
      CityName: city.name,
      LocalityID: locality ? String(locality._id) : "",
      LocalityName: locality?.name || "",
      SubLocalityID: subLocality ? String(subLocality._id) : "",
      SubLocalityName: subLocality?.name || "",
      SocietyID: society ? String(society._id) : "",
      SocietyName: society?.name || "",
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function getLocationSuggestions(req, res) {
  try {
    const field = String(req.body?.field || "").trim();
    const query = String(req.body?.query || "").trim();
    const cityName = String(req.body?.city || "").trim();
    const localityName = String(req.body?.locality || "").trim();
    const subLocalityName = String(req.body?.subLocality || "").trim();
    const limitRaw = Number(req.body?.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 20) : 8;

    const searchFilter = query
      ? {
          name: { $regex: `^${escapeRegex(query)}`, $options: "i" },
        }
      : {};

    let suggestions = [];

    if (field === "city") {
      const rows = await City.find(searchFilter).sort({ name: 1 }).limit(limit).select({ name: 1 }).lean();
      suggestions = rows.map((row) => row.name);
      return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions });
    }

    if (field === "locality") {
      if (!cityName) {
        return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions: [] });
      }
      const city = await City.findOne({ key: toKey(cityName) }).select("_id").lean();
      if (!city) {
        return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions: [] });
      }
      const rows = await Locality.find({ city: city._id, ...searchFilter })
        .sort({ name: 1 })
        .limit(limit)
        .select({ name: 1 })
        .lean();
      suggestions = rows.map((row) => row.name);
      return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions });
    }

    if (field === "subLocality") {
      if (!cityName || !localityName) {
        return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions: [] });
      }
      const city = await City.findOne({ key: toKey(cityName) }).select("_id").lean();
      if (!city) {
        return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions: [] });
      }
      const locality = await Locality.findOne({ city: city._id, key: toKey(localityName) })
        .select("_id")
        .lean();
      if (!locality) {
        return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions: [] });
      }
      const rows = await SubLocality.find({ locality: locality._id, ...searchFilter })
        .sort({ name: 1 })
        .limit(limit)
        .select({ name: 1 })
        .lean();
      suggestions = rows.map((row) => row.name);
      return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions });
    }

    if (field === "apartmentSociety") {
      if (!cityName || !localityName || !subLocalityName) {
        return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions: [] });
      }
      const city = await City.findOne({ key: toKey(cityName) }).select("_id").lean();
      if (!city) {
        return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions: [] });
      }
      const locality = await Locality.findOne({ city: city._id, key: toKey(localityName) })
        .select("_id")
        .lean();
      if (!locality) {
        return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions: [] });
      }
      const subLocality = await SubLocality.findOne({
        locality: locality._id,
        key: toKey(subLocalityName),
      })
        .select("_id")
        .lean();
      if (!subLocality) {
        return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions: [] });
      }
      const rows = await Society.find({ subLocality: subLocality._id, ...searchFilter })
        .sort({ name: 1 })
        .limit(limit)
        .select({ name: 1 })
        .lean();
      suggestions = rows.map((row) => row.name);
      return sendResponse(res, 200, "Location suggestions fetched successfully", { suggestions });
    }

    return sendResponse(res, 400, "field is invalid");
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function getPropertyDetails(req, res) {
  try {
    const propertyId = getPropertyIdFromRequest(req);
    if (!propertyId) {
      return sendResponse(res, 400, "propertyId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return sendResponse(res, 400, "propertyId is invalid");
    }

    const property = await Property.findOne(getPropertyFilterForUser(req, propertyId)).lean();
    if (!property) {
      return sendResponse(res, 404, "Property not found for this user");
    }

    const payload = toFullPropertyPayload(property);

    return sendResponse(res, 200, "Property details fetched successfully", {
      property: payload,
      ...payload,
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function getMyProperties(req, res) {
  try {
    const limitRaw = Number(req.query?.limit);
    const city = String(req.query?.city || "").trim();
    const sortOrder = getCreatedAtSortOrder(req.query?.sortOrder || req.query?.sort);
    const filter = { user: req.user.id };
    if (city) {
      filter["locationDetails.city"] = { $regex: `^${escapeRegex(city)}$`, $options: "i" };
    }
    let query = Property.find(filter).sort({ createdAt: sortOrder });
    if (Number.isFinite(limitRaw) && limitRaw > 0) {
      query = query.limit(Math.min(limitRaw, 1000));
    }

    const properties = await query.lean();
    const list = properties.map(toFullPropertyPayload);
    return sendResponse(res, 200, "Properties fetched successfully", {
      properties: list,
      count: list.length,
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function getPropertiesByUserId(req, res) {
  try {
    const requestedUserId = String(req.params?.userId || "").trim();
    if (!requestedUserId) {
      return sendResponse(res, 400, "userId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
      return sendResponse(res, 400, "userId is invalid");
    }
    if (String(req.user.id) !== requestedUserId) {
      return sendResponse(res, 403, "Forbidden. You can access only your own properties.");
    }

    const limitRaw = Number(req.query?.limit);
    const city = String(req.query?.city || "").trim();
    const sortOrder = getCreatedAtSortOrder(req.query?.sortOrder || req.query?.sort);
    const filter = { user: requestedUserId };
    if (city) {
      filter["locationDetails.city"] = { $regex: `^${escapeRegex(city)}$`, $options: "i" };
    }
    let query = Property.find(filter).sort({ createdAt: sortOrder });
    if (Number.isFinite(limitRaw) && limitRaw > 0) {
      query = query.limit(Math.min(limitRaw, 1000));
    }

    const properties = await query.lean();
    const list = properties.map(toFullPropertyPayload);
    return sendResponse(res, 200, "Properties fetched successfully", {
      properties: list,
      count: list.length,
    });
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function deleteProperty(req, res) {
  try {
    const propertyId = getPropertyIdFromRequest(req);
    if (!propertyId) {
      return sendResponse(res, 400, "propertyId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return sendResponse(res, 400, "propertyId is invalid");
    }

    const deleted = await Property.findOneAndDelete(getPropertyFilterForUser(req, propertyId)).lean();
    if (!deleted) {
      return sendResponse(res, 404, "Property not found for this user");
    }

    return sendResponse(res, 200, "Property deleted", null);
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}


module.exports = {
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
};
