import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, Divider, InputBase, Menu, MenuItem, Typography } from "@mui/material";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Navbar from "../components/Navbar";
import { getAuthToken } from "../utils/authStorage";

const OTHER_ROOMS = ["Pooja Room", "Study Room", "Servant Room", "Store Room"];
const FURNISHING_OPTIONS = ["Furnished", "Semi-furnished", "Un-furnished"];
const FURNISHING_ITEMS = ["Light", "Fans", "AC", "TV", "Beds", "Wardrobe", "Geyser", "Sofa", "Washing Machine", "Stove", "Fridge", "Water Purifier", "Microwave", "Modular Kitchen", "Chimney", "Dining Table"];
const FURNISHING_LAYOUT = [
  { name: "Light", type: "counter" },
  { name: "Fans", type: "counter" },
  { name: "AC", type: "counter" },
  { name: "TV", type: "counter" },
  { name: "Beds", type: "counter" },
  { name: "Wardrobe", type: "counter" },
  { name: "Geyser", type: "counter" },
  { name: "Sofa", type: "checkbox" },
  { name: "Washing Machine", type: "checkbox" },
  { name: "Stove", type: "checkbox" },
  { name: "Fridge", type: "checkbox" },
  { name: "Water Purifier", type: "checkbox" },
  { name: "Microwave", type: "checkbox" },
  { name: "Modular Kitchen", type: "checkbox" },
  { name: "Chimney", type: "checkbox" },
  { name: "Dining Table", type: "checkbox" },
];
const AMENITY_OPTIONS = ["Maintenance Staff", "Water Storage", "Security / Fire Alarm", "Visitor Parking", "Vaastu Compliant", "Park", "Intercom Facility", "Lift(s)"];
const PROPERTY_FEATURE_OPTIONS = ["High Ceiling Height", "False Ceiling Lighting", "Piped-gas", "Internet/wi-fi connectivity"];
const PROPERTY_FEATURE_MORE_OPTIONS = ["Centrally Air Conditioned", "Water purifier", "Recently Renovated", "Private Garden / Terrace", "Natural Light", "Airy Rooms", "Spacious Interiors"];
const SOCIETY_FEATURE_OPTIONS = ["Water softening plant", "Shopping Centre", "Fitness Centre / GYM", "Swimming Pool", "Club house", "Security Guard"];
const ADDITIONAL_FEATURE_OPTIONS = ["Separate entry for servant room", "Waste Disposal", "No open drainage around", "Rain Water Harvesting"];
const OVERLOOKING_OPTIONS = ["Pool", "Park", "Club", "Main Road", "Others"];
const POWER_BACKUP_OPTIONS = ["None", "Partial", "Full"];
const PROPERTY_FACING_OPTIONS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const LOCATION_ADVANTAGE_OPTIONS = ["Close to Metro Station", "Close to School", "Close to Hospital", "Close to Market", "Close to Railway Station", "Close to Airport", "Close to Mall", "Close to Highway"];
const FLOORING_OPTIONS = ["Select", "Marble", "Concrete", "Polished concrete", "Granite", "Ceramic"];

function OptionalHeading({ title }) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.45 }}>
      <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>{title}</Typography>
      <Typography sx={{ fontSize: 9, color: "#95a4ba", fontStyle: "italic" }}>(Optional)</Typography>
    </Box>
  );
}

function SelectableChips({ items, selected, setSelected }) {
  const toggle = (item) => setSelected((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  return (
    <Box sx={{ mt: 0.75, display: "flex", gap: 0.65, rowGap: 0.7, flexWrap: "wrap" }}>
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <Chip
            key={item}
            label={active ? `\u2713 ${item}` : `+ ${item}`}
            onClick={() => toggle(item)}
            sx={{
              height: 27,
              fontSize: 10.2,
              bgcolor: active ? "#e7f3ff" : "white",
              color: active ? "#0f73cb" : "#4d6079",
              border: active ? "1px solid #7fc4ff" : "1px solid #cfd7e3",
            }}
          />
        );
      })}
    </Box>
  );
}

export default function PostPropertyAmenitiesDetails() {
  const [otherRooms, setOtherRooms] = useState([]);
  const [furnishingStatus, setFurnishingStatus] = useState("Furnished");
  const [furnishingCounts, setFurnishingCounts] = useState({
    Light: 1,
    Fans: 1,
    AC: 1,
    TV: 0,
    Beds: 0,
    Wardrobe: 0,
    Geyser: 0,
    Sofa: 0,
    "Washing Machine": 0,
    Stove: 0,
    Fridge: 0,
    "Water Purifier": 0,
    Microwave: 0,
    "Modular Kitchen": 0,
    Chimney: 0,
    "Dining Table": 0,
  });
  const [amenities, setAmenities] = useState(["Intercom Facility"]);
  const [propertyFeatures, setPropertyFeatures] = useState([]);
  const [showMorePropertyFeatures, setShowMorePropertyFeatures] = useState(false);
  const [societyFeatures, setSocietyFeatures] = useState(["Fitness Centre / GYM", "Swimming Pool", "Club house"]);
  const [additionalFeatures, setAdditionalFeatures] = useState(["Rain Water Harvesting"]);
  const [overlooking, setOverlooking] = useState([]);
  const [otherCornerProperty, setOtherCornerProperty] = useState(false);
  const [otherInGatedSociety, setOtherInGatedSociety] = useState(false);
  const [powerBackup, setPowerBackup] = useState("None");
  const [propertyFacing, setPropertyFacing] = useState("East");
  const [flooringType, setFlooringType] = useState("");
  const [flooringAnchorEl, setFlooringAnchorEl] = useState(null);
  const [facingRoadWidth, setFacingRoadWidth] = useState("");
  const [facingRoadUnit, setFacingRoadUnit] = useState("Feet");
  const [facingRoadUnitAnchorEl, setFacingRoadUnitAnchorEl] = useState(null);
  const [locationAdvantages, setLocationAdvantages] = useState([]);
  const [coveredParking, setCoveredParking] = useState(0);
  const [openParking, setOpenParking] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrateAmenities = (source) => {
      if (!source || typeof source !== "object") return;
      const details = source?.amenitiesDetails || source?.amenities || source;

      const toArray = (value) => (Array.isArray(value) ? value : []);
      const toText = (value) => String(value ?? "").trim();

      const parking = details?.reservedParking || {};
      const other = details?.otherFeatures || {};
      const widthRoad = details?.widthOfFacingRoad || {};

      const incomingFurnishingCounts =
        details?.furnishingCounts && typeof details.furnishingCounts === "object"
          ? details.furnishingCounts
          : null;
      const incomingFurnishingItems = toArray(details?.furnishingItems);

      if (incomingFurnishingCounts) {
        setFurnishingCounts((prev) => ({ ...prev, ...incomingFurnishingCounts }));
      } else if (incomingFurnishingItems.length > 0) {
        const next = FURNISHING_ITEMS.reduce((acc, item) => ({ ...acc, [item]: 0 }), {});
        incomingFurnishingItems.forEach((name) => {
          const key = toText(name);
          if (key && Object.prototype.hasOwnProperty.call(next, key)) {
            next[key] = Math.max(1, Number(next[key] || 0));
          }
        });
        setFurnishingCounts(next);
      }

      setOtherRooms(toArray(details?.otherRooms));
      setFurnishingStatus(toText(details?.furnishingStatus) || "Furnished");
      setCoveredParking(Number(parking?.covered || 0));
      setOpenParking(Number(parking?.open || 0));
      setAmenities(toArray(details?.amenities));
      setPropertyFeatures(toArray(details?.propertyFeatures));
      setSocietyFeatures(toArray(details?.societyFeatures));
      setAdditionalFeatures(toArray(details?.additionalFeatures));
      setOverlooking(toArray(details?.overlooking));
      setOtherCornerProperty(Boolean(other?.cornerProperty));
      setOtherInGatedSociety(Boolean(other?.inGatedSociety));
      setPowerBackup(toText(details?.powerBackup) || "None");
      setPropertyFacing(toText(details?.propertyFacing) || "East");
      setFlooringType(toText(details?.typeOfFlooring));
      setFacingRoadWidth(
        widthRoad?.value === undefined || widthRoad?.value === null ? "" : String(widthRoad.value)
      );
      setFacingRoadUnit(toText(widthRoad?.unit) || "Feet");
      setLocationAdvantages(toArray(details?.locationAdvantages));
    };

    const load = async () => {
      // Fallback hydrate from local draft first.
      try {
        const raw = localStorage.getItem("postPropertyAmenitiesDetails");
        if (raw) hydrateAmenities(JSON.parse(raw));
      } catch {
        // Ignore malformed saved data.
      }

      const token = getAuthToken();
      const propertyId = String(localStorage.getItem("postPropertyId") || "").trim();
      if (!token || !propertyId) return;

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const paths = [
          `/api/properties/${encodeURIComponent(propertyId)}`,
          `/api/properties/details/${encodeURIComponent(propertyId)}`,
          `/api/properties/property-details/${encodeURIComponent(propertyId)}`,
        ];

        for (const path of paths) {
          const response = await fetch(`${apiBaseUrl}${path}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) continue;
          const payload = result?.data || result?.property || result || {};
          if (!payload || typeof payload !== "object") continue;
          if (!cancelled) hydrateAmenities(payload);
          return;
        }
      } catch {
        // Keep fallback draft values.
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const scorePercent = useMemo(() => {
    let score = 70;
    if (amenities.length >= 3) score += 2;
    if (otherRooms.length >= 1) score += 1;
    return Math.min(score, 75);
  }, [amenities.length, otherRooms.length]);

  const selectedFurnishingItemsCount = useMemo(
    () => Object.values(furnishingCounts).filter((count) => Number(count) > 0).length,
    [furnishingCounts]
  );
  const showFurnishingRequiredError = furnishingStatus === "Furnished" && selectedFurnishingItemsCount < 3;
  const updateFurnishingCount = (item, delta) => {
    setFurnishingCounts((prev) => ({ ...prev, [item]: Math.max(0, Number(prev[item] || 0) + delta) }));
  };

  const handlePostProperty = async () => {
    const token = getAuthToken();
    const propertyId = String(localStorage.getItem("postPropertyId") || "").trim();
    if (!token) {
      setStatus({ type: "error", message: "Login token missing. Please login again." });
      return;
    }
    if (!propertyId) {
      setStatus({ type: "error", message: "Property ID missing. Please complete previous steps first." });
      return;
    }

    const furnishingItems = Object.entries(furnishingCounts)
      .filter(([, count]) => Number(count) > 0)
      .map(([name]) => name);

    try {
      setIsSaving(true);
      setStatus({ type: "", message: "" });
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/properties/amenities-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId,
          completionPercent: scorePercent,
          otherRooms,
          furnishingStatus,
          furnishingItems,
          reservedParking: {
            covered: coveredParking,
            open: openParking,
          },
          amenities,
          propertyFeatures,
          societyFeatures,
          additionalFeatures,
          overlooking,
          otherFeatures: {
            cornerProperty: otherCornerProperty,
            inGatedSociety: otherInGatedSociety,
          },
          powerBackup,
          propertyFacing,
          typeOfFlooring: flooringType,
          widthOfFacingRoad: {
            value: facingRoadWidth ? Number(facingRoadWidth) : undefined,
            unit: facingRoadUnit,
          },
          locationAdvantages,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus({ type: "error", message: result?.message || "Unable to save amenities details." });
        return;
      }

      localStorage.setItem(
        "postPropertyAmenitiesDetails",
        JSON.stringify({
          otherRooms,
          furnishingStatus,
          furnishingCounts,
          reservedParking: {
            covered: coveredParking,
            open: openParking,
          },
          amenities,
          propertyFeatures,
          societyFeatures,
          additionalFeatures,
          overlooking,
          otherFeatures: {
            cornerProperty: otherCornerProperty,
            inGatedSociety: otherInGatedSociety,
          },
          powerBackup,
          propertyFacing,
          typeOfFlooring: flooringType,
          widthOfFacingRoad: {
            value: facingRoadWidth ? Number(facingRoadWidth) : undefined,
            unit: facingRoadUnit,
          },
          locationAdvantages,
        })
      );
      setStatus({ type: "success", message: "Property posted successfully." });
      window.setTimeout(() => {
        window.location.href = propertyId
          ? `/post-property/thank-you?propertyId=${encodeURIComponent(propertyId)}`
          : "/post-property/thank-you";
      }, 250);
    } catch {
      setStatus({ type: "error", message: "Unable to connect to server." });
    } finally {
      setIsSaving(false);
    }
  };

  const stepItems = [
    { title: "Basic Details", subtitle: "Flat/Apartment For Sale", href: "/post-property" },
    { title: "Location Details", subtitle: "Yuva Sunrise, Attibele, Ban..." , href: "/post-property-location-details" },
    { title: "Property Profile", subtitle: "1 bedrooms, 300 sq.ft. Carp...", href: "/post-property-profile-details" },
    { title: "Photos, Videos & Voice-over", subtitle: "You might get low responses...", href: "/post-property-media-details" },
    { title: "Amenities section", subtitle: "Additional details", active: true },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f7", fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif' }}>
      <Navbar sticky />

      <Box sx={{ mt: { xs: "56px", md: "54px" }, maxWidth: 968, mx: "auto", minHeight: "calc(100vh - 56px)", display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr 255px" }, gap: 0 }}>
        <Box sx={{ px: { xs: 2, md: 0 }, pt: { xs: 2.5, md: 2.9 }, position: { md: "sticky" }, top: { md: 70 }, alignSelf: { md: "start" } }}>
          <Box sx={{ bgcolor: "#eceef3", border: "1px solid #e0e4ec", borderRadius: "10px", overflow: "hidden" }}>
            {stepItems.map((item, index, all) => (
              <Box
                key={item.title}
                onClick={() => item.href && (window.location.href = item.href)}
                sx={{
                  px: 1.9,
                  py: 1.15,
                  borderBottom: index === all.length - 1 ? "none" : "1px solid #dfe4ec",
                  bgcolor: item.active ? "#dfe1e7" : "transparent",
                  position: "relative",
                  cursor: item.href ? "pointer" : "default",
                }}
              >
                {item.active && <Box sx={{ position: "absolute", left: 0, top: 12, width: 3, height: 24, bgcolor: "#123f78", borderRadius: "0 2px 2px 0" }} />}
                <Typography sx={{ fontSize: 9.9, color: "#102445", lineHeight: 1.2, fontWeight: 700 }}>{item.title}</Typography>
                <Typography sx={{ fontSize: 9.2, color: "#7f90a7", mt: 0.2, lineHeight: 1.2 }}>{item.subtitle}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 1.8, bgcolor: "#eceef3", border: "1px solid #e0e4ec", borderRadius: "10px", px: 2.1, py: 2.1, display: "flex", alignItems: "center", gap: 1.6 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: "50%", background: `conic-gradient(#28b14a ${scorePercent * 3.6}deg, #cfd4dc 0deg)`, p: "3px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box sx={{ width: "100%", height: "100%", borderRadius: "50%", bgcolor: "#eceef3", display: "flex", alignItems: "center", justifyContent: "center", color: "#102445", fontSize: 10, fontWeight: 700 }}>
                {scorePercent}%
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#102445", lineHeight: 1.2 }}>Property Score</Typography>
              <Typography sx={{ fontSize: 10.5, color: "#7f90a7", lineHeight: 1.3, mt: 0.2 }}>
                Better your property score,
                <br />
                greater your visibility
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ bgcolor: "white", borderLeft: { md: "1px solid #e4e7ed" }, borderRight: { md: "1px solid #e4e7ed" }, px: { xs: 2, md: 2.4 }, pt: { xs: 2.5, md: 2.9 }, pb: 3 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.2, color: "#6f7f98", fontSize: 10.5, cursor: "pointer" }} onClick={() => { window.location.href = "/post-property-media-details"; }}>
            <KeyboardArrowLeftRoundedIcon sx={{ fontSize: 17 }} />
            Back
          </Box>

          <Box sx={{ maxWidth: 392 }}>
            <Box sx={{ mt: 1.0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
              <Box>
                <Typography sx={{ fontSize: 16.5, fontWeight: 700, color: "#102445", lineHeight: 1.2 }}>Add amenities/unique features</Typography>
                <Typography sx={{ mt: 0.28, fontSize: 10, color: "#90a1b7", lineHeight: 1.45 }}>These fields are used to populate USP & captions</Typography>
                <Typography sx={{ fontSize: 10, color: "#90a1b7", lineHeight: 1.45 }}>All fields on this page are optional</Typography>
              </Box>
              <Typography sx={{ fontSize: 11, color: "#0f73cb", cursor: "pointer", whiteSpace: "nowrap", mt: 0.25 }}>Close X</Typography>
            </Box>

            <Box sx={{ mt: 3.0 }}>
              <OptionalHeading title="Other rooms" />
              <SelectableChips items={OTHER_ROOMS} selected={otherRooms} setSelected={setOtherRooms} />
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <OptionalHeading title="Furnishing" />
              {showFurnishingRequiredError && (
                <Typography sx={{ mt: 0.45, mb: 0.2, fontSize: 10, color: "#d93025" }}>
                  Please select at least 3 furnishing items for a furnished property
                </Typography>
              )}
              <Box sx={{ mt: 0.75, display: "flex", gap: 0.65, flexWrap: "wrap" }}>
                {FURNISHING_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    onClick={() => setFurnishingStatus(opt)}
                    sx={{
                      height: 27,
                      fontSize: 10.2,
                      bgcolor: furnishingStatus === opt ? "#e7f3ff" : "white",
                      color: furnishingStatus === opt ? "#0f73cb" : "#4d6079",
                      border: "1px solid #cfd7e3",
                    }}
                  />
                ))}
              </Box>
              {furnishingStatus !== "Un-furnished" && (
                <Box sx={{ mt: 0.8, border: "1px solid #d8deea", borderRadius: "8px", p: 0.95 }}>
                  <Typography sx={{ fontSize: 9.8, color: showFurnishingRequiredError ? "#d93025" : "#90a1b7", mb: 0.65 }}>
                    At least three furnishings are mandatory for furnished
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 2.0, rowGap: 0.9 }}>
                    {FURNISHING_LAYOUT.map(({ name, type }) => (
                      <Box key={name} sx={{ display: "flex", alignItems: "center", gap: 0.55, minHeight: 20 }}>
                        {type === "counter" ? (
                          <>
                            <Box onClick={() => updateFurnishingCount(name, -1)} sx={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid #c7d1df", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10, color: "#7a8da8", lineHeight: 1 }}>
                              -
                            </Box>
                            <Typography sx={{ fontSize: 10, minWidth: 9, textAlign: "center", color: "#4d6079" }}>{furnishingCounts[name] || 0}</Typography>
                            <Box onClick={() => updateFurnishingCount(name, 1)} sx={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid #c7d1df", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10, color: "#7a8da8", lineHeight: 1 }}>
                              +
                            </Box>
                            <Typography sx={{ fontSize: 10.2, color: "#243c5a" }}>{name}</Typography>
                          </>
                        ) : (
                          <>
                            <Box
                              onClick={() =>
                                setFurnishingCounts((prev) => ({
                                  ...prev,
                                  [name]: Number(prev[name] || 0) > 0 ? 0 : 1,
                                }))
                              }
                              sx={{
                                width: 12,
                                height: 12,
                                border: "1px solid #7e94b0",
                                cursor: "pointer",
                                bgcolor: Number(furnishingCounts[name] || 0) > 0 ? "#0f73cb" : "white",
                                color: "white",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 9,
                                lineHeight: 1,
                                fontWeight: 700,
                              }}
                            >
                              {Number(furnishingCounts[name] || 0) > 0 ? "✓" : ""}
                            </Box>
                            <Typography sx={{ fontSize: 10.2, color: "#243c5a" }}>{name}</Typography>
                          </>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <OptionalHeading title="Reserved Parking" />
              <Box sx={{ mt: 0.9, display: "flex", alignItems: "center", gap: 2.7, flexWrap: "wrap" }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.55 }}>
                  <Typography sx={{ fontSize: 10.2, color: "#243c5a", minWidth: 76 }}>Covered Parking</Typography>
                  <Chip label="-" onClick={() => setCoveredParking((v) => Math.max(0, v - 1))} sx={{ width: 24, height: 24, border: "1px solid #cfd7e3", bgcolor: "white", fontSize: 13 }} />
                  <Typography sx={{ width: 10, textAlign: "center", fontSize: 10.2, color: "#4d6079" }}>{coveredParking}</Typography>
                  <Chip label="+" onClick={() => setCoveredParking((v) => v + 1)} sx={{ width: 24, height: 24, border: "1px solid #cfd7e3", bgcolor: "white", fontSize: 13 }} />
                </Box>

                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.55 }}>
                  <Typography sx={{ fontSize: 10.2, color: "#243c5a", minWidth: 64 }}>Open Parking</Typography>
                  <Chip label="-" onClick={() => setOpenParking((v) => Math.max(0, v - 1))} sx={{ width: 24, height: 24, border: "1px solid #cfd7e3", bgcolor: "white", fontSize: 13 }} />
                  <Typography sx={{ width: 10, textAlign: "center", fontSize: 10.2, color: "#4d6079" }}>{openParking}</Typography>
                  <Chip label="+" onClick={() => setOpenParking((v) => v + 1)} sx={{ width: 24, height: 24, border: "1px solid #cfd7e3", bgcolor: "white", fontSize: 13 }} />
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Amenities</Typography>
              <SelectableChips items={AMENITY_OPTIONS} selected={amenities} setSelected={setAmenities} />
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Property Features</Typography>
              <SelectableChips
                items={showMorePropertyFeatures ? [...PROPERTY_FEATURE_OPTIONS, ...PROPERTY_FEATURE_MORE_OPTIONS] : PROPERTY_FEATURE_OPTIONS}
                selected={propertyFeatures}
                setSelected={setPropertyFeatures}
              />
              <Typography
                onClick={() => setShowMorePropertyFeatures((prev) => !prev)}
                sx={{ mt: 0.35, fontSize: 10, color: "#0f73cb", cursor: "pointer", fontWeight: 700 }}
              >
                {showMorePropertyFeatures ? "Show less ⌃" : "7 more ⌄"}
              </Typography>
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Society/Building feature</Typography>
              <SelectableChips items={SOCIETY_FEATURE_OPTIONS} selected={societyFeatures} setSelected={setSocietyFeatures} />
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Additional Features</Typography>
              <SelectableChips items={ADDITIONAL_FEATURE_OPTIONS} selected={additionalFeatures} setSelected={setAdditionalFeatures} />
              <Typography sx={{ mt: 0.35, fontSize: 10, color: "#0f73cb", cursor: "pointer", fontWeight: 700 }}>2 more ⌄</Typography>
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Overlooking</Typography>
              <SelectableChips items={OVERLOOKING_OPTIONS} selected={overlooking} setSelected={setOverlooking} />
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Other Features</Typography>
              <Box sx={{ mt: 0.7, display: "grid", rowGap: 0.55 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.55 }}>
                  <input type="checkbox" checked={otherCornerProperty} onChange={(e) => setOtherCornerProperty(e.target.checked)} />
                  <Typography sx={{ fontSize: 10.2, color: "#4d6079" }}>Corner Property</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.55 }}>
                  <input type="checkbox" checked={otherInGatedSociety} onChange={(e) => setOtherInGatedSociety(e.target.checked)} />
                  <Typography sx={{ fontSize: 10.2, color: "#4d6079" }}>In a gated society</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Power Back up</Typography>
              <Box sx={{ mt: 0.75, display: "flex", gap: 0.65, flexWrap: "wrap" }}>
                {POWER_BACKUP_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    onClick={() => setPowerBackup(opt)}
                    sx={{
                      height: 27,
                      fontSize: 10.2,
                      bgcolor: powerBackup === opt ? "#e7f3ff" : "white",
                      color: powerBackup === opt ? "#0f73cb" : "#4d6079",
                      border: "1px solid #cfd7e3",
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Property facing</Typography>
              <Box sx={{ mt: 0.75, display: "flex", gap: 0.65, rowGap: 0.7, flexWrap: "wrap" }}>
                {PROPERTY_FACING_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    onClick={() => setPropertyFacing(opt)}
                    sx={{
                      height: 27,
                      fontSize: 10.2,
                      bgcolor: propertyFacing === opt ? "#e7f3ff" : "white",
                      color: propertyFacing === opt ? "#0f73cb" : "#4d6079",
                      border: "1px solid #cfd7e3",
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Type of flooring</Typography>
              <Box
                onClick={(event) => setFlooringAnchorEl(event.currentTarget)}
                sx={{ mt: 0.75, width: 170, border: "1px solid #d8deea", bgcolor: "white", px: 0.8, py: 0.55, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
              >
                <InputBase value={flooringType || "Select"} readOnly sx={{ fontSize: 10.5, width: "100%", cursor: "pointer" }} />
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14, color: "#243c5a" }} />
              </Box>
              <Menu
                anchorEl={flooringAnchorEl}
                open={Boolean(flooringAnchorEl)}
                onClose={() => setFlooringAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{ sx: { mt: 0.2, minWidth: 170, borderRadius: 0, maxHeight: 220 } }}
              >
                {FLOORING_OPTIONS.map((opt) => (
                  <MenuItem
                    key={opt}
                    onClick={() => {
                      setFlooringType(opt === "Select" ? "" : opt);
                      setFlooringAnchorEl(null);
                    }}
                    sx={{ fontSize: 12, color: "#243c5a", bgcolor: (flooringType || "Select") === opt ? "#eff6ff" : "white" }}
                  >
                    {opt}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Width of facing road</Typography>
              <Box sx={{ mt: 0.75, width: 170, border: "1px solid #d8deea", bgcolor: "white", px: 0.8, py: 0.55, display: "grid", gridTemplateColumns: "1fr 52px", alignItems: "center" }}>
                <InputBase value={facingRoadWidth} onChange={(e) => setFacingRoadWidth(e.target.value.replace(/[^\d]/g, ""))} placeholder="Enter the width" sx={{ fontSize: 10.5, width: "100%" }} />
                <Box
                  onClick={(event) => setFacingRoadUnitAnchorEl(event.currentTarget)}
                  sx={{ borderLeft: "1px solid #d8deea", pl: 0.65, display: "flex", alignItems: "center", justifyContent: "space-between", color: "#4d6079", fontSize: 10, cursor: "pointer" }}
                >
                  {facingRoadUnit}
                  <KeyboardArrowDownRoundedIcon sx={{ fontSize: 13 }} />
                </Box>
              </Box>
              <Menu
                anchorEl={facingRoadUnitAnchorEl}
                open={Boolean(facingRoadUnitAnchorEl)}
                onClose={() => setFacingRoadUnitAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{ sx: { mt: 0.2, minWidth: 78, borderRadius: 0 } }}
              >
                {["Select", "Feet", "Meter"].map((opt) => (
                  <MenuItem
                    key={opt}
                    onClick={() => {
                      setFacingRoadUnit(opt);
                      setFacingRoadUnitAnchorEl(null);
                    }}
                    sx={{ fontSize: 12, color: "#243c5a", bgcolor: facingRoadUnit === opt ? "#eff6ff" : "white" }}
                  >
                    {opt}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box sx={{ mt: 3.1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Location Advantages</Typography>
              <Typography sx={{ mt: 0.2, fontSize: 9.2, color: "#95a4ba" }}>Highlight the nearby landmarks*</Typography>
              <Box sx={{ mt: 0.95, display: "flex", gap: 0.75, rowGap: 0.78, flexWrap: "wrap" }}>
                {LOCATION_ADVANTAGE_OPTIONS.map((item) => {
                  const active = locationAdvantages.includes(item);
                  return (
                    <Chip
                      key={item}
                      label={active ? `\u2713 ${item}` : `+ ${item}`}
                      onClick={() =>
                        setLocationAdvantages((prev) =>
                          prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
                        )
                      }
                      sx={{
                        height: 28,
                        fontSize: 10.2,
                        bgcolor: active ? "#e7f3ff" : "white",
                        color: active ? "#0f73cb" : "#4d6079",
                        border: active ? "1px solid #7fc4ff" : "1px solid #cfd7e3",
                      }}
                    />
                  );
                })}
              </Box>
              <Typography sx={{ mt: 0.7, fontSize: 8.9, color: "#95a4ba", lineHeight: 1.35 }}>*Please provide correct information, otherwise your listing might get blocked</Typography>
            </Box>

            <Box sx={{ mt: 1.15, bgcolor: "#e9f3ff", border: "1px solid #d2e6ff", borderRadius: "2px", px: 0.9, py: 0.75 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 13, color: "#0f73cb", mt: 0.1 }} />
                <Typography sx={{ fontSize: 9.6, color: "#1f4369", lineHeight: 1.35 }}>
                  You can change your Top USP&apos;s from here
                  <br />
                  Or see your current top USP&apos;s click here
                </Typography>
              </Box>
            </Box>

            {status.message && (
              <Alert severity={status.type || "info"} sx={{ mt: 1.0, py: 0.2, "& .MuiAlert-message": { fontSize: 12 } }}>
                {status.message}
              </Alert>
            )}

            <Button onClick={handlePostProperty} disabled={isSaving} variant="contained" sx={{ mt: 1.8, minWidth: 104, height: 34, textTransform: "none", fontWeight: 700, fontSize: 12, bgcolor: "#0f73cb", borderRadius: "4px", boxShadow: "none", px: 2.2, "&:hover": { bgcolor: "#0c66b4", boxShadow: "none" } }}>
              {isSaving ? "Posting..." : "Post Property"}
            </Button>
          </Box>
        </Box>

        <Box sx={{ bgcolor: "#eaecf1", px: 1.45, pt: 1.95, pb: 1.8, display: "flex", flexDirection: "column", position: { md: "sticky" }, top: { md: 70 }, height: { md: "calc(100vh - 70px)" }, justifyContent: { md: "space-between" }, alignSelf: { md: "start" } }}>
          <Box sx={{ mt: 0.2, textAlign: "center" }}>
            <Box component="img" src="https://www.99acres.com/ppf-static/media/Photos.a374d44a.png" alt="tips" sx={{ width: 96, height: "auto", mx: "auto", display: "block" }} />
            <Typography sx={{ mt: 0.6, fontSize: 10.4, color: "#556b86", fontWeight: 700 }}>These can be the features that bring best highlights and impact to your property.</Typography>
          </Box>

          <Box sx={{ bgcolor: "#eceef3", border: "1px solid #dde2ea", borderRadius: "3px", px: 1.2, py: 1.05 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.45, color: "#7386a0" }}>
              <LocalPhoneOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: 12.5 }}>Need help ?</Typography>
            </Box>
            <Divider sx={{ my: 0.55, borderColor: "#dce2eb" }} />
            <Typography sx={{ fontSize: 10.5, color: "#6c7f98", lineHeight: 1.45 }}>
              You can email us at{" "}
              <Box component="span" sx={{ color: "#0f73cb" }}>
                services@99acres.com
              </Box>
              <br />
              or call us at{" "}
              <Box component="span" sx={{ color: "#0f73cb", fontWeight: 700 }}>
                1800 41 99099
              </Box>{" "}
              (IND Toll-Free).
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
