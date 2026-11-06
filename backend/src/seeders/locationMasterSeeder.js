const City = require("../models/City");
const Locality = require("../models/Locality");
const SubLocality = require("../models/SubLocality");
const Society = require("../models/Society");
const locationMasterData = require("../data/locationMasterData");

function toKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

async function seedLocationMaster({ force = false, log = true } = {}) {
  const [cityCount, localityCount, subLocalityCount, societyCount] = await Promise.all([
    City.countDocuments(),
    Locality.countDocuments(),
    SubLocality.countDocuments(),
    Society.countDocuments(),
  ]);

  const allCollectionsHaveData =
    cityCount > 0 && localityCount > 0 && subLocalityCount > 0 && societyCount > 0;

  if (allCollectionsHaveData && !force) {
    if (log) {
      console.log("Location master seed skipped: all location master collections already have data.");
    }
    return { skipped: true, cityCount, localityCount, subLocalityCount, societyCount };
  }

  let insertedCities = 0;
  let insertedLocalities = 0;
  let insertedSubLocalities = 0;
  let insertedSocieties = 0;

  for (const cityData of locationMasterData) {
    const cityName = String(cityData?.city || "").trim();
    if (!cityName) continue;

    const cityKey = toKey(cityName);
    const existingCity = await City.findOne({ key: cityKey }).select("_id").lean();

    let cityId;
    if (existingCity) {
      cityId = existingCity._id;
    } else {
      const createdCity = await City.create({ name: cityName, key: cityKey });
      cityId = createdCity._id;
      insertedCities += 1;
    }

    const localities = Array.isArray(cityData?.localities) ? cityData.localities : [];
    for (const localityData of localities) {
      const localityName = String(localityData?.name || "").trim();
      if (!localityName) continue;

      const localityKey = toKey(localityName);
      const existingLocality = await Locality.findOne({ city: cityId, key: localityKey })
        .select("_id")
        .lean();

      let localityId;
      if (existingLocality) {
        localityId = existingLocality._id;
      } else {
        const createdLocality = await Locality.create({
          city: cityId,
          name: localityName,
          key: localityKey,
        });
        localityId = createdLocality._id;
        insertedLocalities += 1;
      }

      const subLocalities = Array.isArray(localityData?.subLocalities) ? localityData.subLocalities : [];
      for (const subLocalityData of subLocalities) {
        const subLocalityName = String(subLocalityData?.name || "").trim();
        if (!subLocalityName) continue;

        const subLocalityKey = toKey(subLocalityName);
        const existingSubLocality = await SubLocality.findOne({
          locality: localityId,
          key: subLocalityKey,
        })
          .select("_id")
          .lean();

        let subLocalityId;
        if (existingSubLocality) {
          subLocalityId = existingSubLocality._id;
        } else {
          const createdSubLocality = await SubLocality.create({
            locality: localityId,
            name: subLocalityName,
            key: subLocalityKey,
          });
          subLocalityId = createdSubLocality._id;
          insertedSubLocalities += 1;
        }

        const societies = Array.isArray(subLocalityData?.societies) ? subLocalityData.societies : [];
        for (const societyNameRaw of societies) {
          const societyName = String(societyNameRaw || "").trim();
          if (!societyName) continue;

          const societyKey = toKey(societyName);
          const existingSociety = await Society.findOne({
            subLocality: subLocalityId,
            key: societyKey,
          })
            .select("_id")
            .lean();

          if (existingSociety) continue;

          await Society.create({
            subLocality: subLocalityId,
            name: societyName,
            key: societyKey,
          });
          insertedSocieties += 1;
        }
      }
    }
  }

  if (log) {
    console.log(
      `Location master seeded: cities=${insertedCities}, localities=${insertedLocalities}, subLocalities=${insertedSubLocalities}, societies=${insertedSocieties}`
    );
  }

  return {
    skipped: false,
    insertedCities,
    insertedLocalities,
    insertedSubLocalities,
    insertedSocieties,
  };
}

module.exports = { seedLocationMaster };
