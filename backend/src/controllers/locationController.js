const City = require("../models/City");
const Locality = require("../models/Locality");
const SubLocality = require("../models/SubLocality");
const Society = require("../models/Society");
const mongoose = require("mongoose");

function sendResponse(res, status, message, data = null) {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data,
  });
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getQueryValue(query = {}, keys = []) {
  for (const key of keys) {
    const value = query?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
}

async function getCities(req, res) {
  try {
    const searchText = getQueryValue(req.query, ["search", "q", "city"]);
    const limitRaw = Number(req.query?.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 20;

    const filter = {};
    if (searchText) {
      filter.name = { $regex: `^${escapeRegex(searchText)}`, $options: "i" };
    }

    const cities = await City.find(filter, { _id: 1, name: 1 }).sort({ name: 1 }).limit(limit).lean();

    const cityList = cities.map((city) => ({
      CityID: String(city._id),
      CityName: city.name,
    }));

    return sendResponse(res, 200, "Cities fetched successfully", cityList);
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function getLocalities(req, res) {
  try {
    const cityId = getQueryValue(req.query, ["cityId", "CityID"]);
    if (!cityId) return sendResponse(res, 400, "CityID is required");
    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return sendResponse(res, 400, "CityID is invalid");
    }
    const searchText = getQueryValue(req.query, ["search", "q", "locality"]);

    const filter = { city: cityId };
    if (searchText) {
      filter.name = { $regex: `^${escapeRegex(searchText)}`, $options: "i" };
    }

    const localities = await Locality.find(filter, { _id: 1, name: 1 })
      .sort({ name: 1 })
      .lean();

    const localityList = localities.map((locality) => ({
      LocalityID: String(locality._id),
      LocalityName: locality.name,
    }));

    return sendResponse(res, 200, "Localities fetched successfully", localityList);
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function getSubLocalities(req, res) {
  try {
    const localityId = getQueryValue(req.query, ["localityId", "LocalityID"]);
    if (!localityId) return sendResponse(res, 400, "LocalityID is required");
    if (!mongoose.Types.ObjectId.isValid(localityId)) {
      return sendResponse(res, 400, "LocalityID is invalid");
    }
    const searchText = getQueryValue(req.query, ["search", "q", "subLocality"]);

    const filter = { locality: localityId };
    if (searchText) {
      filter.name = { $regex: `^${escapeRegex(searchText)}`, $options: "i" };
    }

    const subLocalities = await SubLocality.find(filter, { _id: 1, name: 1 })
      .sort({ name: 1 })
      .lean();

    const subLocalityList = subLocalities.map((subLocality) => ({
      SubLocalityID: String(subLocality._id),
      SubLocalityName: subLocality.name,
    }));

    return sendResponse(res, 200, "Sub-localities fetched successfully", subLocalityList);
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

async function getSocieties(req, res) {
  try {
    const subLocalityId = getQueryValue(req.query, ["subLocalityId", "SubLocalityID"]);
    if (!subLocalityId) return sendResponse(res, 400, "SubLocalityID is required");
    if (!mongoose.Types.ObjectId.isValid(subLocalityId)) {
      return sendResponse(res, 400, "SubLocalityID is invalid");
    }
    const searchText = getQueryValue(req.query, ["search", "q", "society"]);

    const filter = { subLocality: subLocalityId };
    if (searchText) {
      filter.name = { $regex: `^${escapeRegex(searchText)}`, $options: "i" };
    }

    const societies = await Society.find(filter, { _id: 1, name: 1 })
      .sort({ name: 1 })
      .lean();

    const societyList = societies.map((society) => ({
      SocietyID: String(society._id),
      SocietyName: society.name,
    }));

    return sendResponse(res, 200, "Societies fetched successfully", societyList);
  } catch (_error) {
    return sendResponse(res, 500, "Internal server error");
  }
}

module.exports = {
  getCities,
  getLocalities,
  getSubLocalities,
  getSocieties,
};
