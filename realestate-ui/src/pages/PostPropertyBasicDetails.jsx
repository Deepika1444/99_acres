import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Radio,
  Typography,
} from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import Navbar from "../components/Navbar";
import { getAuthToken } from "../utils/authStorage";

const LOOKING_LABELS = {
  sell: "Sell",
  rent_lease: "Rent / Lease",
  pg: "PG",
};

const PROPERTY_OPTIONS = {
  sell: {
    residential: [
      { label: "Flat/Apartment", value: "flat_apartment" },
      { label: "Independent House / Villa", value: "independent_house_villa" },
      { label: "Builder Floor", value: "independent_builder_floor" },
      { label: "Plot / Land", value: "plot_land" },
      { label: "1 RK / Studio Apartment", value: "studio_apartment" },
      { label: "Serviced Apartment", value: "serviced_apartment" },
      { label: "Farmhouse", value: "farmhouse" },
      { label: "Other", value: "other" },
    ],
    commercial: [
      { label: "Office", value: "office" },
      { label: "Retail", value: "retail" },
      { label: "Plot / Land", value: "commercial_land" },
      { label: "Warehouse / Godown", value: "warehouse_godown" },
      { label: "Industrial Shed", value: "industrial_shed" },
      { label: "Other", value: "other" },
    ],
  },
  rent_lease: {
    residential: [
      { label: "Flat/Apartment", value: "flat_apartment" },
      { label: "Independent House / Villa", value: "independent_house_villa" },
      { label: "Builder Floor", value: "independent_builder_floor" },
      { label: "1 RK / Studio Apartment", value: "studio_apartment" },
      { label: "Serviced Apartment", value: "serviced_apartment" },
      { label: "Farmhouse", value: "farmhouse" },
      { label: "Other", value: "other" },
    ],
    commercial: [
      { label: "Office", value: "office" },
      { label: "Retail", value: "retail" },
      { label: "Plot / Land", value: "commercial_land" },
      { label: "Warehouse / Godown", value: "warehouse_godown" },
      { label: "Industrial Shed", value: "industrial_shed" },
      { label: "Other", value: "other" },
    ],
  },
  pg: {
    residential: [
      { label: "Flat/Apartment", value: "flat_apartment" },
      { label: "Independent House / Villa", value: "independent_house_villa" },
      { label: "Builder Floor", value: "independent_builder_floor" },
      { label: "1 RK / Studio Apartment", value: "studio_apartment" },
      { label: "Serviced Apartment", value: "serviced_apartment" },
      { label: "Other", value: "other" },
    ],
    commercial: [],
  },
};

function getDefaultLookingTo(pageType) {
  if (pageType === "sell") return "sell";
  if (pageType === "rent") return "rent_lease";
  return "pg";
}

export default function PostPropertyBasicDetails({ pageType = "post", hydrateFromDraft = false }) {
  const [lookingTo, setLookingTo] = useState(getDefaultLookingTo(pageType));
  const [propertyKind, setPropertyKind] = useState("residential");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const propertyTypes = useMemo(() => {
    return PROPERTY_OPTIONS[lookingTo]?.[propertyKind] || [];
  }, [lookingTo, propertyKind]);

  useEffect(() => {
    if (!hydrateFromDraft) return;
    try {
      const raw = localStorage.getItem("postPropertyBasicDetails");
      if (!raw) return;
      const saved = JSON.parse(raw);
      const nextLookingTo =
        saved?.lookingTo && LOOKING_LABELS[saved.lookingTo] ? saved.lookingTo : getDefaultLookingTo(pageType);
      const nextPropertyKind =
        saved?.propertyKind === "commercial" && nextLookingTo !== "pg" ? "commercial" : "residential";
      setLookingTo(nextLookingTo);
      setPropertyKind(nextPropertyKind);
      setSelectedSubType(String(saved?.propertySubType || "").trim());
    } catch {
      // Ignore malformed draft data.
    }
  }, [pageType, hydrateFromDraft]);

  const handleLookingToChange = (value) => {
    setLookingTo(value);
    setPropertyKind("residential");
    setSelectedSubType("");
    setStatus({ type: "", message: "" });
  };

  const handlePropertyKindChange = (value) => {
    if (lookingTo === "pg" && value === "commercial") return;
    setPropertyKind(value);
    setSelectedSubType("");
    setStatus({ type: "", message: "" });
  };

  const handleContinue = async () => {
    if (!selectedSubType) {
      setStatus({ type: "error", message: "Please select property type to continue." });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setStatus({ type: "error", message: "Login token missing. Please login again." });
      return;
    }

    try {
      setIsSaving(true);
      setStatus({ type: "", message: "" });
      const existingPropertyId = String(localStorage.getItem("postPropertyId") || "").trim();

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const requestBasicDetails = async (propertyIdToUse = "") => {
        const response = await fetch(`${apiBaseUrl}/api/properties/basic-details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...(propertyIdToUse ? { propertyId: propertyIdToUse } : {}),
            lookingTo,
            propertyKind,
            propertySubType: selectedSubType,
            completionPercent: propertyScorePercent,
          }),
        });
        const result = await response.json().catch(() => ({}));
        return { response, result };
      };

      let { response, result } = await requestBasicDetails(existingPropertyId);

      // If stale local propertyId points to a deleted DB record, clear draft and create fresh.
      if (!response.ok && existingPropertyId) {
        const msg = String(result?.message || "").toLowerCase();
        const staleIdError = response.status === 404 || msg.includes("not found");
        if (staleIdError) {
          [
            "postPropertyId",
            "previewPropertyId",
            "postPropertyEditMode",
            "postPropertyLocationDetails",
            "postPropertyProfileDetails",
            "postPropertyMediaDetails",
            "postPropertyAmenitiesDetails",
          ].forEach((key) => localStorage.removeItem(key));
          ({ response, result } = await requestBasicDetails(""));
        }
      }

      if (!response.ok) {
        setStatus({ type: "error", message: result?.message || "Unable to save basic details." });
        return;
      }
      const propertyId = String(result?.data?.propertyId || "").trim();
      if (propertyId) {
        localStorage.setItem("postPropertyId", propertyId);
      }
      localStorage.setItem(
        "postPropertyBasicDetails",
        JSON.stringify({
          lookingTo,
          propertyKind,
          propertySubType: selectedSubType,
        })
      );

      setStatus({ type: "success", message: "Basic details saved successfully." });
      window.setTimeout(() => {
        window.location.href = `/post-property-location-details?type=${encodeURIComponent(pageType)}`;
      }, 260);
    } catch {
      setStatus({ type: "error", message: "Unable to connect to server." });
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { title: "Basic Details", step: "Step 1" },
    { title: "Location Details", step: "Step 2", editPath: "/post-property-location-details" },
    { title: "Property Profile", step: "Step 3" },
    { title: "Photos, Videos & Voice-over", step: "Step 4" },
    { title: "Pricing & Others", step: "Step 5" },
  ];

  const propertyScorePercent = selectedSubType ? 12 : 0;

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
          <Box
            sx={{
              bgcolor: "#eceef3",
              border: "1px solid #e0e4ec",
              borderRadius: "10px",
              px: 2.15,
              py: 2.05,
              minHeight: 286,
            }}
          >
            {steps.map((item, index) => (
              <Box key={item.title} sx={{ display: "flex", alignItems: "flex-start", gap: 1.15, position: "relative", pb: index === steps.length - 1 ? 0 : 1.75 }}>
                <Box sx={{ position: "relative", width: 16, height: 28, display: "flex", justifyContent: "center" }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "1px solid #6792c8",
                      bgcolor: index === 0 ? "#0f73cb" : "transparent",
                    }}
                  />
                  {index !== steps.length - 1 && <Box sx={{ position: "absolute", top: 15, width: "1px", height: 25, bgcolor: "#c8d6ea" }} />}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 9.5, color: "#102445", lineHeight: 1.15, fontWeight: 400 }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: 10, color: "#8394ac", mt: 0.2 }}>
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

          <Box
            sx={{
              mt: 2.2,
              bgcolor: "#eceef3",
              border: "1px solid #e0e4ec",
              borderRadius: "10px",
              px: 2.1,
              py: 2.1,
              display: "flex",
              alignItems: "center",
              gap: 1.6,
            }}
          >
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
                  fontSize: 20 / 2,
                  fontWeight: 700,
                }}
              >
                {propertyScorePercent}%
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#102445", lineHeight: 1.2 }}>Property Score</Typography>
              <Typography sx={{ fontSize: 11, color: "#7f90a7", lineHeight: 1.3, mt: 0.2 }}>
                Better your property score,
                <br />
                greater your visibility
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderLeft: { md: "1px solid #e4e7ed" }, borderRight: { md: "1px solid #e4e7ed" }, px: { xs: 2, md: 2.4 }, pt: { xs: 2.5, md: 2.9 } }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#102445", mb: 2.35, letterSpacing: "-0.1px" }}>
            Fill out these basic details
          </Typography>

          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#102445", mb: 1.05 }}>I&apos;m looking to</Typography>
          <Box sx={{ display: "flex", gap: 0.6, mb: 2.65 }}>
            {Object.keys(LOOKING_LABELS).map((option) => (
              <Chip
                key={option}
                label={LOOKING_LABELS[option]}
                variant="outlined"
                onClick={() => handleLookingToChange(option)}
                sx={{
                  borderRadius: "18px",
                  height: 28,
                  cursor: "pointer",
                  fontSize: 11.5,
                  borderColor: lookingTo === option ? "#1b84dd" : "#ccd4df",
                  color: lookingTo === option ? "#0f73cb" : "#243a58",
                  bgcolor: lookingTo === option ? "#ecf6ff" : "transparent",
                  "& .MuiChip-label": { px: 1.35 },
                }}
              />
            ))}
          </Box>

          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#102445", mb: 0.8 }}>
            What kind of property do you have?
          </Typography>
          <Box sx={{ display: "flex", gap: 1.35, mb: 1.2 }}>
            {[
              { label: "Residential", value: "residential" },
              { label: "Commercial", value: "commercial" },
            ].map((option) => {
              const disabled = lookingTo === "pg" && option.value === "commercial";
              return (
                <Box
                  key={option.value}
                  onClick={() => !disabled && handlePropertyKindChange(option.value)}
                  sx={{ display: "inline-flex", alignItems: "center", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.58 : 1 }}
                >
                  <Radio
                    checked={propertyKind === option.value}
                    disabled={disabled}
                    size="small"
                    sx={{
                      p: 0.2,
                      mr: 0.3,
                      color: propertyKind === option.value ? "#0f73cb" : "#9dacbf",
                      "&.Mui-checked": { color: "#0f73cb" },
                      "& .MuiSvgIcon-root": { fontSize: 20 },
                    }}
                  />
                  <Typography sx={{ fontSize: 12.5, color: "#203b5e" }}>{option.label}</Typography>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mb: 2.1 }}>
            {propertyTypes.map((type) => (
              <Chip
                key={type.value}
                label={type.label}
                variant="outlined"
                onClick={() => setSelectedSubType(type.value)}
                sx={{
                  borderRadius: "17px",
                  height: 28,
                  fontSize: 11.5,
                  cursor: "pointer",
                  borderColor: selectedSubType === type.value ? "#1b84dd" : "#ccd4df",
                  color: selectedSubType === type.value ? "#0f73cb" : "#243a58",
                  bgcolor: selectedSubType === type.value ? "#ecf6ff" : "transparent",
                  "& .MuiChip-label": { px: 1.12 },
                }}
              />
            ))}
          </Box>

          {status.message && (
            <Alert severity={status.type || "info"} sx={{ mb: 1.3, py: 0.25, "& .MuiAlert-message": { fontSize: 12 } }}>
              {status.message}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={isSaving}
            sx={{
              minWidth: 93,
              height: 41,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13.5,
              bgcolor: "#0f73cb",
              borderRadius: "4px",
              boxShadow: "none",
              px: 2.7,
              "&:hover": { bgcolor: "#0c66b4", boxShadow: "none" },
            }}
          >
            {isSaving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Continue"}
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
          <NotificationsNoneRoundedIcon sx={{ color: "#556c8c", fontSize: 19 }} />
          <Typography sx={{ mt: 0.6, fontSize: 12, color: "#102445", fontWeight: 780, lineHeight: 1.22, letterSpacing: 0.2 }}>
            LIMITED-TIME RESIDENTIAL &
            <br />
            COMMERCIAL OFFERS
          </Typography>

          <Box sx={{ mt: 1.4, bgcolor: "white", border: "1px solid #dce3ee", borderTop: "3px solid #1579d7", borderRadius: "8px", p: 1.55, position: "relative" }}>
            <Box sx={{ position: "absolute", top: -3, right: 12, width: 2, height: 14, bgcolor: "#1579d7", transform: "rotate(18deg)" }} />
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 11,
                bgcolor: "#1a7bd8",
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1,
                px: 0.85,
                py: 0.55,
                borderRadius: "2px",
                transform: "rotate(-6deg)",
              }}
            >
              RENT
            </Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#102445", mb: 0.95 }}>On Rent/Lease</Typography>
            <Typography sx={{ fontSize: 12, color: "#134985", lineHeight: 1.35, mb: 0.25 }}>75% off for rent upto ₹15,000</Typography>
            <Typography sx={{ fontSize: 12, color: "#134985", lineHeight: 1.35 }}>50% off for rent above ₹15,000</Typography>
          </Box>

          <Box sx={{ mt: 1.65, bgcolor: "white", border: "1px solid #dce3ee", borderTop: "3px solid #b426cc", borderRadius: "8px", p: 1.55, position: "relative" }}>
            <Box sx={{ position: "absolute", top: -3, right: 12, width: 2, height: 14, bgcolor: "#b426cc", transform: "rotate(18deg)" }} />
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 11,
                bgcolor: "#b426cc",
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1,
                px: 0.85,
                py: 0.55,
                borderRadius: "2px",
                transform: "rotate(6deg)",
              }}
            >
              SALE
            </Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#102445", mb: 0.95 }}>Resale offers</Typography>
            <Typography sx={{ fontSize: 12, color: "#134985", lineHeight: 1.35 }}>
              50% off for price up to ₹50 Lakh
            </Typography>
          </Box>

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
              <Typography sx={{ fontSize: 13.5 }}>Need help ?</Typography>
            </Box>
            <Divider sx={{ my: 0.55, borderColor: "#dce2eb" }} />
            <Typography sx={{ fontSize: 11.5, color: "#6c7f98", lineHeight: 1.45 }}>
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
