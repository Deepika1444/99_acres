import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  InputBase,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Navbar from "../components/Navbar";
import { getAuthToken } from "../utils/authStorage";

const FLOOR_PLAN_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='120' viewBox='0 0 180 120'%3E%3Crect width='180' height='120' fill='%23f6f8fc'/%3E%3Crect x='8' y='8' width='164' height='104' rx='4' fill='%23ffffff' stroke='%23d8e1ee'/%3E%3Crect x='16' y='16' width='56' height='40' fill='%23eef3fb' stroke='%23c6d5eb'/%3E%3Crect x='78' y='16' width='40' height='24' fill='%23eef3fb' stroke='%23c6d5eb'/%3E%3Crect x='122' y='16' width='42' height='40' fill='%23eef3fb' stroke='%23c6d5eb'/%3E%3Crect x='16' y='60' width='70' height='44' fill='%23eef3fb' stroke='%23c6d5eb'/%3E%3Crect x='90' y='60' width='74' height='20' fill='%23eef3fb' stroke='%23c6d5eb'/%3E%3Crect x='90' y='84' width='74' height='20' fill='%23eef3fb' stroke='%23c6d5eb'/%3E%3Cpath d='M74 36h8M116 28h6M82 80h8' stroke='%23819abb' stroke-width='2'/%3E%3C/svg%3E";
const FLOOR_PLAN_FALLBACK_IMAGE = "/vite.svg";
const DEFAULT_AREA_UNITS = ["sq.ft.", "sq.yards", "sq.m.", "acres", "marla", "cents"];
const floorPlansCache = new Map();
let areaUnitsCache = null;
const DEFAULT_FLOOR_PLANS = {
  "2 BHK": [
    { apartmentType: "2 BHK", superBuiltUpArea: 1300, bathrooms: 2, balconies: 2, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
    { apartmentType: "2 BHK", superBuiltUpArea: 1285, bathrooms: 2, balconies: 2, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
    { apartmentType: "2 BHK", superBuiltUpArea: 1320, bathrooms: 2, balconies: 2, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
    { apartmentType: "2 BHK", superBuiltUpArea: 1260, bathrooms: 2, balconies: 1, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
    { apartmentType: "2 BHK", superBuiltUpArea: 1345, bathrooms: 2, balconies: 2, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
    { apartmentType: "2 BHK", superBuiltUpArea: 1375, bathrooms: 2, balconies: 3, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
  ],
  "3 BHK": [
    { apartmentType: "3 BHK", superBuiltUpArea: 1850, bathrooms: 3, balconies: 2, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
    { apartmentType: "3 BHK", superBuiltUpArea: 1725, bathrooms: 3, balconies: 3, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
    { apartmentType: "3 BHK", superBuiltUpArea: 1780, bathrooms: 3, balconies: 2, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
    { apartmentType: "3 BHK", superBuiltUpArea: 1815, bathrooms: 3, balconies: 3, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
    { apartmentType: "3 BHK", superBuiltUpArea: 1880, bathrooms: 3, balconies: 3, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
    { apartmentType: "3 BHK", superBuiltUpArea: 1925, bathrooms: 4, balconies: 3, availability: "Ready To Move", image: FLOOR_PLAN_IMAGE },
  ],
};
const AREA_TYPES = ["Carpet Area", "Built-up Area", "Super Built-up Area"];
const FURNISHING_LEVELS = ["Furnished", "Semi-furnished", "Un-furnished"];
const FURNISHING_ITEMS = [
  "Light",
  "Fans",
  "AC",
  "TV",
  "Beds",
  "Wardrobe",
  "Geyser",
  "Sofa",
  "Washing Machine",
  "Stove",
  "Fridge",
  "Water Purifier",
  "Microwave",
  "Modular Kitchen",
  "Chimney",
  "Dining Table",
];
const FLOOR_OPTIONS = ["Basement", "Lower Ground", "Ground", "1", "2", "3"];
const AGE_OPTIONS = ["0-1 years", "1-5 years", "5-10 years", "10+ years"];
const AVAILABILITY_OPTIONS = ["Ready to move", "Under construction"];
const POSSESSION_BY_OPTIONS = ["Within 3 months", "Within 6 months", "Within 1 year", "More than 1 year"];
const OWNERSHIP_OPTIONS = ["Freehold", "Leasehold", "Co-operative society", "Power of Attorney"];
const TENANT_OPTIONS = ["Family", "Single men", "Single women"];
const AGREEMENT_OPTIONS = ["Company lease agreement", "Any"];

export default function PostPropertyProfileDetails() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  const [locationSummary, setLocationSummary] = useState("DLF Westend Heights, Akshay...");
  const [apartmentType, setApartmentType] = useState("2 BHK");
  const [configuration, setConfiguration] = useState("2 BHK");
  const [builtUpArea, setBuiltUpArea] = useState("1300");
  const [carpetArea, setCarpetArea] = useState("400");
  const [builtUpDetailArea, setBuiltUpDetailArea] = useState("");
  const [showBuiltUpArea, setShowBuiltUpArea] = useState(false);
  const [showSuperBuiltUpArea, setShowSuperBuiltUpArea] = useState(false);
  const [areaUnits, setAreaUnits] = useState(DEFAULT_AREA_UNITS);
  const [carpetAreaUnit, setCarpetAreaUnit] = useState("sq.ft.");
  const [builtUpDetailUnit, setBuiltUpDetailUnit] = useState("sq.ft.");
  const [builtUpAreaUnit, setBuiltUpAreaUnit] = useState("sq.ft.");
  const [carpetUnitAnchorEl, setCarpetUnitAnchorEl] = useState(null);
  const [builtUpDetailUnitAnchorEl, setBuiltUpDetailUnitAnchorEl] = useState(null);
  const [builtUpUnitAnchorEl, setBuiltUpUnitAnchorEl] = useState(null);

  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [balconies, setBalconies] = useState(1);
  const [bedroomsCustomValue, setBedroomsCustomValue] = useState("");
  const [bathroomsCustomValue, setBathroomsCustomValue] = useState("");
  const [bedroomsCustomInput, setBedroomsCustomInput] = useState("");
  const [bathroomsCustomInput, setBathroomsCustomInput] = useState("");
  const [showBedroomsCustomInput, setShowBedroomsCustomInput] = useState(false);
  const [showBathroomsCustomInput, setShowBathroomsCustomInput] = useState(false);
  const [furnishingStatus, setFurnishingStatus] = useState("Furnished");
  const [propertyFloorAnchorEl, setPropertyFloorAnchorEl] = useState(null);
  const [furnishingCounts, setFurnishingCounts] = useState({
    Light: 1,
    Fans: 1,
    AC: 2,
    TV: 1,
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

  const [totalFloors, setTotalFloors] = useState("3");
  const [propertyOnFloor, setPropertyOnFloor] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("Ready to move");
  const [ageOfProperty, setAgeOfProperty] = useState("10+ years");
  const [possessionBy, setPossessionBy] = useState("");
  const [ownershipType, setOwnershipType] = useState("Co-operative society");
  const [possessionByAnchorEl, setPossessionByAnchorEl] = useState(null);
  const [availableFrom, setAvailableFrom] = useState(new Date().toISOString().slice(0, 10));
  const [willingToRentTo, setWillingToRentTo] = useState(["Family"]);
  const [expectedRent, setExpectedRent] = useState("26000");
  const [electricityExcluded, setElectricityExcluded] = useState(true);
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [agreementType, setAgreementType] = useState("Any");
  const [brokersOk, setBrokersOk] = useState("Yes");
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [planSlideIndex, setPlanSlideIndex] = useState(0);
  const [floorPlans, setFloorPlans] = useState(DEFAULT_FLOOR_PLANS["2 BHK"]);
  const [isFloorPlanLoading, setIsFloorPlanLoading] = useState(false);
  const [showFloorPlanCards, setShowFloorPlanCards] = useState(true);
  const lastFloorPlanKeyRef = useRef("");
  const hasLoadedAreaUnitsRef = useRef(false);

  useEffect(() => {
    try {
      const rawLocation = localStorage.getItem("postPropertyLocationDetails");
      const rawBasic = localStorage.getItem("postPropertyBasicDetails");
      const locationSaved = rawLocation ? JSON.parse(rawLocation) : {};
      const basicSaved = rawBasic ? JSON.parse(rawBasic) : {};

      const subLocality = String(locationSaved?.subLocality || "").trim();
      const locality = String(locationSaved?.locality || "").trim();
      const city = String(locationSaved?.city || "").trim();
      const summary = [subLocality, locality, city].filter(Boolean).join(", ");
      if (summary) {
        const compact = summary.length > 28 ? `${summary.slice(0, 25)}...` : summary;
        setLocationSummary(compact);
      }

      const subtype = String(basicSaved?.propertySubType || "").trim();
      if (subtype === "flat_apartment" || subtype === "studio_apartment") {
        setApartmentType("2 BHK");
      }
    } catch {
      // Ignore malformed draft data.
    }
  }, []);

  useEffect(() => {
    if (hasLoadedAreaUnitsRef.current) return;
    hasLoadedAreaUnitsRef.current = true;

    if (Array.isArray(areaUnitsCache) && areaUnitsCache.length > 0) {
      setAreaUnits(areaUnitsCache);
      if (!areaUnitsCache.includes(carpetAreaUnit)) setCarpetAreaUnit(areaUnitsCache[0]);
      if (!areaUnitsCache.includes(builtUpDetailUnit)) setBuiltUpDetailUnit(areaUnitsCache[0]);
      if (!areaUnitsCache.includes(builtUpAreaUnit)) setBuiltUpAreaUnit(areaUnitsCache[0]);
      return;
    }

    let cancelled = false;
    const loadAreaUnits = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const token = getAuthToken();
        const response = await fetch(`${apiBaseUrl}/api/properties/area-units`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const result = await response.json().catch(() => ({}));
        const units = Array.isArray(result?.data?.units) ? result.data.units : [];
        const labels = units.map((item) => String(item?.label || "").trim()).filter(Boolean);
        if (cancelled) return;
        if (labels.length > 0) {
          areaUnitsCache = labels;
          setAreaUnits(labels);
          if (!labels.includes(carpetAreaUnit)) setCarpetAreaUnit(labels[0]);
          if (!labels.includes(builtUpDetailUnit)) setBuiltUpDetailUnit(labels[0]);
          if (!labels.includes(builtUpAreaUnit)) setBuiltUpAreaUnit(labels[0]);
        }
      } catch {
        if (!cancelled) setAreaUnits(DEFAULT_AREA_UNITS);
      }
    };

    loadAreaUnits();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedFurnishingItems = useMemo(() => {
    return Object.entries(furnishingCounts)
      .filter(([, count]) => Number(count) > 0)
      .map(([name]) => name);
  }, [furnishingCounts]);
  const showFurnishingRequiredError = furnishingStatus === "Furnished" && selectedFurnishingItems.length < 3;

  const propertyScorePercent = useMemo(() => {
    let score = 55;
    if (carpetArea) score += 2;
    if (selectedFurnishingItems.length >= 3) score += 3;
    if (expectedRent) score += 2;
    return Math.min(score, 65);
  }, [carpetArea, selectedFurnishingItems.length, expectedRent]);

  useEffect(() => {
    if (apartmentType === "Other") {
      setFloorPlans([]);
      setShowFloorPlanCards(false);
      return;
    }
    setShowFloorPlanCards(true);

    let cancelled = false;

    const loadFloorPlans = async () => {
      try {
        setIsFloorPlanLoading(true);
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const token = getAuthToken();
        const params = new URLSearchParams();
        params.set("apartmentType", apartmentType);
        try {
          const rawLocation = localStorage.getItem("postPropertyLocationDetails");
          const locationSaved = rawLocation ? JSON.parse(rawLocation) : {};
          const city = String(locationSaved?.city || "").trim();
          const locality = String(locationSaved?.locality || "").trim();
          const apartmentSociety = String(locationSaved?.apartmentSociety || "").trim();
          if (city) params.set("city", city);
          if (locality) params.set("locality", locality);
          if (apartmentSociety) params.set("apartmentSociety", apartmentSociety);
        } catch {
          // Ignore malformed draft data.
        }
        const requestKey = params.toString();

        if (lastFloorPlanKeyRef.current === requestKey) {
          setIsFloorPlanLoading(false);
          return;
        }
        lastFloorPlanKeyRef.current = requestKey;

        if (floorPlansCache.has(requestKey)) {
          const cachedPlans = floorPlansCache.get(requestKey);
          if (!cancelled) {
            setFloorPlans(cachedPlans);
            setIsFloorPlanLoading(false);
          }
          return;
        }

        const response = await fetch(`${apiBaseUrl}/api/properties/floor-plans?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const result = await response.json().catch(() => ({}));
        const plans = Array.isArray(result?.data?.plans)
          ? result.data.plans
              .map((plan) => ({
                apartmentType: String(plan?.apartmentType || apartmentType),
                superBuiltUpArea: Number(plan?.superBuiltUpArea || 0),
                bathrooms: Number(plan?.bathrooms || Number(apartmentType.split(" ")[0]) || 1),
                balconies: Number(plan?.balconies || 1),
                availability: String(plan?.availability || "Ready To Move"),
                image: String(plan?.image || FLOOR_PLAN_IMAGE),
              }))
              .filter((plan) => plan.superBuiltUpArea > 0)
          : [];

        if (cancelled) return;
        const nextPlans = plans.length > 0 ? plans : DEFAULT_FLOOR_PLANS[apartmentType] || [];
        floorPlansCache.set(requestKey, nextPlans);
        setFloorPlans(nextPlans);
      } catch {
        if (cancelled) return;
        setFloorPlans(DEFAULT_FLOOR_PLANS[apartmentType] || []);
      } finally {
        if (!cancelled) setIsFloorPlanLoading(false);
      }
    };

    loadFloorPlans();
    return () => {
      cancelled = true;
    };
  }, [apartmentType]);

  useEffect(() => {
    if (apartmentType === "Other" || floorPlans.length === 0) return;
    setSelectedPlanIndex(0);
    setPlanSlideIndex(0);
    applyPlan(floorPlans[0]);
  }, [apartmentType, floorPlans]);

  const applyPlan = (plan) => {
    setConfiguration(plan.apartmentType);
    setBuiltUpArea(String(plan.superBuiltUpArea));
    setBedrooms(Number(plan.apartmentType.split(" ")[0]) || bedrooms);
    setBathrooms(Number(plan.bathrooms || bathrooms));
    setBalconies(Number(plan.balconies || balconies));
  };

  const canShowConfigurationSlider = apartmentType === "2 BHK" || apartmentType === "3 BHK";
  const canSlideLeft = planSlideIndex > 0;
  const canSlideRight = planSlideIndex < floorPlans.length - 1;
  const activePlan = floorPlans[planSlideIndex];
  const nextPlan = floorPlans[planSlideIndex + 1];

  const updateFurnishingCount = (item, delta) => {
    setFurnishingCounts((prev) => {
      const next = Math.max(0, Number(prev[item] || 0) + delta);
      return { ...prev, [item]: next };
    });
  };

  const toggleChoice = (value, setter, current) => {
    if (current.includes(value)) setter(current.filter((it) => it !== value));
    else setter([...current, value]);
  };

  const formatRentWords = (value) => {
    const n = Number(value || 0);
    if (!n) return "";
    if (n === 26000) return "R Twenty Six Thousand";
    return `R ${n.toLocaleString("en-IN")}`;
  };

  const handleSubmit = async () => {
    const token = getAuthToken();
    const propertyId = String(localStorage.getItem("postPropertyId") || "").trim();
    if (!token) {
      setStatus({ type: "error", message: "Login token missing. Please login again." });
      return;
    }
    if (!propertyId) {
      setStatus({ type: "error", message: "Property ID missing. Please complete Basic Details again." });
      return;
    }
    if (!builtUpArea || Number(builtUpArea) < 0) {
      setStatus({ type: "error", message: "Built-up area is required." });
      return;
    }

    try {
      setIsSaving(true);
      setStatus({ type: "", message: "" });
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/properties/property-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId,
          completionPercent: propertyScorePercent,
          configuration,
          selectedConfiguration: floorPlans[selectedPlanIndex] || floorPlans[planSlideIndex] || undefined,
          builtUpArea: { value: Number(builtUpArea), unit: builtUpAreaUnit || "sq.ft." },
          propertyOnFloor,
          totalFloors: totalFloors ? Number(totalFloors) : undefined,
          roomDetails: {
            bedrooms,
            bathrooms,
            balconies,
            otherRooms: [],
          },
          areaDetails: {
            carpetArea: {
              value: carpetArea ? Number(carpetArea) : undefined,
              unit: carpetAreaUnit || "sq.ft.",
            },
            builtUpArea: {
              value: builtUpDetailArea ? Number(builtUpDetailArea) : undefined,
              unit: builtUpDetailUnit || "sq.ft.",
            },
            superBuiltUpArea: {
              value: builtUpArea ? Number(builtUpArea) : undefined,
              unit: builtUpAreaUnit || "sq.ft.",
            },
          },
          parking: { covered: 0, open: 0 },
          flooringTypes: [],
          furnishingStatus,
          furnishingItems: selectedFurnishingItems,
          availabilityStatus,
          ageOfProperty,
          possessionBy: availabilityStatus === "Under construction" ? possessionBy : undefined,
          ownershipType,
          propertyFacing: "",
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus({ type: "error", message: result?.message || "Unable to save property profile." });
        return;
      }

      // Also persist rent/price section from this screen into pricing details.
      const priceResponse = await fetch(`${apiBaseUrl}/api/properties/pricing-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId,
          completionPercent: propertyScorePercent,
          ownershipType: "Owner",
          priceDetails: {
            expectedPrice: Number(expectedRent || 0),
            expectedPriceUnit: "INR",
            pricePerSqft:
              builtUpArea && Number(builtUpArea) > 0
                ? Number((Number(expectedRent || 0) / Number(builtUpArea)).toFixed(2))
                : undefined,
            allInclusivePrice: false,
            taxAndGovtChargesExcluded: Boolean(electricityExcluded),
            priceNegotiable: Boolean(priceNegotiable),
          },
          additionalPriceDetails: {
            maintenance: { amount: 0, frequency: "" },
            expectedRentalIncome: Number(expectedRent || 0),
            bookingAmount: 0,
            annualDuesPayable: 0,
          },
          brokerage: {
            charged: false,
            type: "",
            value: undefined,
            negotiable: false,
          },
          propertyDescription: `Agreement: ${agreementType}; Brokers: ${brokersOk}; RentTo: ${willingToRentTo.join(", ")}; AvailableFrom: ${availableFrom}`,
        }),
      });

      const priceResult = await priceResponse.json().catch(() => ({}));
      if (!priceResponse.ok) {
        setStatus({
          type: "error",
          message: priceResult?.message || "Property profile saved, but rent details were not saved.",
        });
        return;
      }

      setStatus({ type: "success", message: "Property profile saved successfully." });
      window.setTimeout(() => {
        window.location.href = "/post-property-media-details";
      }, 250);
    } catch {
      setStatus({ type: "error", message: "Unable to connect to server." });
    } finally {
      setIsSaving(false);
    }
  };

  const roomRowWithCustom = ({
    label,
    value,
    setter,
    customValue,
    setCustomValue,
    customInput,
    setCustomInput,
    showInput,
    setShowInput,
  }) => (
    <Box sx={{ mt: 1 }}>
      <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>{label}</Typography>
      <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.45, flexWrap: "wrap" }}>
        {[1, 2, 3, 4].map((v) => (
          <Chip
            key={`${label}-${v}`}
            label={String(v)}
            onClick={() => setter(v)}
            sx={{
              height: 28,
              fontSize: 11,
              bgcolor: value === v ? "#e7f3ff" : "white",
              color: value === v ? "#0f73cb" : "#4d6079",
              border: "1px solid #cfd7e3",
            }}
          />
        ))}
        {customValue && (
          <Chip
            label={
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.2 }}>
                {customValue}
                <EditRoundedIcon sx={{ fontSize: 11 }} />
              </Box>
            }
            onClick={() => {
              setCustomInput(customValue);
              setShowInput(true);
            }}
            sx={{
              height: 28,
              fontSize: 11,
              bgcolor: Number(value) === Number(customValue) ? "#e7f3ff" : "white",
              color: Number(value) === Number(customValue) ? "#0f73cb" : "#4d6079",
              border: "1px solid #8bc6ff",
            }}
          />
        )}
      </Box>

      {showInput ? (
        <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box sx={{ width: 86, border: "1px solid #cfd7e3", borderRadius: "4px", bgcolor: "white", px: 0.65, py: 0.2 }}>
            <InputBase
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Enter"
              sx={{ fontSize: 11.5, width: "100%" }}
            />
          </Box>
          <Button
            variant="contained"
            onClick={() => {
              const n = Number(customInput || 0);
              if (n > 0) {
                setter(n);
                setCustomValue(String(n));
                setShowInput(false);
              }
            }}
            sx={{
              minWidth: 62,
              height: 32,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 10.5,
              bgcolor: "#0f73cb",
              borderRadius: "4px",
              boxShadow: "none",
              px: 1.6,
              "&:hover": { bgcolor: "#0c66b4", boxShadow: "none" },
            }}
          >
            Done
          </Button>
        </Box>
      ) : (
        <Typography
          onClick={() => {
            setCustomInput(customValue || "");
            setShowInput(true);
          }}
          sx={{ mt: 0.4, color: "#0f73cb", fontSize: 10.5, cursor: "pointer" }}
        >
          + Add other
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f7", fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif' }}>
      <Navbar sticky />

      <Box sx={{ mt: { xs: "56px", md: "54px" }, maxWidth: 968, mx: "auto", minHeight: "calc(100vh - 56px)", display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr 255px" }, gap: 0 }}>
        <Box
          sx={{
            px: { xs: 2, md: 0 },
            pt: { xs: 2.5, md: 2.9 },
            position: { md: "sticky" },
            top: { md: 70 },
            alignSelf: { md: "start" },
          }}
        >
          <Box sx={{ bgcolor: "#eceef3", border: "1px solid #e0e4ec", borderRadius: "10px", px: 2.15, py: 2.05, minHeight: 252 }}>
            {[
              { title: "Basic Details", step: "Flat/Apartment for Rent", done: true, editPath: "/post-property" },
              { title: "Location Details", step: `${locationSummary}`, done: true, editPath: "/post-property-location-details" },
              { title: "Property Profile", step: "Step 3", active: true },
              { title: "Photos, Videos & Voice-over", step: "Step 4" },
              { title: "Other details", step: "Step 5" },
            ].map((item, index, all) => (
              <Box key={item.title} sx={{ display: "flex", alignItems: "flex-start", gap: 1.15, pb: index === all.length - 1 ? 0 : 1.5 }}>
                <Box sx={{ position: "relative", width: 16, height: 28, display: "flex", justifyContent: "center" }}>
                  <Box sx={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid #6792c8", bgcolor: item.done || item.active ? "#0f73cb" : "transparent", color: "white", fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    {item.done ? <CheckRoundedIcon sx={{ fontSize: 10 }} /> : ""}
                  </Box>
                  {index !== all.length - 1 && <Box sx={{ position: "absolute", top: 15, width: "1px", height: 23, bgcolor: "#c8d6ea" }} />}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 9.2, color: "#102445", lineHeight: 1.15, fontWeight: item.active ? 700 : 400 }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: 9.2, color: "#8394ac", mt: 0.2 }}>
                    {item.step}
                    {item.editPath && (
                      <Box
                        component="span"
                        onClick={() => {
                          window.location.href = item.editPath;
                        }}
                        sx={{ color: "#0f73cb", cursor: "pointer", ml: 0.3 }}
                      >
                        Edit
                      </Box>
                    )}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 1.8, bgcolor: "#eceef3", border: "1px solid #e0e4ec", borderRadius: "10px", px: 2.1, py: 2.1, display: "flex", alignItems: "center", gap: 1.6 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: "50%", background: `conic-gradient(#28b14a ${propertyScorePercent * 3.6}deg, #cfd4dc 0deg)`, p: "3px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box sx={{ width: "100%", height: "100%", borderRadius: "50%", bgcolor: "#eceef3", display: "flex", alignItems: "center", justifyContent: "center", color: "#102445", fontSize: 10, fontWeight: 700 }}>
                {propertyScorePercent}%
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
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.2, color: "#6f7f98", fontSize: 10.5, cursor: "pointer" }} onClick={() => window.history.back()}>
            <KeyboardArrowLeftRoundedIcon sx={{ fontSize: 17 }} />
            Back
          </Box>

          <Typography sx={{ mt: 0.9, fontSize: 16.5, fontWeight: 700, color: "#102445" }}>Tell us about your property</Typography>

          <Box sx={{ mt: 1.2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Your apartment is a</Typography>
            <Box sx={{ mt: 0.55, display: "flex", gap: 0.5 }}>
              {["2 BHK", "3 BHK", "Other"].map((opt) => (
                <Chip
                  key={opt}
                  label={opt}
                  onClick={() => {
                    setApartmentType(opt);
                    setSelectedPlanIndex(0);
                    setPlanSlideIndex(0);
                  }}
                  sx={{
                    height: 24,
                    fontSize: 10.5,
                    bgcolor: apartmentType === opt ? "#e7f3ff" : "white",
                    color: apartmentType === opt ? "#0f73cb" : "#4d6079",
                    border: "1px solid #cfd7e3",
                  }}
                />
              ))}
            </Box>
          </Box>

          {canShowConfigurationSlider && showFloorPlanCards && (
            <>
              <Typography sx={{ mt: 1.0, fontSize: 10.5, color: "#243c5a", fontWeight: 700 }}>
                We found these configuration for {apartmentType} in your society...
              </Typography>
              <Typography sx={{ mt: 0.2, fontSize: 10, color: "#90a1b7" }}>Select from floor plans below to auto fill your details</Typography>
              {isFloorPlanLoading && (
                <Typography sx={{ mt: 0.3, fontSize: 9.8, color: "#7f90a7" }}>Loading floor plans...</Typography>
              )}

              <Box sx={{ mt: 0.7, position: "relative", overflow: "hidden", width: "100%" }}>
                {canSlideLeft && (
                  <Box
                    onClick={() => {
                      const nextIndex = Math.max(0, planSlideIndex - 1);
                      setPlanSlideIndex(nextIndex);
                      setSelectedPlanIndex(nextIndex);
                      applyPlan(floorPlans[nextIndex]);
                    }}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 6,
                      transform: "translateY(-50%)",
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      bgcolor: "#0f73cb",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 3,
                      cursor: "pointer",
                    }}
                  >
                    <KeyboardArrowLeftRoundedIcon sx={{ fontSize: 18 }} />
                  </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "stretch", gap: 0.8, pr: 3.3 }}>
                  {activePlan && (
                    <Box
                      key={`${activePlan.apartmentType}-${activePlan.superBuiltUpArea}-${planSlideIndex}`}
                      onClick={() => {
                        setSelectedPlanIndex(planSlideIndex);
                        applyPlan(activePlan);
                      }}
                      sx={{
                        minWidth: "calc(100% - 72px)",
                        border: `1px solid ${selectedPlanIndex === planSlideIndex ? "#0f73cb" : "#d9e0eb"}`,
                        borderRadius: "8px",
                        p: "9px 10px 11px",
                        position: "relative",
                        cursor: "pointer",
                        bgcolor: "white",
                      }}
                    >
                      <Box
                        component="img"
                        src={activePlan.image}
                        alt="Floor plan"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FLOOR_PLAN_FALLBACK_IMAGE;
                        }}
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          width: 42,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: "2px",
                          display: "block",
                        }}
                      />
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: "1px solid #c7d3e3",
                          bgcolor: selectedPlanIndex === planSlideIndex ? "#0f73cb" : "white",
                          color: "white",
                          fontSize: 9,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {selectedPlanIndex === planSlideIndex ? <CheckRoundedIcon sx={{ fontSize: 10 }} /> : ""}
                      </Box>

                      <Box sx={{ mt: 0.9, minWidth: 0, pr: "62px", pt: 0.2 }}>
                        <Typography sx={{ fontSize: 10.5, color: "#4b5f79", lineHeight: 1.5 }}>
                          Apartment type{" "}
                          <Box component="span" sx={{ color: "#223d5b", fontWeight: 700 }}>
                            {activePlan.apartmentType}
                          </Box>
                        </Typography>
                        <Typography sx={{ mt: 0.95, fontSize: 10.5, color: "#4b5f79", lineHeight: 1.5 }}>
                          Super Built-Up Area{" "}
                          <Box component="span" sx={{ color: "#223d5b", fontWeight: 700 }}>
                            {activePlan.superBuiltUpArea}.0
                          </Box>
                        </Typography>
                        <Typography sx={{ mt: 3.7, fontSize: 10.5, color: "#4b5f79", lineHeight: 1.5 }}>
                          Availability{" "}
                          <Box component="span" sx={{ color: "#223d5b", fontWeight: 700 }}>
                            {activePlan.availability}
                          </Box>
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {nextPlan && (
                    <Box
                      onClick={() => {
                        const nextIndex = planSlideIndex + 1;
                        setPlanSlideIndex(nextIndex);
                        setSelectedPlanIndex(nextIndex);
                        applyPlan(nextPlan);
                      }}
                      sx={{
                        width: 76,
                        flexShrink: 0,
                        border: "1px solid #d9e0eb",
                        borderRadius: "8px",
                        p: "9px 10px 10px",
                        bgcolor: "white",
                        cursor: "pointer",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <Box
                        component="img"
                        src={nextPlan.image}
                        alt="Floor plan preview"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FLOOR_PLAN_FALLBACK_IMAGE;
                        }}
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 8,
                          width: 22,
                          height: 30,
                          objectFit: "cover",
                          borderRadius: "2px",
                          display: "block",
                        }}
                      />
                      <Box sx={{ width: 12, height: 12, borderRadius: "50%", border: "1px solid #c7d3e3", bgcolor: "white" }} />
                      <Typography sx={{ mt: 1.1, pr: "22px", fontSize: 10.5, color: "#4b5f79", whiteSpace: "nowrap", lineHeight: 1.45 }}>Apartment</Typography>
                      <Typography sx={{ mt: 0.9, pr: "22px", fontSize: 10.5, color: "#4b5f79", whiteSpace: "nowrap", lineHeight: 1.45 }}>Super Bu</Typography>
                      <Typography sx={{ mt: 3.8, fontSize: 10.5, color: "#4b5f79", whiteSpace: "nowrap", lineHeight: 1.45 }}>Availabili</Typography>
                    </Box>
                  )}
                </Box>

                {canSlideRight && (
                  <Box
                    onClick={() => {
                      const nextIndex = Math.min(floorPlans.length - 1, planSlideIndex + 1);
                      setPlanSlideIndex(nextIndex);
                      setSelectedPlanIndex(nextIndex);
                      applyPlan(floorPlans[nextIndex]);
                    }}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: 0,
                      transform: "translateY(-50%)",
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      bgcolor: "#0f73cb",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 3,
                      cursor: "pointer",
                    }}
                  >
                    <KeyboardArrowRightRoundedIcon sx={{ fontSize: 18 }} />
                  </Box>
                )}
              </Box>

              <Typography sx={{ mt: 0.8, fontSize: 10.5, color: "#8a9cb3" }}>
                To fill out room and area details manually{" "}
                <Box
                  component="span"
                  onClick={() => setShowFloorPlanCards(false)}
                  sx={{ color: "#0f73cb", cursor: "pointer" }}
                >
                  Click here
                </Box>
              </Typography>
            </>
          )}

          {(apartmentType === "Other" || !showFloorPlanCards) && (
            <Typography sx={{ mt: 0.8, fontSize: 10.5, color: "#8a9cb3" }}>
              To fill out room and area details manually{" "}
              <Box
                component="span"
                onClick={() => apartmentType !== "Other" && setShowFloorPlanCards(true)}
                sx={{ color: "#0f73cb", cursor: "pointer" }}
              >
                Click here
              </Box>
            </Typography>
          )}

          <Box sx={{ mt: 1.2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a", display: "inline-flex", alignItems: "center", gap: 0.4 }}>
              Add Area Details <InfoOutlinedIcon sx={{ fontSize: 12.5, color: "#7d8ea5" }} />
            </Typography>
            <Typography sx={{ fontSize: 10, color: "#90a1b7", mt: 0.2 }}>At least one area type is mandatory</Typography>
            <Box sx={{ mt: 0.5, width: 226, border: "1px solid #7f93af", bgcolor: "white", p: 0.4, display: "grid", gridTemplateColumns: "1fr 78px" }}>
              <Box>
                <Typography sx={{ fontSize: 9.5, color: "#7e8fa6" }}>Carpet Area</Typography>
                <InputBase value={carpetArea} onChange={(e) => setCarpetArea(e.target.value.replace(/[^\d]/g, ""))} sx={{ fontSize: 11.5, width: "100%" }} />
              </Box>
              <Box
                onClick={(event) => setCarpetUnitAnchorEl(event.currentTarget)}
                sx={{ borderLeft: "1px solid #d5dce7", px: 0.9, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5, color: "#243c5a", cursor: "pointer" }}
              >
                {carpetAreaUnit}
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>
            {showBuiltUpArea && (
              <Box sx={{ mt: 0.45, width: 226, border: "1px solid #7f93af", bgcolor: "white", p: 0.4, display: "grid", gridTemplateColumns: "1fr 78px" }}>
                <Box>
                  <Typography sx={{ fontSize: 9.5, color: "#7e8fa6" }}>Built-up Area</Typography>
                  <InputBase value={builtUpDetailArea} onChange={(e) => setBuiltUpDetailArea(e.target.value.replace(/[^\d]/g, ""))} sx={{ fontSize: 11.5, width: "100%" }} />
                </Box>
                <Box
                  onClick={(event) => setBuiltUpDetailUnitAnchorEl(event.currentTarget)}
                  sx={{ borderLeft: "1px solid #d5dce7", px: 0.9, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5, color: "#243c5a", cursor: "pointer" }}
                >
                  {builtUpDetailUnit}
                  <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14 }} />
                </Box>
              </Box>
            )}
            {showSuperBuiltUpArea && (
              <Box sx={{ mt: 0.45, width: 226, border: "1px solid #7f93af", bgcolor: "white", p: 0.4, display: "grid", gridTemplateColumns: "1fr 78px" }}>
                <Box>
                  <Typography sx={{ fontSize: 9.5, color: "#7e8fa6" }}>Super Built-up Area</Typography>
                  <InputBase value={builtUpArea} onChange={(e) => setBuiltUpArea(e.target.value.replace(/[^\d]/g, ""))} sx={{ fontSize: 11.5, width: "100%" }} />
                </Box>
                <Box
                  onClick={(event) => setBuiltUpUnitAnchorEl(event.currentTarget)}
                  sx={{ borderLeft: "1px solid #d5dce7", px: 0.9, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5, color: "#243c5a", cursor: "pointer" }}
                >
                  {builtUpAreaUnit}
                  <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14 }} />
                </Box>
              </Box>
            )}
            <Menu
              anchorEl={carpetUnitAnchorEl}
              open={Boolean(carpetUnitAnchorEl)}
              onClose={() => setCarpetUnitAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              {areaUnits.map((unit) => (
                <MenuItem
                  key={`carpet-${unit}`}
                  onClick={() => {
                    setCarpetAreaUnit(unit);
                    setCarpetUnitAnchorEl(null);
                  }}
                  sx={{ fontSize: 12, minWidth: 120 }}
                >
                  {unit}
                </MenuItem>
              ))}
            </Menu>
            <Menu
              anchorEl={builtUpDetailUnitAnchorEl}
              open={Boolean(builtUpDetailUnitAnchorEl)}
              onClose={() => setBuiltUpDetailUnitAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              {areaUnits.map((unit) => (
                <MenuItem
                  key={`detail-builtup-${unit}`}
                  onClick={() => {
                    setBuiltUpDetailUnit(unit);
                    setBuiltUpDetailUnitAnchorEl(null);
                  }}
                  sx={{ fontSize: 12, minWidth: 120 }}
                >
                  {unit}
                </MenuItem>
              ))}
            </Menu>
            <Menu
              anchorEl={builtUpUnitAnchorEl}
              open={Boolean(builtUpUnitAnchorEl)}
              onClose={() => setBuiltUpUnitAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              {areaUnits.map((unit) => (
                <MenuItem
                  key={`builtup-${unit}`}
                  onClick={() => {
                    setBuiltUpAreaUnit(unit);
                    setBuiltUpUnitAnchorEl(null);
                  }}
                  sx={{ fontSize: 12, minWidth: 120 }}
                >
                  {unit}
                </MenuItem>
              ))}
            </Menu>
            <Box sx={{ mt: 0.45, display: "flex", gap: 0.9, color: "#0f73cb", fontSize: 10.5 }}>
              {!showBuiltUpArea && (
                <Box sx={{ cursor: "pointer" }} onClick={() => setShowBuiltUpArea(true)}>
                  + Built-up Area
                </Box>
              )}
              {!showSuperBuiltUpArea && (
                <Box sx={{ cursor: "pointer" }} onClick={() => setShowSuperBuiltUpArea(true)}>
                  + Super Built-up Area
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 1.2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Add Room Details</Typography>
            {roomRowWithCustom({
              label: "No. of Bedrooms",
              value: bedrooms,
              setter: setBedrooms,
              customValue: bedroomsCustomValue,
              setCustomValue: setBedroomsCustomValue,
              customInput: bedroomsCustomInput,
              setCustomInput: setBedroomsCustomInput,
              showInput: showBedroomsCustomInput,
              setShowInput: setShowBedroomsCustomInput,
            })}
            {roomRowWithCustom({
              label: "No. of Bathrooms",
              value: bathrooms,
              setter: setBathrooms,
              customValue: bathroomsCustomValue,
              setCustomValue: setBathroomsCustomValue,
              customInput: bathroomsCustomInput,
              setCustomInput: setBathroomsCustomInput,
              showInput: showBathroomsCustomInput,
              setShowInput: setShowBathroomsCustomInput,
            })}
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: 11, color: "#243c5a", fontWeight: 700 }}>Balconies</Typography>
              <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.45, flexWrap: "wrap" }}>
                {[0, 1, 2, 3].map((v) => (
                  <Chip
                    key={`balconies-${v}`}
                    label={String(v)}
                    onClick={() => setBalconies(v)}
                    sx={{
                      height: 28,
                      fontSize: 11,
                      bgcolor: balconies === v ? "#e7f3ff" : "white",
                      color: balconies === v ? "#0f73cb" : "#4d6079",
                      border: "1px solid #cfd7e3",
                    }}
                  />
                ))}
                <Chip
                  label="More than 3"
                  onClick={() => setBalconies(4)}
                  sx={{
                    height: 28,
                    fontSize: 11,
                    bgcolor: balconies >= 4 ? "#e7f3ff" : "white",
                    color: balconies >= 4 ? "#0f73cb" : "#4d6079",
                    border: "1px solid #8bc6ff",
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 1.25 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.45, mb: 0.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Furnishing</Typography>
              <Typography sx={{ fontSize: 9, color: "#95a4ba", fontStyle: "italic" }}>(Optional)</Typography>
              {showFurnishingRequiredError && <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#d93025" }} />}
            </Box>
            {showFurnishingRequiredError && (
              <Typography sx={{ mb: 0.45, fontSize: 10, color: "#d93025" }}>
                Please select at least 3 furnishing items for a furnished property
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 0.6 }}>
              {FURNISHING_LEVELS.map((opt) => (
                <Chip key={opt} label={opt} onClick={() => setFurnishingStatus(opt)} sx={{ height: 24, fontSize: 10.5, bgcolor: furnishingStatus === opt ? "#e7f3ff" : "white", color: furnishingStatus === opt ? "#0f73cb" : "#4d6079", border: "1px solid #cfd7e3" }} />
              ))}
            </Box>
            {furnishingStatus !== "Un-furnished" && (
              <Box sx={{ mt: 0.65, border: "1px solid #d8deea", borderRadius: "8px", p: 1.0 }}>
                <Typography sx={{ fontSize: 10, color: showFurnishingRequiredError ? "#d93025" : "#90a1b7", mb: 0.75 }}>
                  At least three furnishings are mandatory for furnished
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 1.8, rowGap: 0.5 }}>
                  {FURNISHING_ITEMS.map((item) => (
                    <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                      <Box onClick={() => updateFurnishingCount(item, -1)} sx={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid #c7d1df", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <RemoveRoundedIcon sx={{ fontSize: 12, color: "#7a8da8" }} />
                      </Box>
                      <Typography sx={{ fontSize: 10.5, minWidth: 12, textAlign: "center", color: "#4d6079" }}>{furnishingCounts[item] || 0}</Typography>
                      <Box onClick={() => updateFurnishingCount(item, 1)} sx={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid #c7d1df", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <AddRoundedIcon sx={{ fontSize: 12, color: "#7a8da8" }} />
                      </Box>
                      <Typography sx={{ fontSize: 10.5, color: "#243c5a" }}>{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 1.2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Floor Details</Typography>
            <Typography sx={{ fontSize: 10, color: "#90a1b7", mt: 0.15 }}>Total no of floors and your floor details</Typography>
            <Box sx={{ mt: 0.45, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.9 }}>
              <Box sx={{ border: "1px solid #7f93af", bgcolor: "white", p: 0.6 }}>
                <Typography sx={{ fontSize: 9.5, color: "#7e8fa6" }}>Total Floors</Typography>
                <InputBase value={totalFloors} onChange={(e) => setTotalFloors(e.target.value.replace(/[^\d]/g, ""))} sx={{ fontSize: 11.5, width: "100%" }} />
              </Box>
              <Box
                onClick={(event) => setPropertyFloorAnchorEl(event.currentTarget)}
                sx={{
                  border: "1px solid #d8deea",
                  bgcolor: "white",
                  p: 0.6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ fontSize: 11, color: propertyOnFloor ? "#243c5a" : "#7e8fa6" }}>
                  {propertyOnFloor || "Property on floor"}
                </Typography>
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14, color: "#243c5a" }} />
              </Box>
            </Box>
            <Menu
              anchorEl={propertyFloorAnchorEl}
              open={Boolean(propertyFloorAnchorEl)}
              onClose={() => setPropertyFloorAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{ sx: { mt: 0.3, minWidth: 215, borderRadius: 0 } }}
            >
              {FLOOR_OPTIONS.map((opt) => (
                <MenuItem
                  key={opt}
                  onClick={() => {
                    setPropertyOnFloor(opt);
                    setPropertyFloorAnchorEl(null);
                  }}
                  sx={{
                    fontSize: 12,
                    color: "#243c5a",
                    bgcolor: propertyOnFloor === opt ? "#eff6ff" : "white",
                  }}
                >
                  {opt}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ mt: 1.2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Availability Status</Typography>
            <Box sx={{ mt: 0.45, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  label={opt}
                  onClick={() => setAvailabilityStatus(opt)}
                  sx={{
                    height: 24,
                    fontSize: 10.5,
                    bgcolor: availabilityStatus === opt ? "#e7f3ff" : "white",
                    color: availabilityStatus === opt ? "#0f73cb" : "#4d6079",
                    border: "1px solid #cfd7e3",
                  }}
                />
              ))}
            </Box>
          </Box>

          {availabilityStatus === "Ready to move" ? (
            <Box sx={{ mt: 1.2 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Age of property</Typography>
              <Box sx={{ mt: 0.45, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {AGE_OPTIONS.map((opt) => (
                  <Chip key={opt} label={opt} onClick={() => setAgeOfProperty(opt)} sx={{ height: 24, fontSize: 10.5, bgcolor: ageOfProperty === opt ? "#e7f3ff" : "white", color: ageOfProperty === opt ? "#0f73cb" : "#4d6079", border: "1px solid #cfd7e3" }} />
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 1.2 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Possession By</Typography>
              <Box
                onClick={(event) => setPossessionByAnchorEl(event.currentTarget)}
                sx={{
                  mt: 0.45,
                  width: 226,
                  border: "1px solid #d8deea",
                  bgcolor: "white",
                  px: 0.8,
                  py: 0.85,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <Typography sx={{ fontSize: 11, color: possessionBy ? "#243c5a" : "#7e8fa6" }}>
                  {possessionBy || "Expected by"}
                </Typography>
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14, color: "#243c5a" }} />
              </Box>
              <Menu
                anchorEl={possessionByAnchorEl}
                open={Boolean(possessionByAnchorEl)}
                onClose={() => setPossessionByAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{ sx: { mt: 0.3, minWidth: 226, borderRadius: 0 } }}
              >
                {POSSESSION_BY_OPTIONS.map((opt) => (
                  <MenuItem
                    key={opt}
                    onClick={() => {
                      setPossessionBy(opt);
                      setPossessionByAnchorEl(null);
                    }}
                    sx={{ fontSize: 12, color: "#243c5a", bgcolor: possessionBy === opt ? "#eff6ff" : "white" }}
                  >
                    {opt}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          <Box sx={{ mt: 1.2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a", display: "inline-flex", alignItems: "center", gap: 0.4 }}>
              Ownership <InfoOutlinedIcon sx={{ fontSize: 12 }} />
            </Typography>
            <Box sx={{ mt: 0.45, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {OWNERSHIP_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  label={opt}
                  onClick={() => setOwnershipType(opt)}
                  sx={{
                    height: 24,
                    fontSize: 10.5,
                    bgcolor: ownershipType === opt ? "#e7f3ff" : "white",
                    color: ownershipType === opt ? "#0f73cb" : "#4d6079",
                    border: "1px solid #cfd7e3",
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 1.1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Available from</Typography>
            <Box sx={{ mt: 0.45, width: 226, border: "1px solid #d8deea", bgcolor: "white", px: 0.8, py: 0.6 }}>
              <InputBase type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} sx={{ fontSize: 11.5, width: "100%" }} />
            </Box>
          </Box>

          <Box sx={{ mt: 1.1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Willing to rent out to</Typography>
            <Box sx={{ mt: 0.45, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {TENANT_OPTIONS.map((opt) => {
                const active = willingToRentTo.includes(opt);
                return (
                  <Chip
                    key={opt}
                    label={active ? `✓ ${opt}` : `+ ${opt}`}
                    onClick={() => toggleChoice(opt, setWillingToRentTo, willingToRentTo)}
                    sx={{ height: 24, fontSize: 10.5, bgcolor: active ? "#e7f3ff" : "white", color: active ? "#0f73cb" : "#4d6079", border: "1px solid #cfd7e3" }}
                  />
                );
              })}
            </Box>
          </Box>

          <Box sx={{ mt: 1.2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Rent Details</Typography>
            <Box sx={{ mt: 0.45, width: 190, border: "1px solid #7f93af", bgcolor: "white", p: 0.45 }}>
              <Typography sx={{ fontSize: 9.5, color: "#7e8fa6" }}>R Expected Rent</Typography>
              <InputBase value={expectedRent} onChange={(e) => setExpectedRent(e.target.value.replace(/[^\d]/g, ""))} sx={{ fontSize: 11.5, width: "100%" }} />
            </Box>
            <Typography sx={{ mt: 0.25, fontSize: 10.5, color: "#4d6079" }}>{formatRentWords(expectedRent)}</Typography>
            <Box sx={{ mt: 0.45, display: "flex", gap: 1.2, flexWrap: "wrap" }}>
              <FormControlLabel control={<Checkbox checked={electricityExcluded} onChange={(e) => setElectricityExcluded(e.target.checked)} sx={{ p: 0.25, "& .MuiSvgIcon-root": { fontSize: 14 } }} />} label={<Typography sx={{ fontSize: 10.5 }}>Electricity & Water charges excluded</Typography>} />
              <FormControlLabel control={<Checkbox checked={priceNegotiable} onChange={(e) => setPriceNegotiable(e.target.checked)} sx={{ p: 0.25, "& .MuiSvgIcon-root": { fontSize: 14 } }} />} label={<Typography sx={{ fontSize: 10.5 }}>Price Negotiable</Typography>} />
            </Box>
            <Typography sx={{ mt: 0.2, fontSize: 10.5, color: "#0f73cb", cursor: "pointer" }}>+ Add more Rent details</Typography>
          </Box>

          <Box sx={{ mt: 1.2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Preferred agreement type</Typography>
            <Box sx={{ mt: 0.45, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {AGREEMENT_OPTIONS.map((opt) => (
                <Chip key={opt} label={opt} onClick={() => setAgreementType(opt)} sx={{ height: 24, fontSize: 10.5, bgcolor: agreementType === opt ? "#e7f3ff" : "white", color: agreementType === opt ? "#0f73cb" : "#4d6079", border: "1px solid #cfd7e3" }} />
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 1.2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#243c5a", display: "inline-flex", alignItems: "center", gap: 0.4 }}>
              Are you ok with brokers contacting you? <InfoOutlinedIcon sx={{ fontSize: 12 }} />
            </Typography>
            <Box sx={{ mt: 0.45, display: "flex", gap: 0.5 }}>
              {["Yes", "No"].map((opt) => (
                <Chip key={opt} label={opt} onClick={() => setBrokersOk(opt)} sx={{ height: 24, fontSize: 10.5, bgcolor: brokersOk === opt ? "#e7f3ff" : "white", color: brokersOk === opt ? "#0f73cb" : "#4d6079", border: "1px solid #cfd7e3" }} />
              ))}
            </Box>
          </Box>

          {status.message && <Alert severity={status.type || "info"} sx={{ mt: 1.1, py: 0.2, "& .MuiAlert-message": { fontSize: 11 } }}>{status.message}</Alert>}

          <Button variant="contained" onClick={handleSubmit} disabled={isSaving} sx={{ mt: 1.5, minWidth: 117, height: 37, textTransform: "none", fontWeight: 700, fontSize: 12, bgcolor: "#0f73cb", borderRadius: "4px", boxShadow: "none", px: 2.2, "&:hover": { bgcolor: "#0c66b4", boxShadow: "none" } }}>
            {isSaving ? "Saving..." : "Post & continue"}
          </Button>
        </Box>

        <Box
          sx={{
            bgcolor: "#eaecf1",
            px: 1.45,
            pt: 1.95,
            pb: 1.8,
            display: "flex",
            flexDirection: "column",
            position: { md: "sticky" },
            top: { md: 70 },
            height: { md: "calc(100vh - 70px)" },
            justifyContent: { md: "flex-end" },
            alignSelf: { md: "start" },
          }}
        >
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
