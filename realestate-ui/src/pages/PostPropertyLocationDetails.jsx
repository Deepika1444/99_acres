import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Divider, InputBase, Typography } from "@mui/material";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import Navbar from "../components/Navbar";
import { getAuthToken } from "../utils/authStorage";

const LOOKING_LABELS = {
  sell: "Sell",
  rent_lease: "Rent",
  pg: "PG",
};

const SUBTYPE_LABELS = {
  flat_apartment: "Flat/Apartment",
  independent_house_villa: "Independent House / Villa",
  independent_builder_floor: "Builder Floor",
  plot_land: "Plot / Land",
  studio_apartment: "1 RK / Studio Apartment",
  serviced_apartment: "Serviced Apartment",
  farmhouse: "Farmhouse",
  office: "Office",
  retail: "Retail",
  commercial_land: "Plot / Land",
  warehouse_godown: "Warehouse / Godown",
  industrial_shed: "Industrial Shed",
  other: "Other",
};

export default function PostPropertyLocationDetails() {
  const [city, setCity] = useState("");
  const [cityId, setCityId] = useState("");
  const [locality, setLocality] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [subLocality, setSubLocality] = useState("");
  const [subLocalityId, setSubLocalityId] = useState("");
  const [apartmentSociety, setApartmentSociety] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  const [isCitySelected, setIsCitySelected] = useState(false);
  const [isLocalitySelected, setIsLocalitySelected] = useState(false);
  const [isSubLocalitySelected, setIsSubLocalitySelected] = useState(false);
  const [isApartmentSelected, setIsApartmentSelected] = useState(false);

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [localitySuggestions, setLocalitySuggestions] = useState([]);
  const [subLocalitySuggestions, setSubLocalitySuggestions] = useState([]);
  const [apartmentSuggestions, setApartmentSuggestions] = useState([]);

  const [activeField, setActiveField] = useState("");
  const [cityError, setCityError] = useState("");
  const [localityError, setLocalityError] = useState("");
  const [isAddingCityOption, setIsAddingCityOption] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [basicDetails, setBasicDetails] = useState({
    lookingTo: "rent_lease",
    propertySubType: "flat_apartment",
  });
  const [cityIdByName, setCityIdByName] = useState({});
  const [localityIdByName, setLocalityIdByName] = useState({});
  const [subLocalityIdByName, setSubLocalityIdByName] = useState({});

  const fetchTimerRef = useRef(null);

  const stepOneSummary = useMemo(() => {
    const typeLabel = SUBTYPE_LABELS[basicDetails.propertySubType] || "Flat/Apartment";
    const lookingLabel = LOOKING_LABELS[basicDetails.lookingTo] || "Rent";
    return `${typeLabel} for ${lookingLabel}`;
  }, [basicDetails]);

  const propertyScorePercent = useMemo(() => {
    const base = 14;
    const cityScore = isCitySelected ? 5 : 0;
    const localityScore = isLocalitySelected ? 4 : 0;
    const subScore = subLocality.trim() ? 2 : 0;
    const apartmentScore = apartmentSociety.trim() ? 2 : 0;
    const houseScore = houseNumber.trim() ? 2 : 0;
    return base + cityScore + localityScore + subScore + apartmentScore + houseScore;
  }, [isCitySelected, isLocalitySelected, subLocality, apartmentSociety, houseNumber]);

  const filterSuggestionsByInput = (items, query) => {
    const needle = String(query || "").trim().toLowerCase();
    const unique = [];
    const seen = new Set();
    for (const item of Array.isArray(items) ? items : []) {
      const text = String(item || "").trim();
      if (!text) continue;
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      if (needle && !key.includes(needle)) continue;
      seen.add(key);
      unique.push(text);
    }
    return unique.slice(0, 8);
  };

  const visibleCitySuggestions = useMemo(() => filterSuggestionsByInput(citySuggestions, city), [citySuggestions, city]);
  const visibleLocalitySuggestions = useMemo(
    () => filterSuggestionsByInput(localitySuggestions, locality),
    [localitySuggestions, locality]
  );
  const visibleSubLocalitySuggestions = useMemo(
    () => filterSuggestionsByInput(subLocalitySuggestions, subLocality),
    [subLocalitySuggestions, subLocality]
  );
  const visibleApartmentSuggestions = useMemo(
    () => filterSuggestionsByInput(apartmentSuggestions, apartmentSociety),
    [apartmentSuggestions, apartmentSociety]
  );

  useEffect(() => {
    try {
      const rawBasic = localStorage.getItem("postPropertyBasicDetails");
      if (rawBasic) {
        const parsed = JSON.parse(rawBasic);
        setBasicDetails({
          lookingTo: String(parsed?.lookingTo || "rent_lease"),
          propertySubType: String(parsed?.propertySubType || "flat_apartment"),
        });
      }
    } catch {
      // Ignore malformed draft data.
    }

    try {
      const rawLocation = localStorage.getItem("postPropertyLocationDetails");
      if (!rawLocation) return;
      const parsed = JSON.parse(rawLocation);
      const nextCity = String(parsed?.city || "").trim();
      const nextLocality = String(parsed?.locality || "").trim();
      const nextSubLocality = String(parsed?.subLocality || "").trim();
      const nextApartment = String(parsed?.apartmentSociety || "").trim();
      const nextHouseNumber = String(parsed?.houseNumber || "").trim();
      setCity(nextCity);
      setLocality(nextLocality);
      setSubLocality(nextSubLocality);
      setApartmentSociety(nextApartment);
      setHouseNumber(nextHouseNumber);
      setIsCitySelected(Boolean(nextCity));
      setIsLocalitySelected(Boolean(nextLocality));
      setIsSubLocalitySelected(Boolean(nextSubLocality));
      setIsApartmentSelected(Boolean(nextApartment));
    } catch {
      // Ignore malformed draft data.
    }
  }, []);

  const callProtectedPropertyApi = async (path, payload) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Login token missing");
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, result };
  };

  const fetchCitiesBySearch = async (searchText) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Login token missing");
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const query = encodeURIComponent(String(searchText || "").trim());
    const response = await fetch(`${apiBaseUrl}/api/locations/cities?search=${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, result };
  };

  const fetchLocalitiesBySearch = async (targetCityId, searchText) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Login token missing");
    }
    if (!targetCityId) {
      return { ok: true, result: { data: [] } };
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const query = encodeURIComponent(String(searchText || "").trim());
    const cityIdParam = encodeURIComponent(String(targetCityId));
    const response = await fetch(`${apiBaseUrl}/api/locations/localities?CityID=${cityIdParam}&search=${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, result };
  };

  const fetchSubLocalitiesBySearch = async (targetLocalityId, searchText) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Login token missing");
    }
    if (!targetLocalityId) {
      return { ok: true, result: { data: [] } };
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const query = encodeURIComponent(String(searchText || "").trim());
    const localityIdParam = encodeURIComponent(String(targetLocalityId));
    const response = await fetch(`${apiBaseUrl}/api/locations/sub-localities?LocalityID=${localityIdParam}&search=${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, result };
  };

  const fetchSocietiesBySearch = async (targetSubLocalityId, searchText) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Login token missing");
    }
    if (!targetSubLocalityId) {
      return { ok: true, result: { data: [] } };
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const query = encodeURIComponent(String(searchText || "").trim());
    const subLocalityIdParam = encodeURIComponent(String(targetSubLocalityId));
    const response = await fetch(`${apiBaseUrl}/api/locations/societies?SubLocalityID=${subLocalityIdParam}&search=${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, result };
  };

  const scheduleFetchSuggestions = (field, query) => {
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }

    fetchTimerRef.current = setTimeout(async () => {
      try {
        if (field === "city") {
          const { ok, result } = await fetchCitiesBySearch(query);
          if (!ok) return;
          const cityRows = Array.isArray(result?.data) ? result.data : [];
          const nextCityIdByName = {};
          const suggestions = cityRows
            .map((item) => {
              const name = String(item?.CityName || "").trim();
              const id = String(item?.CityID || "").trim();
              if (name && id) nextCityIdByName[name] = id;
              return name;
            })
            .filter(Boolean);
          setCityIdByName(nextCityIdByName);
          setCitySuggestions(suggestions);
          return;
        }

        if (field === "locality") {
          const { ok, result } = await fetchLocalitiesBySearch(cityId, query);
          if (!ok) return;
          const localityRows = Array.isArray(result?.data) ? result.data : [];
          const nextLocalityIdByName = {};
          const suggestions = localityRows
            .map((item) => {
              const name = String(item?.LocalityName || "").trim();
              const id = String(item?.LocalityID || "").trim();
              if (name && id) nextLocalityIdByName[name] = id;
              return name;
            })
            .filter(Boolean);
          setLocalityIdByName(nextLocalityIdByName);
          setLocalitySuggestions(suggestions);
          return;
        }

        if (field === "subLocality") {
          const { ok, result } = await fetchSubLocalitiesBySearch(localityId, query);
          if (!ok) return;
          const subLocalityRows = Array.isArray(result?.data) ? result.data : [];
          const nextSubLocalityIdByName = {};
          const suggestions = subLocalityRows
            .map((item) => {
              const name = String(item?.SubLocalityName || "").trim();
              const id = String(item?.SubLocalityID || "").trim();
              if (name && id) nextSubLocalityIdByName[name] = id;
              return name;
            })
            .filter(Boolean);
          setSubLocalityIdByName(nextSubLocalityIdByName);
          setSubLocalitySuggestions(suggestions);
          return;
        }

        if (field === "apartmentSociety") {
          const { ok, result } = await fetchSocietiesBySearch(subLocalityId, query);
          if (!ok) return;
          const suggestions = Array.isArray(result?.data)
            ? result.data
                .map((item) => String(item?.SocietyName || "").trim())
                .filter(Boolean)
            : [];
          setApartmentSuggestions(suggestions);
          return;
        }

        const payload = {
          field,
          query: String(query || ""),
          limit: 8,
        };

        if (field !== "city") payload.city = city;
        if (field === "subLocality" || field === "apartmentSociety") payload.locality = locality;
        if (field === "apartmentSociety" && subLocality.trim()) payload.subLocality = subLocality;

        const { ok, result } = await callProtectedPropertyApi("/api/properties/location-suggestions", payload);
        if (!ok) return;

        const suggestions = Array.isArray(result?.data?.suggestions) ? result.data.suggestions : [];
        if (field === "city") setCitySuggestions(suggestions);
        if (field === "locality") setLocalitySuggestions(suggestions);
        if (field === "subLocality") setSubLocalitySuggestions(suggestions);
        if (field === "apartmentSociety") setApartmentSuggestions(suggestions);
      } catch {
        // Ignore background suggestion errors.
      }
    }, 250);
  };

  const handleCityChange = (value) => {
    setCity(value);
    setCityId("");
    setLocalityId("");
    setSubLocalityId("");
    setIsCitySelected(false);
    setCityError("");
    setStatus({ type: "", message: "" });

    setLocality("");
    setSubLocality("");
    setApartmentSociety("");
    setHouseNumber("");

    setIsLocalitySelected(false);
    setIsSubLocalitySelected(false);
    setIsApartmentSelected(false);

    setLocalitySuggestions([]);
    setSubLocalitySuggestions([]);
    setApartmentSuggestions([]);

    if (!value.trim()) {
      setCitySuggestions([]);
      setCityIdByName({});
      return;
    }
    scheduleFetchSuggestions("city", value);
  };

  const handleLocalityChange = (value) => {
    setLocality(value);
    setLocalityId("");
    setSubLocalityId("");
    setIsLocalitySelected(false);
    setLocalityError("");
    setStatus({ type: "", message: "" });

    setSubLocality("");
    setApartmentSociety("");
    setHouseNumber("");
    setIsSubLocalitySelected(false);
    setIsApartmentSelected(false);
    setSubLocalitySuggestions([]);
    setApartmentSuggestions([]);

    if (!value.trim() || !city.trim()) {
      setLocalitySuggestions([]);
      return;
    }
    scheduleFetchSuggestions("locality", value);
  };

  const handleSubLocalityChange = (value) => {
    setSubLocality(value);
    setSubLocalityId("");
    setIsSubLocalitySelected(false);
    setStatus({ type: "", message: "" });

    setApartmentSociety("");
    setHouseNumber("");
    setIsApartmentSelected(false);
    setApartmentSuggestions([]);

    if (!value.trim() || !city.trim() || !locality.trim()) {
      setSubLocalitySuggestions([]);
      return;
    }
    scheduleFetchSuggestions("subLocality", value);
  };

  const handleApartmentChange = (value) => {
    setApartmentSociety(value);
    setIsApartmentSelected(false);
    setStatus({ type: "", message: "" });

    if (!value.trim() || !city.trim() || !locality.trim()) {
      setApartmentSuggestions([]);
      return;
    }
    scheduleFetchSuggestions("apartmentSociety", value);
  };

  const handleSelectSuggestion = (field, value) => {
    if (field === "city") {
      setCity(value);
      setCityId(String(cityIdByName[value] || ""));
      setIsCitySelected(true);
      setCityError("");
      setCitySuggestions([]);
      setActiveField("");
      return;
    }
    if (field === "locality") {
      setLocality(value);
      setLocalityId(String(localityIdByName[value] || ""));
      setIsLocalitySelected(true);
      setLocalityError("");
      setLocalitySuggestions([]);
      setActiveField("");
      return;
    }
    if (field === "subLocality") {
      setSubLocality(value);
      setSubLocalityId(String(subLocalityIdByName[value] || ""));
      setIsSubLocalitySelected(true);
      setSubLocalitySuggestions([]);
      setActiveField("");
      return;
    }
    if (field === "apartmentSociety") {
      setApartmentSociety(value);
      setIsApartmentSelected(true);
      setApartmentSuggestions([]);
      setActiveField("");
    }
  };

  const handleAddCityOption = async () => {
    const input = city.trim();
    if (!input || isAddingCityOption) return;

    try {
      setIsAddingCityOption(true);
      const { ok, result } = await callProtectedPropertyApi("/api/properties/location-options", {
        city: input,
        locality: "",
        subLocality: "",
        apartmentSociety: "",
      });
      if (!ok) {
        setCityError(result?.message || "Unable to add city right now.");
        return;
      }
      setIsCitySelected(true);
      setCityError("");
      setCitySuggestions([]);
      setStatus({ type: "success", message: "City added. You can continue with locality." });
    } catch {
      setCityError("Unable to add city right now.");
    } finally {
      setIsAddingCityOption(false);
    }
  };

  const ensurePropertyId = async () => {
    const existingPropertyId = String(localStorage.getItem("postPropertyId") || "").trim();
    if (existingPropertyId) return existingPropertyId;

    let savedBasic = {};
    try {
      const rawBasic = localStorage.getItem("postPropertyBasicDetails");
      savedBasic = rawBasic ? JSON.parse(rawBasic) : {};
    } catch {
      savedBasic = {};
    }

    const lookingTo = String(savedBasic?.lookingTo || "").trim();
    const propertyKind = String(savedBasic?.propertyKind || "").trim();
    const propertySubType = String(savedBasic?.propertySubType || "").trim();
    if (!lookingTo || !propertyKind || !propertySubType) {
      return "";
    }

    const { ok, result } = await callProtectedPropertyApi("/api/properties/basic-details", {
      lookingTo,
      propertyKind,
      propertySubType,
      completionPercent: 12,
    });
    if (!ok) {
      return "";
    }
    const generatedPropertyId = String(result?.data?.propertyId || "").trim();
    if (generatedPropertyId) {
      localStorage.setItem("postPropertyId", generatedPropertyId);
    }
    return generatedPropertyId;
  };

  const handleContinue = async () => {
    if (!city.trim()) {
      setCityError("City is required.");
      return;
    }
    if (!locality.trim()) {
      setLocalityError("Locality is required.");
      return;
    }

    try {
      setIsSaving(true);
      setStatus({ type: "", message: "" });
      const propertyId = await ensurePropertyId();
      if (!propertyId) {
        setStatus({ type: "error", message: "propertyId is required. Please complete Basic Details once." });
        return;
      }

      // Ensure custom typed location values are persisted in master list too.
      await callProtectedPropertyApi("/api/properties/location-options", {
        city: city.trim(),
        locality: locality.trim(),
        subLocality: subLocality.trim(),
        apartmentSociety: apartmentSociety.trim(),
      });

      const locationSavePath = propertyId
        ? `/api/properties/location-details/${encodeURIComponent(propertyId)}`
        : "/api/properties/location-details";
      const { ok, result } = await callProtectedPropertyApi(locationSavePath, {
        propertyId,
        city: city.trim(),
        locality: locality.trim(),
        subLocality: subLocality.trim(),
        apartmentSociety: apartmentSociety.trim(),
        houseNumber: houseNumber.trim(),
        completionPercent: propertyScorePercent,
      });
      if (!ok) {
        setStatus({ type: "error", message: result?.message || "Unable to save location details." });
        return;
      }
      setStatus({ type: "success", message: "Location details saved successfully." });
      if (result?.data?.propertyId) {
        localStorage.setItem("postPropertyId", String(result.data.propertyId));
      }
      localStorage.setItem(
        "postPropertyLocationDetails",
        JSON.stringify({
          city: city.trim(),
          locality: locality.trim(),
          subLocality: subLocality.trim(),
          apartmentSociety: apartmentSociety.trim(),
          houseNumber: houseNumber.trim(),
        })
      );
      window.setTimeout(() => {
        window.location.href = "/post-property-profile-details";
      }, 250);
    } catch {
      setStatus({ type: "error", message: "Unable to connect to server." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f7", fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif' }}>
      <Navbar sticky />

      <Box
        sx={{
          mt: { xs: "56px", md: "54px" },
          maxWidth: 968,
          mx: "auto",
          minHeight: "calc(100vh - 56px)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "220px 1fr 255px" },
          gap: 0,
        }}
      >
        <Box sx={{ px: { xs: 2, md: 0 }, pt: { xs: 2.5, md: 2.9 } }}>
          <Box sx={{ bgcolor: "#eceef3", border: "1px solid #e0e4ec", borderRadius: "10px", px: 2.15, py: 2.05, minHeight: 286 }}>
            {[
              { title: "Basic Details", step: stepOneSummary, done: true, editPath: "/post-property" },
              { title: "Location Details", step: "Step 2", active: true },
              { title: "Property Profile", step: "Step 3" },
              { title: "Photos, Videos & Voice-over", step: "Step 4" },
              { title: "Other details", step: "Step 5" },
            ].map((item, index, all) => (
              <Box key={item.title} sx={{ display: "flex", alignItems: "flex-start", gap: 1.15, pb: index === all.length - 1 ? 0 : 1.75 }}>
                <Box sx={{ position: "relative", width: 16, height: 28, display: "flex", justifyContent: "center" }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "1px solid #6792c8",
                      bgcolor: item.done || item.active ? "#0f73cb" : "transparent",
                      color: "white",
                      fontSize: 10,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.done ? "✓" : ""}
                  </Box>
                  {index !== all.length - 1 && <Box sx={{ position: "absolute", top: 15, width: "1px", height: 25, bgcolor: "#c8d6ea" }} />}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 9, color: "#102445", lineHeight: 1.15, fontWeight: item.active ? 700 : 400 }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: 9.5, color: "#8394ac", mt: 0.2 }}>
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

          <Box sx={{ mt: 2.2, bgcolor: "#eceef3", border: "1px solid #e0e4ec", borderRadius: "10px", px: 2.1, py: 2.1, display: "flex", alignItems: "center", gap: 1.6 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: `conic-gradient(#28b14a ${propertyScorePercent * 3.6}deg, #cfd4dc 0deg)`,
                p: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  bgcolor: "#eceef3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#102445",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
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

        <Box sx={{ borderLeft: { md: "1px solid #e4e7ed" }, borderRight: { md: "1px solid #e4e7ed" }, px: { xs: 2, md: 2.4 }, pt: { xs: 2.5, md: 2.9 } }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.2, color: "#6f7f98", fontSize: 10.5, cursor: "pointer" }} onClick={() => window.history.back()}>
            <KeyboardArrowLeftRoundedIcon sx={{ fontSize: 17 }} />
            Back
          </Box>

          <Typography sx={{ mt: 1.0, fontSize: 16.5, fontWeight: 700, color: "#102445" }}>Where is your property located?</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 11, color: "#8597ad" }}>An accurate location helps you connect with the right buyers</Typography>

          <Box
            sx={{
              mt: 1.6,
              width: 256,
              minHeight: 39,
              border: cityError ? "1px solid #ce2d2d" : "1px solid #7f93af",
              bgcolor: "white",
              px: 1.05,
              py: 0.5,
              position: "relative",
            }}
          >
            <Typography sx={{ fontSize: 9.5, color: cityError ? "#ce2d2d" : "#0f73cb" }}>City</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <InputBase
                value={city}
                onFocus={() => {
                  setActiveField("city");
                  scheduleFetchSuggestions("city", city);
                }}
                onChange={(event) => handleCityChange(event.target.value)}
                placeholder="City"
                sx={{ fontSize: 11.5, color: "#263c5a", flex: 1, "& input::placeholder": { color: "#6f819a", opacity: 1 } }}
              />
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.3, color: "#0f73cb", fontSize: 11, whiteSpace: "nowrap", cursor: "pointer" }}>
                <MyLocationRoundedIcon sx={{ fontSize: 13.5 }} />
                Pick my location
              </Box>
            </Box>
            {activeField === "city" && (
              <Box sx={{ position: "absolute", left: -1, right: -1, top: "100%", bgcolor: "white", border: "1px solid #d9e0eb", borderTop: "none", zIndex: 20, maxHeight: 240, overflowY: "auto" }}>
                {visibleCitySuggestions.length > 0 ? (
                  visibleCitySuggestions.map((item, idx) => (
                    <Box key={`${item}-${idx}`} onClick={() => handleSelectSuggestion("city", item)} sx={{ px: 1.2, py: 1.05, fontSize: 11.5, color: "#102445", cursor: "pointer", "&:hover": { bgcolor: "#f2f4f8" } }}>
                      {item}
                    </Box>
                  ))
                ) : city.trim() ? (
                  <Box sx={{ px: 1.2, py: 1.0, fontSize: 11, color: "#6e8097" }}>No matching city found</Box>
                ) : null}
                <Box sx={{ px: 1.2, py: 0.95, borderTop: "1px solid #e4e7ed", bgcolor: "#fff9ef", fontSize: 11.5, color: "#102445" }}>
                  Can&apos;t find your City?{" "}
                  <Box component="span" onClick={handleAddCityOption} sx={{ color: "#0f73cb", cursor: isAddingCityOption ? "wait" : "pointer" }}>
                    {isAddingCityOption ? "adding..." : "click here to add"}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
          {cityError && <Typography sx={{ mt: 0.5, color: "#ce2d2d", fontSize: 10 }}>{cityError}</Typography>}

          {isCitySelected && (
            <Box sx={{ mt: 1.0, width: 256, minHeight: 39, border: localityError ? "1px solid #ce2d2d" : "1px solid #7f93af", bgcolor: "white", px: 1.05, py: 0.5, position: "relative" }}>
              <Typography sx={{ fontSize: 9.5, color: localityError ? "#ce2d2d" : "#0f73cb" }}>Locality / Apartment</Typography>
              <InputBase
                value={locality}
                onFocus={() => {
                  setActiveField("locality");
                  scheduleFetchSuggestions("locality", locality);
                }}
                onChange={(event) => handleLocalityChange(event.target.value)}
                placeholder="Locality"
                sx={{ fontSize: 11.5, color: "#263c5a", width: "100%" }}
              />
              {activeField === "locality" && (
                <Box sx={{ position: "absolute", left: -1, right: -1, top: "100%", bgcolor: "white", border: "1px solid #d9e0eb", borderTop: "none", zIndex: 20, maxHeight: 220, overflowY: "auto" }}>
                  {visibleLocalitySuggestions.length > 0 ? (
                    visibleLocalitySuggestions.map((item, idx) => (
                      <Box key={`${item}-${idx}`} onClick={() => handleSelectSuggestion("locality", item)} sx={{ px: 1.2, py: 0.95, fontSize: 11.5, color: "#102445", cursor: "pointer", "&:hover": { bgcolor: "#f2f4f8" } }}>
                        {item}
                      </Box>
                    ))
                  ) : locality.trim() ? (
                    <Box sx={{ px: 1.2, py: 1.0, fontSize: 11, color: "#6e8097" }}>No matching locality found</Box>
                  ) : null}
                </Box>
              )}
            </Box>
          )}
          {localityError && <Typography sx={{ mt: 0.5, color: "#ce2d2d", fontSize: 10 }}>{localityError}</Typography>}

          {isLocalitySelected && (
            <Box sx={{ mt: 1.0, width: 256, minHeight: 39, border: "1px solid #7f93af", bgcolor: "white", px: 1.05, py: 0.5, position: "relative" }}>
              <Typography sx={{ fontSize: 9.5, color: "#0f73cb" }}>Sub Locality (Optional)</Typography>
              <InputBase
                value={subLocality}
                onFocus={() => {
                  setActiveField("subLocality");
                  scheduleFetchSuggestions("subLocality", subLocality);
                }}
                onChange={(event) => handleSubLocalityChange(event.target.value)}
                placeholder="Sub Locality"
                sx={{ fontSize: 11.5, color: "#263c5a", width: "100%" }}
              />
              {activeField === "subLocality" && (
                <Box sx={{ position: "absolute", left: -1, right: -1, top: "100%", bgcolor: "white", border: "1px solid #d9e0eb", borderTop: "none", zIndex: 20, maxHeight: 220, overflowY: "auto" }}>
                  {visibleSubLocalitySuggestions.length > 0 ? (
                    visibleSubLocalitySuggestions.map((item, idx) => (
                      <Box key={`${item}-${idx}`} onClick={() => handleSelectSuggestion("subLocality", item)} sx={{ px: 1.2, py: 0.95, fontSize: 11.5, color: "#102445", cursor: "pointer", "&:hover": { bgcolor: "#f2f4f8" } }}>
                        {item}
                      </Box>
                    ))
                  ) : subLocality.trim() ? (
                    <Box sx={{ px: 1.2, py: 1.0, fontSize: 11, color: "#6e8097" }}>No matching sub locality found</Box>
                  ) : null}
                </Box>
              )}
            </Box>
          )}

          {(isLocalitySelected || isSubLocalitySelected || subLocality.trim()) && (
            <Box sx={{ mt: 1.0, width: 256, minHeight: 39, border: "1px solid #7f93af", bgcolor: "white", px: 1.05, py: 0.5, position: "relative" }}>
              <Typography sx={{ fontSize: 9.5, color: "#0f73cb" }}>Apartment / Society</Typography>
              <InputBase
                value={apartmentSociety}
                onFocus={() => {
                  setActiveField("apartmentSociety");
                  scheduleFetchSuggestions("apartmentSociety", apartmentSociety);
                }}
                onChange={(event) => handleApartmentChange(event.target.value)}
                placeholder="Apartment / Society"
                sx={{ fontSize: 11.5, color: "#263c5a", width: "100%" }}
              />
              {activeField === "apartmentSociety" && (
                <Box sx={{ position: "absolute", left: -1, right: -1, top: "100%", bgcolor: "white", border: "1px solid #d9e0eb", borderTop: "none", zIndex: 20, maxHeight: 220, overflowY: "auto" }}>
                  {visibleApartmentSuggestions.length > 0 ? (
                    visibleApartmentSuggestions.map((item, idx) => (
                      <Box key={`${item}-${idx}`} onClick={() => handleSelectSuggestion("apartmentSociety", item)} sx={{ px: 1.2, py: 0.95, fontSize: 11.5, color: "#102445", cursor: "pointer", "&:hover": { bgcolor: "#f2f4f8" } }}>
                        {item}
                      </Box>
                    ))
                  ) : apartmentSociety.trim() ? (
                    <Box sx={{ px: 1.2, py: 1.0, fontSize: 11, color: "#6e8097" }}>No matching apartment/society found</Box>
                  ) : null}
                </Box>
              )}
            </Box>
          )}

          {(apartmentSociety.trim() || isApartmentSelected) && (
            <Box sx={{ mt: 1.0, width: 256, minHeight: 39, border: "1px solid #7f93af", bgcolor: "white", px: 1.05, py: 0.5, display: "flex", alignItems: "center" }}>
              <InputBase
                value={houseNumber}
                onChange={(event) => setHouseNumber(event.target.value)}
                placeholder="House Number"
                sx={{ fontSize: 11.5, color: "#263c5a", width: "100%" }}
              />
            </Box>
          )}

          {status.message && <Alert severity={status.type || "info"} sx={{ mt: 1.0, width: 330, py: 0.2, "& .MuiAlert-message": { fontSize: 12 } }}>{status.message}</Alert>}

          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={isSaving}
            sx={{
              mt: 2.0,
              minWidth: 93,
              height: 41,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12.5,
              bgcolor: "#0f73cb",
              borderRadius: "4px",
              boxShadow: "none",
              px: 2.7,
              "&:hover": { bgcolor: "#0c66b4", boxShadow: "none" },
            }}
          >
            {isSaving ? "Saving..." : "Continue"}
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
            alignSelf: { md: "start" },
          }}
        >
          <Box sx={{ mt: 3.5, mb: 2.5, display: "flex", justifyContent: "center" }}>
            <Box sx={{ width: 120, height: 100, position: "relative", borderRadius: "28px", bgcolor: "#d7d8dd", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box
                sx={{
                  width: 48,
                  height: 56,
                  bgcolor: "#f2be73",
                  borderRadius: "4px",
                  transform: "skew(-20deg)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": { content: '""', position: "absolute", left: 18, top: -5, width: 7, height: 70, bgcolor: "#f6d69b" },
                  "&::after": { content: '""', position: "absolute", left: -10, top: 22, width: 75, height: 7, bgcolor: "#f6d69b", transform: "rotate(30deg)" },
                }}
              />
              <Box sx={{ position: "absolute", right: 18, top: 0, width: 40, height: 50, borderRadius: "20px 20px 20px 0", bgcolor: "#0f73cb", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HomeRoundedIcon sx={{ fontSize: 17, color: "white", transform: "rotate(-45deg)" }} />
              </Box>
            </Box>
          </Box>

          <Typography sx={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, color: "#102445" }}>Why we need an accurate location?</Typography>
          <Typography sx={{ mt: 1.0, textAlign: "center", fontSize: 10.5, color: "#3f5677", lineHeight: 1.35 }}>
            Location is the most important for
            <br />
            Buyer&apos;s. By capturing a detailed location
            <br />
            we ensure we get you genuine enquiries.
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Box
            sx={{
              bgcolor: "#eceef3",
              border: "1px solid #dde2ea",
              borderRadius: "3px",
              px: 1.2,
              py: 1.05,
            }}
          >
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
