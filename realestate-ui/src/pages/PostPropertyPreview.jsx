import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Navbar from "../components/Navbar";
import { getAuthToken, getAuthUser, getUserInitials } from "../utils/authStorage";
import { isPropertyShortlisted, toggleShortlistedProperty } from "../utils/shortlistStorage";

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return "";
}

function formatPrice(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "Price on request";
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function normalizePreview(source) {
  const location = source?.locationDetails || source?.location || {};
  const profile = source?.propertyProfile || source?.profile || {};
  const pricing = source?.pricingDetails || source?.pricing || {};
  const priceDetails = pricing?.priceDetails || source?.priceDetails || {};
  const areaDetails = profile?.areaDetails || {};
  const roomDetails = profile?.roomDetails || {};
  const additionalDetails = profile?.additionalDetails || {};
  const mediaDetails = source?.mediaDetails || {};
  const photos = Array.isArray(mediaDetails?.photos)
    ? mediaDetails.photos.filter((item) => String(item?.url || "").trim())
    : [];
  const coverPhoto =
    photos.find((item) => Boolean(item?.isCover) && String(item?.url || "").trim()) ||
    photos[0] ||
    null;

  const city = String(pickFirst(location?.city, source?.city)).trim();
  const locality = String(pickFirst(location?.locality, source?.locality)).trim();
  const subLocality = String(pickFirst(location?.subLocality, source?.subLocality)).trim();

  const expectedPrice = Number(pickFirst(priceDetails?.expectedPrice, source?.expectedPrice, source?.price, 0));
  const bedrooms = Number(pickFirst(roomDetails?.bedrooms, source?.bedrooms, 2));
  const bathrooms = Number(pickFirst(roomDetails?.bathrooms, source?.bathrooms, 2));
  const balconies = Number(pickFirst(roomDetails?.balconies, source?.balconies, 1));
  const carpetArea = Number(
    pickFirst(areaDetails?.carpetArea?.value, source?.carpetArea, source?.builtUpArea, 1200)
  );
  const carpetUnit = String(pickFirst(areaDetails?.carpetArea?.unit, "sq.ft."));
  const totalFloors = String(pickFirst(profile?.totalFloors, source?.totalFloors, 12));
  const propertyOnFloor = String(pickFirst(profile?.propertyOnFloor, source?.propertyOnFloor, 6));
  const pricePerSqft = Number(
    pickFirst(priceDetails?.pricePerSqft, carpetArea > 0 ? expectedPrice / carpetArea : 0)
  );
  const superBuiltUpArea = Number(
    pickFirst(areaDetails?.superBuiltUpArea?.value, areaDetails?.builtUpArea?.value, source?.builtUpArea, carpetArea)
  );
  const societyName = String(
    pickFirst(location?.apartmentSociety, source?.apartmentSociety, "Property Listing")
  ).trim();
  const furnishing = String(pickFirst(profile?.furnishing, source?.furnishing, "Furnished")).trim();
  const ownership = String(pickFirst(profile?.ownershipType, source?.ownershipType, "Leasehold")).trim();
  const facing = String(pickFirst(additionalDetails?.facing, profile?.facing, source?.facing, "North-East")).trim();
  const overlooking = String(
    pickFirst(additionalDetails?.overlooking, profile?.overlooking, source?.overlooking, "Park/Garden")
  ).trim();
  const propertyAge = String(pickFirst(profile?.ageOfProperty, source?.ageOfProperty, "1 to 5 Year Old")).trim();
  const parking = String(pickFirst(additionalDetails?.parking, profile?.parking, source?.parking, "1 Covered")).trim();
  const flooring = String(pickFirst(additionalDetails?.flooringType, profile?.flooringType, source?.flooringType, "Marble")).trim();
  const powerBackup = String(
    pickFirst(additionalDetails?.powerBackup, profile?.powerBackup, source?.powerBackup, "Partial")
  ).trim();

  return {
    propertyId: String(pickFirst(source?.propertyId, source?._id, localStorage.getItem("postPropertyId"))).trim(),
    priceText: formatPrice(expectedPrice),
    emiText: `Estimated EMI Rs ${Math.max(0, Math.round(expectedPrice * 0.03)).toLocaleString("en-IN")}`,
    pricePerSqftText: pricePerSqft > 0 ? `@ ${Math.round(pricePerSqft).toLocaleString("en-IN")} per sq.ft.` : "",
    headerTitle: `${bedrooms}BHK ${bathrooms} Bath`,
    subTitle: "Flat/Apartment for Sale",
    city,
    addressLine: [subLocality, locality, city].filter(Boolean).join(", ") || "Address not available",
    postedDate: new Date(pickFirst(source?.createdAt, source?.updatedAt, Date.now())).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    constructionStatus: String(pickFirst(profile?.availabilityStatus, "Under Construction")),
    carpetAreaText: `${carpetArea} ${carpetUnit}`,
    superBuiltUpAreaText: `${superBuiltUpArea} sq.ft.`,
    carpetAreaSqmText: `${(carpetArea * 0.092903).toFixed(2)} sq.m.`,
    configText: `${bedrooms} Bedrooms, ${bathrooms} Bathrooms, ${balconies} Balconies`,
    floorText: `${propertyOnFloor} of ${totalFloors} Floors`,
    possessionText: String(pickFirst(profile?.possessionBy, profile?.ageOfProperty, "")),
    societyName,
    furnishing,
    ownership,
    facing,
    overlooking,
    propertyAge,
    parking,
    flooring,
    powerBackup,
    photos,
    heroImageUrl: String(pickFirst(source?.coverImageUrl, source?.image, coverPhoto?.url)).trim(),
  };
}

export default function PostPropertyPreview() {
  const [preview, setPreview] = useState(() => normalizePreview({}));
  const [rawProperty, setRawProperty] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [enquiryUserType, setEnquiryUserType] = useState("Individual");
  const [enquiryReason, setEnquiryReason] = useState("");
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("I am interested in this Property.");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const sectionRefs = useRef({});
  const owner = getAuthUser();
  const ownerName = String(owner?.fullName || owner?.name || "Owner").trim() || "Owner";
  const ownerInitials = getUserInitials(owner, "O");
  const ownerPhone = String(pickFirst(owner?.phoneNumber, owner?.phone, owner?.mobileNumber, "9108428543")).trim();
  const ownerEmail = String(pickFirst(owner?.email, "owner@example.com")).trim();

  useEffect(() => {
    setEnquiryName(ownerName);
    setEnquiryPhone(ownerPhone);
  }, [ownerName, ownerPhone]);

  const propertyId = useMemo(() => {
    return String(localStorage.getItem("previewPropertyId") || localStorage.getItem("postPropertyId") || "").trim();
  }, []);

  const breadcrumbText = useMemo(() => {
    const cityName = preview.city || "Bangalore";
    return `Home > Property in ${cityName} > Flats for sale in ${cityName} > ${preview.headerTitle} Flat/Apartment for Sell`;
  }, [preview.city, preview.headerTitle]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const token = getAuthToken();
      if (!token || !propertyId) {
        setErrorMessage("Missing property details for preview.");
        return;
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const paths = [
        `/api/properties/${encodeURIComponent(propertyId)}`,
        `/api/properties/details/${encodeURIComponent(propertyId)}`,
        `/api/properties/property-details/${encodeURIComponent(propertyId)}`,
      ];

      let lastError = "";
      for (const path of paths) {
        try {
          const response = await fetch(`${apiBaseUrl}${path}`, {
            method: "GET",
            cache: "no-store",
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) {
            lastError = result?.message || `Failed to load from ${path}`;
            continue;
          }
          const payload = result?.data || result?.property || result || {};
          if (!payload || typeof payload !== "object") continue;
          if (!cancelled) {
            const normalized = normalizePreview(payload);
            setPreview(normalized);
            setRawProperty(payload);
            setIsShortlisted(isPropertyShortlisted(normalized.propertyId));
            setErrorMessage("");
          }
          return;
        } catch {
          lastError = `Unable to load from ${path}`;
        }
      }

      if (!cancelled) {
        setPreview(normalizePreview({}));
        setErrorMessage(lastError || "Unable to load preview details from DB.");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const handleShortlistClick = () => {
    const result = toggleShortlistedProperty({
      propertyId: preview.propertyId,
      title: preview.headerTitle,
      address: preview.addressLine,
      priceText: preview.priceText,
      imageUrl: preview.heroImageUrl,
      city: preview.city,
      postedDate: preview.postedDate,
    });
    setIsShortlisted(result.shortlisted);
    window.location.href = "/post-property/shortlist-property";
  };

  const persistEditDraftFromDb = () => {
    const source = rawProperty && typeof rawProperty === "object" ? rawProperty : {};
    const basic = source?.basicDetails || source?.basic || {};
    const location = source?.locationDetails || source?.location || {};
    const profile = source?.propertyProfile || source?.profile || {};
    const media = source?.mediaDetails || {};
    const amenities = source?.amenitiesDetails || source?.amenities || {};

    const propertyIdForEdit = String(
      source?.propertyId || source?._id || preview.propertyId || localStorage.getItem("postPropertyId") || ""
    ).trim();
    if (propertyIdForEdit) {
      localStorage.setItem("postPropertyId", propertyIdForEdit);
    }

    localStorage.setItem(
      "postPropertyBasicDetails",
      JSON.stringify({
        lookingTo: String(basic?.lookingTo || "sell"),
        propertyKind: String(basic?.propertyKind || "residential"),
        propertySubType: String(basic?.propertySubType || "flat_apartment"),
      })
    );

    localStorage.setItem(
      "postPropertyLocationDetails",
      JSON.stringify({
        city: String(location?.city || "").trim(),
        locality: String(location?.locality || "").trim(),
        subLocality: String(location?.subLocality || "").trim(),
        apartmentSociety: String(location?.apartmentSociety || "").trim(),
        houseNumber: String(location?.houseNumber || "").trim(),
      })
    );

    if (Object.keys(profile).length > 0) {
      localStorage.setItem("postPropertyProfileDetails", JSON.stringify(profile));
    }
    if (Object.keys(media).length > 0) {
      localStorage.setItem("postPropertyMediaDetails", JSON.stringify(media));
    }
    if (Object.keys(amenities).length > 0) {
      localStorage.setItem("postPropertyAmenitiesDetails", JSON.stringify(amenities));
    }
    localStorage.setItem("postPropertyEditMode", "1");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const target = sectionRefs.current[tab];
    if (!target) return;
    const navbarOffset = window.innerWidth >= 900 ? 112 : 102;
    const top = target.getBoundingClientRect().top + window.scrollY - navbarOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleSendEnquiry = () => {
    if (!acceptTerms) {
      setErrorMessage("Please accept Terms & Conditions and Privacy Policy.");
      return;
    }

    if (!ownerEmail) {
      setErrorMessage("Owner email is not available.");
      return;
    }

    const subject = `Property enquiry for ${preview.headerTitle} in ${preview.city || "your listing"}`;
    const body = [
      `Hello ${ownerName},`,
      "",
      "I am interested in your property listing.",
      "",
      `Property: ${preview.headerTitle}`,
      `Address: ${preview.addressLine}`,
      `Price: ${preview.priceText}`,
      `Buyer type: ${enquiryUserType}`,
      `Reason to buy: ${enquiryReason || "Not specified"}`,
      "",
      "Buyer details:",
      `Name: ${enquiryName}`,
      `Phone: ${enquiryPhone}`,
      "",
      "Message:",
      enquiryMessage,
    ].join("\n");

    setErrorMessage("");
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(ownerEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff", fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif' }}>
      <Navbar sticky />

      <Box sx={{ mt: { xs: "56px", md: "64px" } }}>
        <Box sx={{ bgcolor: "white", borderBottom: "1px solid #dce2eb", px: { xs: 1.2, md: 3.6 }, py: 1.0, display: "flex", alignItems: "center", justifyContent: "space-between", color: "#5b6a7e" }}>
          <Box sx={{ fontSize: { xs: 11, md: 14 } }}>
            {breadcrumbText}
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1.3, fontSize: 14 }}>
            <span>Posted on {preview.postedDate}</span>
            <span>|</span>
            <span>{preview.constructionStatus}</span>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 1.2, md: 3.6 }, py: { xs: 1.0, md: 1.6 }, maxWidth: 1080, mx: "auto" }}>
          <Box sx={{ border: "1px solid #d9cb84", bgcolor: "#fff9db", color: "#86733b", fontSize: 10.5, px: 1.0, py: 0.45 }}>
            Under Review: Some information mentioned on this page is under review by 99acres.
          </Box>

          <Box sx={{ mt: 1.2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 170px" }, gap: { xs: 1.2, md: 1.6 } }}>
            <Box>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "165px 1fr" }, gap: 1.0 }}>
                <Box>
                  <Typography sx={{ color: "#5a5f67", fontSize: { xs: 26 / 2, md: 24 }, fontWeight: 800 }}>
                    {preview.priceText}
                  </Typography>
                  <Typography sx={{ mt: 0.15, color: "#7a8089", fontSize: { xs: 12, md: 14 } }}>
                    {preview.pricePerSqftText}
                  </Typography>
                  <Typography sx={{ mt: 0.25, color: "#1d82c7", fontSize: { xs: 12, md: 12 }, fontWeight: 700 }}>
                    {preview.emiText}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#565b63", fontSize: { xs: 26 / 2, md: 22 }, fontWeight: 500 }}>
                    {preview.headerTitle}
                  </Typography>
                  <Typography sx={{ mt: 0.15, color: "#6d737d", fontSize: { xs: 13, md: 14 } }}>
                    {preview.subTitle}
                  </Typography>
                  <Typography sx={{ mt: 0.25, color: "#848992", fontSize: { xs: 12, md: 12 } }}>
                    in {preview.societyName}, {preview.addressLine}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 1.05, display: "flex", alignItems: "center", gap: 0.7, flexWrap: "wrap" }}>
                <Box sx={{ bgcolor: "#11a37f", color: "white", px: 0.85, py: 0.22, fontSize: 10, fontWeight: 700 }}>
                  RERA STATUS
                </Box>
                <Box sx={{ border: "1px solid #c7d7cf", color: "#4a7869", px: 0.85, py: 0.2, fontSize: 10, fontWeight: 700 }}>
                  REGISTERED
                </Box>
                <Typography sx={{ color: "#767d86", fontSize: 10.5, display: { xs: "none", md: "block" } }}>
                  | Website: https://rera.karnataka.gov.in/
                </Typography>
              </Box>
            </Box>

            <Box sx={{ maxWidth: { md: 170 } }}>
              <Button
                variant="contained"
                onClick={() => {
                  persistEditDraftFromDb();
                  window.open("/post-property/primary-details", "_blank", "noopener,noreferrer");
                }}
                sx={{ width: "100%", height: { xs: 42, md: 32 }, textTransform: "none", bgcolor: "#63c6b8", fontWeight: 700, fontSize: { xs: 13, md: 12 }, borderRadius: 0, boxShadow: "none", "&:hover": { bgcolor: "#4db5a6", boxShadow: "none" } }}
              >
                Edit property
              </Button>
              <Button
                variant="outlined"
                onClick={handleShortlistClick}
                startIcon={isShortlisted ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                sx={{
                  mt: 1.0,
                  width: "100%",
                  height: { xs: 42, md: 32 },
                  textTransform: "none",
                  color: isShortlisted ? "#df5b67" : "#3a76ba",
                  borderColor: isShortlisted ? "#d9a6ae" : "#8ab2d8",
                  fontWeight: 700,
                  fontSize: { xs: 13, md: 12 },
                  borderRadius: 0,
                  bgcolor: isShortlisted ? "#fff5f7" : "transparent",
                }}
              >
                {isShortlisted ? "Shortlisted" : "Shortlist"}
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 1.0,
              position: "sticky",
              top: { xs: "56px", md: "64px" },
              zIndex: 8,
              bgcolor: "#ffffff",
              pt: 0.15,
              borderBottom: "1px solid #dce2eb",
              display: "flex",
              gap: { xs: 1.2, md: 2.4 },
              fontSize: { xs: 12, md: 12 },
              color: "#4b4f58",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {["Overview", "Society", "Owner Details", "Price Trends", "Society Reviews", "Explore Locality"].map((tab) => (
              <Box
                key={tab}
                onClick={() => handleTabClick(tab)}
                sx={{
                  pb: 0.8,
                  pt: 0.2,
                  cursor: "pointer",
                  color: activeTab === tab ? "#2d93d4" : "#4b4f58",
                  fontWeight: activeTab === tab ? 700 : 400,
                  borderBottom: activeTab === tab ? "2px solid #2d93d4" : "2px solid transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.25,
                }}
              >
                {tab}
                {tab === "Explore Locality" ? <ChevronRightRoundedIcon sx={{ fontSize: 14 }} /> : null}
              </Box>
            ))}
          </Box>

          <Box ref={(node) => { sectionRefs.current.Overview = node; }} sx={{ mt: 1.45, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "355px 1fr" }, gap: 1.2 }}>
            <Box sx={{ border: "1px solid #d8dde7", borderRadius: "10px", overflow: "hidden", bgcolor: "white" }}>
              <Box sx={{ bgcolor: "#303743", color: "white", px: 1.2, py: 0.9, display: "flex", gap: 2.0, fontSize: 12 }}>
                <Box sx={{ fontWeight: 700 }}>Property ({preview.photos.length})</Box>
                <Box sx={{ fontWeight: 700 }}>Society (1)</Box>
              </Box>
              <Box sx={{ height: { xs: 220, md: 300 }, bgcolor: "#9ea8ba", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <Box
                  onClick={handleShortlistClick}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.95)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                >
                  {isShortlisted ? (
                    <FavoriteRoundedIcon sx={{ fontSize: 20, color: "#e05463" }} />
                  ) : (
                    <FavoriteBorderRoundedIcon sx={{ fontSize: 20, color: "#4f6078" }} />
                  )}
                </Box>
                {preview.heroImageUrl ? (
                  <Box
                    component="img"
                    src={preview.heroImageUrl}
                    alt="Property"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <ApartmentRoundedIcon sx={{ fontSize: 110, color: "#6f7f95" }} />
                )}
              </Box>
            </Box>

            <Box sx={{ border: "1px solid #e1e5ec", borderRadius: "16px", bgcolor: "#fff", p: { xs: 1.2, md: 1.4 } }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, columnGap: 2.0 }}>
                <Box sx={{ py: 0.9, borderBottom: "1px solid #edf0f4" }}>
                  <Typography sx={{ color: "#8a8f97", fontSize: 11, display: "flex", alignItems: "center", gap: 0.6 }}>
                    <StraightenRoundedIcon sx={{ fontSize: 16 }} /> Area
                  </Typography>
                  <Typography sx={{ mt: 0.45, color: "#3d434d", fontSize: 13, fontWeight: 600 }}>
                    Super Built-up area {preview.superBuiltUpAreaText}
                  </Typography>
                  <Typography sx={{ mt: 0.2, color: "#696f79", fontSize: 12 }}>Carpet area: {preview.carpetAreaText}</Typography>
                </Box>
                <Box sx={{ py: 0.9, borderBottom: "1px solid #edf0f4" }}>
                  <Typography sx={{ color: "#8a8f97", fontSize: 11, display: "flex", alignItems: "center", gap: 0.6 }}>
                    <ApartmentRoundedIcon sx={{ fontSize: 16 }} /> Configuration
                  </Typography>
                  <Typography sx={{ mt: 0.45, color: "#3d434d", fontSize: 13, fontWeight: 600 }}>
                    {preview.configText}
                  </Typography>
                </Box>
                <Box sx={{ py: 0.9, borderBottom: "1px solid #edf0f4" }}>
                  <Typography sx={{ color: "#8a8f97", fontSize: 11, display: "flex", alignItems: "center", gap: 0.6 }}>
                    <CurrencyRupeeRoundedIcon sx={{ fontSize: 16 }} /> Price
                  </Typography>
                  <Typography sx={{ mt: 0.45, color: "#3d434d", fontSize: 13, fontWeight: 600 }}>
                    {preview.priceText}
                  </Typography>
                  <Typography sx={{ mt: 0.2, color: "#696f79", fontSize: 12 }}>{preview.pricePerSqftText}</Typography>
                </Box>
                <Box sx={{ py: 0.9, borderBottom: "1px solid #edf0f4" }}>
                  <Typography sx={{ color: "#8a8f97", fontSize: 11, display: "flex", alignItems: "center", gap: 0.6 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16 }} /> Address
                  </Typography>
                  <Typography sx={{ mt: 0.45, color: "#3d434d", fontSize: 13, fontWeight: 600 }}>
                    {preview.societyName}
                  </Typography>
                  <Typography sx={{ mt: 0.2, color: "#696f79", fontSize: 12 }}>{preview.addressLine}</Typography>
                </Box>
                <Box sx={{ py: 0.9 }}>
                  <Typography sx={{ color: "#8a8f97", fontSize: 11 }}>
                    Floor Number
                  </Typography>
                  <Typography sx={{ mt: 0.45, color: "#3d434d", fontSize: 13, fontWeight: 600 }}>
                    {preview.floorText}
                  </Typography>
                </Box>
                <Box sx={{ py: 0.9 }}>
                  <Typography sx={{ color: "#8a8f97", fontSize: 11, display: "flex", alignItems: "center", gap: 0.6 }}>
                    <CalendarTodayRoundedIcon sx={{ fontSize: 16 }} /> Property Age
                  </Typography>
                  <Typography sx={{ mt: 0.45, color: "#3d434d", fontSize: 13, fontWeight: 600 }}>
                    {preview.propertyAge}
                  </Typography>
                </Box>
                <Box sx={{ py: 0.9, borderTop: "1px solid #edf0f4" }}>
                  <Typography sx={{ color: "#8a8f97", fontSize: 11 }}>
                    Overlooking
                  </Typography>
                  <Typography sx={{ mt: 0.45, color: "#3d434d", fontSize: 13, fontWeight: 600 }}>
                    {preview.overlooking}
                  </Typography>
                </Box>
                <Box sx={{ py: 0.9, borderTop: "1px solid #edf0f4" }}>
                  <Typography sx={{ color: "#8a8f97", fontSize: 11 }}>
                    Facing
                  </Typography>
                  <Typography sx={{ mt: 0.45, color: "#3d434d", fontSize: 13, fontWeight: 600 }}>
                    {preview.facing}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 1.2, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(6, 1fr)" }, gap: 1.0, color: "#686e78", fontSize: 12 }}>
            <Box><b>Transaction Type:</b> Resale</Box>
            <Box><b>Property Ownership:</b> {preview.ownership}</Box>
            <Box><b>Flooring:</b> {preview.flooring}</Box>
            <Box><b>Furnishing:</b> {preview.furnishing}</Box>
            <Box><b>Parking:</b> {preview.parking}</Box>
            <Box><b>Power Backup:</b> {preview.powerBackup}</Box>
          </Box>

          <Box sx={{ mt: 1.45, borderTop: "1px solid #d9dde5" }} />
          <Box ref={(node) => { sectionRefs.current.Society = node; }} sx={{ mt: 1.55, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 270px" }, gap: 2.0, alignItems: "start" }}>
            <Box>
              <Typography sx={{ color: "#4f5560", fontSize: 15, fontWeight: 400 }}>Society</Typography>
              <Typography sx={{ mt: 1.0, color: "#2a80c9", fontSize: 18 / 2, display: "inline-flex", alignItems: "center", gap: 0.25 }}>
                {preview.societyName}
                <ChevronRightRoundedIcon sx={{ fontSize: 14, transform: "rotate(-45deg)" }} />
              </Typography>
              <Box sx={{ mt: 0.8, borderBottom: "1px solid #dfe3ea" }} />
              <Typography sx={{ mt: 1.0, color: "#6c7480", fontSize: 12 }}>
                Additional Detail: Developed / built by {preview.societyName}.
              </Typography>

              <Button
                variant="outlined"
                sx={{
                  mt: 5.4,
                  minWidth: 138,
                  height: 30,
                  borderRadius: 0,
                  textTransform: "none",
                  color: "#2a80c9",
                  borderColor: "#2a80c9",
                  fontSize: 11,
                  fontWeight: 700,
                  justifyContent: "flex-start",
                }}
              >
                Download Brochure
              </Button>
            </Box>

            <Box>
              <Box sx={{ mt: 0.2, position: "relative", border: "1px solid #d7dce6", bgcolor: "#eef2f7", width: "100%" }}>
                {preview.heroImageUrl ? (
                  <Box component="img" src={preview.heroImageUrl} alt={preview.societyName || "Society"} sx={{ width: "100%", height: 154, objectFit: "cover" }} />
                ) : (
                  <Box sx={{ height: 154, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ApartmentRoundedIcon sx={{ fontSize: 88, color: "#6f7f95" }} />
                  </Box>
                )}
                <Box sx={{ position: "absolute", right: 0, bottom: 0, bgcolor: "black", color: "white", px: 0.8, py: 0.35, fontSize: 11, fontWeight: 700 }}>
                  Photo 1
                </Box>
              </Box>
            </Box>
          </Box>

          <Box ref={(node) => { sectionRefs.current["Owner Details"] = node; }} sx={{ mt: 1.45, borderTop: "1px solid #d9dde5", pt: 1.35 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px 1fr" }, gap: 3.2, alignItems: "start" }}>
              <Box>
                <Typography sx={{ color: "#575d67", fontSize: 14, fontWeight: 700 }}>Owner Details</Typography>
                <Box sx={{ mt: 1.3, display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                  <Box sx={{ width: 96, height: 96, borderRadius: "8px", bgcolor: "#eef3f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#d4e6d6", color: "#2f7b2f", fontWeight: 700, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {ownerInitials}
                    </Box>
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#2c89d0", fontSize: 18 / 2, fontWeight: 700 }}>{ownerName}</Typography>
                    <Typography sx={{ mt: 0.2, color: "#6c7480", fontSize: 12 }}>Owner</Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    mt: 1.1,
                    width: 115,
                    height: 27,
                    bgcolor: "#62c6b7",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  View Phone Number
                </Box>

                <Typography sx={{ mt: 1.2, color: "#4f5560", fontSize: 12, fontWeight: 700 }}>About {ownerName}</Typography>
                <Typography sx={{ mt: 0.35, color: "#6c7480", fontSize: 12 }}>
                  {ownerName} is the owner for this property listing.
                </Typography>
                <Typography sx={{ mt: 0.85, color: "#6c7480", fontSize: 12 }}>
                  Address : {preview.addressLine}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ color: "#8a8f97", fontSize: 13, fontWeight: 700 }}>Send enquiry to Owner</Typography>
                <Box sx={{ mt: 1.05, display: "grid", gap: 0.75, maxWidth: 520 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", color: "#6c7480", fontSize: 12 }}>
                    <Typography component="span" sx={{ color: "#6c7480", fontSize: 12 }}>You are</Typography>
                    <Box component="label" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}>
                      <Box component="input" type="radio" name="enquiryUserType" checked={enquiryUserType === "Individual"} onChange={() => setEnquiryUserType("Individual")} sx={{ accentColor: "#65c8b8" }} />
                      <Box component="span">Individual</Box>
                    </Box>
                    <Box component="label" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}>
                      <Box component="input" type="radio" name="enquiryUserType" checked={enquiryUserType === "Dealer"} onChange={() => setEnquiryUserType("Dealer")} sx={{ accentColor: "#65c8b8" }} />
                      <Box component="span">Dealer</Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", color: "#6c7480", fontSize: 12 }}>
                    <Typography component="span" sx={{ color: "#6c7480", fontSize: 12 }}>Your reason to buy is</Typography>
                    <Box component="label" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}>
                      <Box component="input" type="radio" name="enquiryReason" checked={enquiryReason === "Investment"} onChange={() => setEnquiryReason("Investment")} sx={{ accentColor: "#65c8b8" }} />
                      <Box component="span">Investment</Box>
                    </Box>
                    <Box component="label" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}>
                      <Box component="input" type="radio" name="enquiryReason" checked={enquiryReason === "Self Use"} onChange={() => setEnquiryReason("Self Use")} sx={{ accentColor: "#65c8b8" }} />
                      <Box component="span">Self Use</Box>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 0.9, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 168px" }, gap: 1.0, alignItems: "start", maxWidth: 500 }}>
                  <Box>
                    <Box
                      component="input"
                      value={enquiryName}
                      onChange={(event) => setEnquiryName(event.target.value)}
                      sx={{
                        width: "100%",
                        height: 28,
                        border: "1px solid #d9e0ea",
                        bgcolor: "white",
                        px: 1.0,
                        color: "#6b7480",
                        fontSize: 12,
                        outline: "none",
                      }}
                    />
                    <Box sx={{ mt: 0.9, display: "grid", gridTemplateColumns: "74px 1fr", gap: 0.6 }}>
                      <Box
                        component="select"
                        defaultValue="IND (+91)"
                        sx={{
                          height: 28,
                          border: "1px solid #d9e0ea",
                          bgcolor: "white",
                          px: 0.7,
                          color: "#6b7480",
                          fontSize: 11,
                          outline: "none",
                        }}
                      >
                        <option>IND (+91)</option>
                      </Box>
                      <Box
                        component="input"
                        value={enquiryPhone}
                        onChange={(event) => setEnquiryPhone(event.target.value)}
                        sx={{
                          width: "100%",
                          height: 28,
                          border: "1px solid #d9e0ea",
                          bgcolor: "white",
                          px: 1.0,
                          color: "#6b7480",
                          fontSize: 12,
                          outline: "none",
                        }}
                      />
                    </Box>
                    <Box component="label" sx={{ mt: 1.35, display: "flex", alignItems: "center", gap: 0.8, color: "#8b94a1", fontSize: 11, cursor: "pointer" }}>
                      <Box component="input" type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} sx={{ accentColor: "#65c8b8", m: 0 }} />
                      <Box component="span">
                        I agree to the <Box component="span" sx={{ color: "#2c89d0" }}>Terms & Conditions</Box> and <Box component="span" sx={{ color: "#2c89d0" }}>Privacy Policy</Box>
                      </Box>
                    </Box>
                    <Button
                      onClick={handleSendEnquiry}
                      sx={{
                        mt: 1.0,
                        width: 102,
                        minWidth: 102,
                        height: 30,
                        borderRadius: 0,
                        bgcolor: "#2c89d0",
                        color: "white",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#247ec5", boxShadow: "none" },
                      }}
                    >
                      Send Email & SMS
                    </Button>
                  </Box>

                  <Box>
                    <Box
                      component="textarea"
                      value={enquiryMessage}
                      maxLength={400}
                      onChange={(event) => setEnquiryMessage(event.target.value)}
                      sx={{
                        width: "100%",
                        minHeight: 97,
                        border: "1px solid #d9e0ea",
                        bgcolor: "#fbfbfc",
                        p: 1.0,
                        color: "#8c95a2",
                        fontSize: 11.5,
                        resize: "none",
                        outline: "none",
                        fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif',
                      }}
                    />
                    <Typography sx={{ mt: 0.3, textAlign: "right", color: "#9aa1ab", fontSize: 10 }}>{enquiryMessage.length}/400 chars</Typography>
                  </Box>
                </Box>

                <Typography sx={{ mt: 1.1, color: "#7b838e", fontSize: 11, wordBreak: "break-all" }}>
                  Email: {ownerEmail}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box ref={(node) => { sectionRefs.current["Price Trends"] = node; }} sx={{ mt: 1.45, borderTop: "1px solid #d9dde5", pt: 1.35 }}>
            <Typography sx={{ color: "#24384f", fontSize: 16, fontWeight: 700 }}>Price Trends</Typography>
            <Box sx={{ mt: 0.9, border: "1px solid #d8dde7", borderRadius: "10px", bgcolor: "white", p: { xs: 1.4, md: 1.8 } }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr" }, gap: 2.0 }}>
                <Box sx={{ borderRight: { md: "1px solid #edf0f4" }, pr: { md: 1.8 } }}>
                  <Typography sx={{ color: "#7c8798", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Avg. Price / sq.ft.
                  </Typography>
                  <Typography sx={{ mt: 0.6, color: "#24384f", fontSize: 28, fontWeight: 700 }}>
                    Rs {Math.max(1, Math.round((Number(String(preview.pricePerSqftText).replace(/[^\d]/g, "")) || 658))).toLocaleString("en-IN")}
                  </Typography>
                  <Typography sx={{ mt: 0.25, color: "#1f9d61", fontSize: 12, fontWeight: 700 }}>
                    +6.8% YoY growth
                  </Typography>
                  <Typography sx={{ mt: 1.0, color: "#667487", fontSize: 12 }}>
                    Similar homes in {preview.city || "this locality"} are seeing steady price movement with demand from end users and investors.
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1.0, alignItems: "end", minHeight: 150 }}>
                    {[
                      { month: "Jan", value: 58 },
                      { month: "Feb", value: 64 },
                      { month: "Mar", value: 62 },
                      { month: "Apr", value: 72 },
                      { month: "May", value: 78 },
                      { month: "Jun", value: 86 },
                    ].map((item) => (
                      <Box key={item.month} sx={{ textAlign: "center" }}>
                        <Box
                          sx={{
                            height: `${item.value}px`,
                            borderRadius: "8px 8px 0 0",
                            bgcolor: item.month === "Jun" ? "#2c89d0" : "#d9ebfb",
                            border: item.month === "Jun" ? "1px solid #2c89d0" : "1px solid #c8def5",
                          }}
                        />
                        <Typography sx={{ mt: 0.6, color: "#7b8796", fontSize: 11 }}>{item.month}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mt: 1.5, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.0 }}>
                    <Box sx={{ border: "1px solid #eef1f5", borderRadius: "8px", p: 1.0 }}>
                      <Typography sx={{ color: "#7b8796", fontSize: 11 }}>Locality Avg.</Typography>
                      <Typography sx={{ mt: 0.35, color: "#24384f", fontSize: 14, fontWeight: 700 }}>Rs 7,180 / sq.ft.</Typography>
                    </Box>
                    <Box sx={{ border: "1px solid #eef1f5", borderRadius: "8px", p: 1.0 }}>
                      <Typography sx={{ color: "#7b8796", fontSize: 11 }}>Project Avg.</Typography>
                      <Typography sx={{ mt: 0.35, color: "#24384f", fontSize: 14, fontWeight: 700 }}>Rs 7,420 / sq.ft.</Typography>
                    </Box>
                    <Box sx={{ border: "1px solid #eef1f5", borderRadius: "8px", p: 1.0 }}>
                      <Typography sx={{ color: "#7b8796", fontSize: 11 }}>Rental Yield</Typography>
                      <Typography sx={{ mt: 0.35, color: "#24384f", fontSize: 14, fontWeight: 700 }}>3.1%</Typography>
                    </Box>
                    <Box sx={{ border: "1px solid #eef1f5", borderRadius: "8px", p: 1.0 }}>
                      <Typography sx={{ color: "#7b8796", fontSize: 11 }}>Demand Level</Typography>
                      <Typography sx={{ mt: 0.35, color: "#24384f", fontSize: 14, fontWeight: 700 }}>High</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box ref={(node) => { sectionRefs.current["Society Reviews"] = node; }} sx={{ mt: 1.45, borderTop: "1px solid #d9dde5", pt: 1.35 }}>
            <Typography sx={{ color: "#24384f", fontSize: 16, fontWeight: 700 }}>Society Reviews</Typography>
            <Box sx={{ mt: 0.9, border: "1px solid #d8dde7", borderRadius: "10px", bgcolor: "white", p: { xs: 1.4, md: 1.8 } }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "230px 1fr" }, gap: 2.0 }}>
                <Box sx={{ borderRight: { md: "1px solid #edf0f4" }, pr: { md: 1.8 } }}>
                  <Typography sx={{ color: "#24384f", fontSize: 30, fontWeight: 700, lineHeight: 1 }}>4.1</Typography>
                  <Typography sx={{ mt: 0.25, color: "#f4a11a", fontSize: 18, letterSpacing: 1.5 }}>★★★★☆</Typography>
                  <Typography sx={{ mt: 0.45, color: "#6b7787", fontSize: 12 }}>Based on 28 resident reviews</Typography>

                  <Box sx={{ mt: 1.3, display: "grid", gap: 0.9 }}>
                    {[
                      ["Construction", "4.2/5"],
                      ["Water Supply", "4.0/5"],
                      ["Connectivity", "4.4/5"],
                      ["Safety", "4.1/5"],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.0 }}>
                        <Typography sx={{ color: "#6b7787", fontSize: 12 }}>{label}</Typography>
                        <Typography sx={{ color: "#24384f", fontSize: 12, fontWeight: 700 }}>{value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gap: 1.15 }}>
                  {[
                    {
                      name: "Priya S.",
                      title: "Good for families",
                      body: "The society is maintained well, has decent parking, and daily commute is convenient. Nearby schools and grocery stores are a big plus.",
                      date: "Reviewed in Feb 2026",
                    },
                    {
                      name: "Arun K.",
                      title: "Solid resale potential",
                      body: "This project has seen stable demand over the last year. Build quality is good and the neighborhood has improved a lot.",
                      date: "Reviewed in Jan 2026",
                    },
                  ].map((review) => (
                    <Box key={review.name} sx={{ border: "1px solid #edf0f4", borderRadius: "10px", p: 1.25 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.0 }}>
                        <Box>
                          <Typography sx={{ color: "#24384f", fontSize: 13, fontWeight: 700 }}>{review.title}</Typography>
                          <Typography sx={{ mt: 0.15, color: "#7b8796", fontSize: 11 }}>{review.name}</Typography>
                        </Box>
                        <Typography sx={{ color: "#7b8796", fontSize: 11 }}>{review.date}</Typography>
                      </Box>
                      <Typography sx={{ mt: 0.75, color: "#5f6d7e", fontSize: 12.5, lineHeight: 1.6 }}>
                        {review.body}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box ref={(node) => { sectionRefs.current["Explore Locality"] = node; }} sx={{ mt: 1.45, borderTop: "1px solid #d9dde5", pt: 1.35 }}>
            <Typography sx={{ color: "#24384f", fontSize: 16, fontWeight: 700 }}>Explore Locality</Typography>
            <Box sx={{ mt: 0.9, border: "1px solid #d8dde7", borderRadius: "10px", bgcolor: "white", p: { xs: 1.4, md: 1.8 } }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" }, gap: 1.8 }}>
                <Box>
                  <Typography sx={{ color: "#24384f", fontSize: 15, fontWeight: 700 }}>
                    {preview.city || "Locality"} market snapshot
                  </Typography>
                  <Typography sx={{ mt: 0.55, color: "#607082", fontSize: 12.5, lineHeight: 1.7 }}>
                    {preview.addressLine || "This locality"} is a well-connected residential pocket with access to schools, hospitals,
                    grocery stores, and daily commute routes. Buyer demand is driven by end-user interest, decent civic infrastructure,
                    and improving neighborhood convenience.
                  </Typography>

                  <Box sx={{ mt: 1.35, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.0 }}>
                    {[
                      ["Metro / Transit", "12 mins away"],
                      ["School Zone", "3 schools within 2 km"],
                      ["Hospitals", "2 major hospitals nearby"],
                      ["Retail", "Daily needs within walking distance"],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ border: "1px solid #edf0f4", borderRadius: "8px", p: 1.0 }}>
                        <Typography sx={{ color: "#7b8796", fontSize: 11 }}>{label}</Typography>
                        <Typography sx={{ mt: 0.35, color: "#24384f", fontSize: 13, fontWeight: 700 }}>{value}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mt: 1.45, borderTop: "1px solid #eef1f5", pt: 1.2 }}>
                    <Typography sx={{ color: "#24384f", fontSize: 13, fontWeight: 700 }}>Why buyers prefer this area</Typography>
                    <Box sx={{ mt: 0.7, display: "grid", gap: 0.55 }}>
                      {[
                        "Good residential density with family-friendly surroundings",
                        "Convenient road connectivity to key work hubs",
                        "Healthy resale demand for ready-to-move homes",
                      ].map((item) => (
                        <Typography key={item} sx={{ color: "#607082", fontSize: 12.5 }}>
                          - {item}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gap: 1.05 }}>
                  <Box sx={{ border: "1px solid #edf0f4", borderRadius: "10px", p: 1.15 }}>
                    <Typography sx={{ color: "#24384f", fontSize: 13, fontWeight: 700 }}>Nearby landmarks</Typography>
                    <Box sx={{ mt: 0.8, display: "grid", gap: 0.75 }}>
                      {[
                        ["City Mall", "1.8 km"],
                        ["Green Valley School", "1.2 km"],
                        ["Apollo Clinic", "2.4 km"],
                        ["Tech Park", "5.6 km"],
                      ].map(([place, distance]) => (
                        <Box key={place} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.0 }}>
                          <Typography sx={{ color: "#607082", fontSize: 12.5 }}>{place}</Typography>
                          <Typography sx={{ color: "#24384f", fontSize: 12, fontWeight: 700 }}>{distance}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ border: "1px solid #edf0f4", borderRadius: "10px", p: 1.15 }}>
                    <Typography sx={{ color: "#24384f", fontSize: 13, fontWeight: 700 }}>Locality score</Typography>
                    <Box sx={{ mt: 0.9, display: "grid", gap: 0.8 }}>
                      {[
                        ["Connectivity", "8.6/10"],
                        ["Safety", "8.2/10"],
                        ["Lifestyle", "7.9/10"],
                        ["Value for Money", "8.4/10"],
                      ].map(([label, value]) => (
                        <Box key={label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.0 }}>
                          <Typography sx={{ color: "#607082", fontSize: 12.5 }}>{label}</Typography>
                          <Typography sx={{ color: "#24384f", fontSize: 12, fontWeight: 700 }}>{value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {errorMessage && (
            <Alert severity="warning" sx={{ mt: 1.2 }}>
              {errorMessage}
            </Alert>
          )}
        </Box>
      </Box>

      <Box
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 50,
          height: 50,
          borderRadius: "50%",
          bgcolor: "#f6f7f9",
          border: "1px solid #d4d9e1",
          boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 20,
        }}
      >
        <KeyboardArrowUpRoundedIcon sx={{ fontSize: 26, color: "#2f3d4f" }} />
      </Box>
    </Box>
  );
}



