import { useEffect, useMemo, useState } from "react";
import { Alert, Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import UpgradeRoundedIcon from "@mui/icons-material/UpgradeRounded";
import Navbar from "../components/Navbar";
import { getAuthToken, getAuthUser, getUserInitials } from "../utils/authStorage";

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
  commercial_land: "Commercial Plot / Land",
  warehouse_godown: "Warehouse / Godown",
  industrial_shed: "Industrial Shed",
  other: "Property",
};

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function formatPrice(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "Price on request";
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function formatPostedDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return `Posted on ${date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

function toPositiveInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.round(n));
}

function getVisibilityFromSource(source, photosCount) {
  const directVisibility = pickFirst(
    source?.visibilityPercent,
    source?.currentVisibility,
    source?.stats?.visibilityPercent,
    source?.stats?.visibility,
    source?.completionPercent,
    source?.completion
  );
  let visibilityPercent = toPositiveInt(directVisibility, -1);

  const directPending = pickFirst(
    source?.pendingActions,
    source?.pendingActionCount,
    source?.stats?.pendingActions,
    source?.todoCount
  );
  let pendingActions = toPositiveInt(directPending, -1);

  if (visibilityPercent < 0) {
    const hasLocation = Boolean(
      pickFirst(
        source?.locationDetails?.city,
        source?.location?.city,
        source?.city
      )
    );
    const hasPrice = Number(pickFirst(source?.pricingDetails?.priceDetails?.expectedPrice, source?.priceDetails?.expectedPrice, source?.price, 0)) > 0;
    const hasPhotos = photosCount > 0;
    const score = (hasLocation ? 30 : 0) + (hasPrice ? 30 : 0) + (hasPhotos ? 40 : 0);
    visibilityPercent = Math.max(8, Math.min(100, score));
  } else {
    visibilityPercent = Math.max(0, Math.min(100, visibilityPercent));
  }

  if (pendingActions < 0) {
    pendingActions = Math.max(0, Math.ceil((100 - visibilityPercent) / 30));
  }

  return { visibilityPercent, pendingActions };
}

function normalizeProperty(source) {
  const basicFromStorage = readJson("postPropertyBasicDetails");
  const locationFromStorage = readJson("postPropertyLocationDetails");

  const location = source?.locationDetails || source?.location || {};
  const basic = source?.basicDetails || source?.basic || {};
  const pricing = source?.pricingDetails || source?.pricing || {};
  const priceDetails = pricing?.priceDetails || source?.priceDetails || {};
  const mediaDetails = source?.mediaDetails || {};
  const photos = Array.isArray(mediaDetails?.photos) ? mediaDetails.photos : [];
  const coverPhoto =
    photos.find((item) => Boolean(item?.isCover) && String(item?.url || "").trim()) ||
    photos.find((item) => String(item?.url || "").trim()) ||
    null;

  const propertySubType = String(
    pickFirst(basic?.propertySubType, source?.propertySubType, basicFromStorage?.propertySubType)
  ).trim();
  const city = String(pickFirst(location?.city, source?.city, locationFromStorage?.city)).trim();
  const locality = String(pickFirst(location?.locality, source?.locality, locationFromStorage?.locality)).trim();
  const subLocality = String(
    pickFirst(location?.subLocality, source?.subLocality, locationFromStorage?.subLocality)
  ).trim();
  const locationText = [subLocality, locality, city].filter(Boolean).join(" ");

  const expectedPrice = pickFirst(
    priceDetails?.expectedPrice,
    source?.expectedPrice,
    source?.expectedRent,
    source?.price
  );
  const { visibilityPercent, pendingActions } = getVisibilityFromSource(source, photos.length);

  return {
    propertyId: String(
      pickFirst(source?.propertyId, source?._id, localStorage.getItem("postPropertyId"))
    ).trim(),
    title: `Sell Residential ${SUBTYPE_LABELS[propertySubType] || "Property"}`,
    locationText: locationText || "Location not available",
    priceText: formatPrice(expectedPrice),
    postedDate: formatPostedDate(source?.createdAt || source?.updatedAt),
    imageUrl: String(
      pickFirst(
        source?.coverImageUrl,
        source?.image,
        coverPhoto?.url
      )
    ).trim(),
    visibilityPercent,
    pendingActions,
    raw: source,
  };
}

function extractPropertyList(result) {
  if (Array.isArray(result)) return result;

  const data = result?.data;
  if (Array.isArray(data)) return data;

  const dataCandidates = [
    data?.properties,
    data?.listings,
    data?.items,
    data?.docs,
    data?.rows,
  ];
  for (const candidate of dataCandidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  const rootCandidates = [
    result?.properties,
    result?.listings,
    result?.items,
    result?.docs,
    result?.rows,
  ];
  for (const candidate of rootCandidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  const single = data?.property || result?.property;
  if (single && typeof single === "object") return [single];
  return [];
}

function getResponseCount(item) {
  const value = pickFirst(
    item?.totalResponses,
    item?.responsesCount,
    item?.responseCount,
    item?.stats?.responses,
    item?.enquiries?.count,
    item?.leadsCount
  );
  const n = Number(value || 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function clearPropertyDraftStorage() {
  const keys = [
    "postPropertyId",
    "previewPropertyId",
    "postPropertyEditMode",
    "postPropertyBasicDetails",
    "postPropertyLocationDetails",
    "postPropertyProfileDetails",
    "postPropertyMediaDetails",
    "postPropertyAmenitiesDetails",
  ];
  keys.forEach((key) => localStorage.removeItem(key));
}

const LIST_ENDPOINTS = [
  "/api/properties",
  "/api/properties/my-listings",
  "/api/properties/my-properties",
  "/api/properties/owner",
  "/api/properties/user",
];

async function fetchOwnerPropertyList(token, apiBaseUrl) {
  for (const path of LIST_ENDPOINTS) {
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) continue;
      return extractPropertyList(result);
    } catch {
      // Try next endpoint.
    }
  }
  return [];
}

async function fetchPropertyForEdit(propertyId, token, apiBaseUrl) {
  const detailPaths = [
    `/api/properties/${encodeURIComponent(propertyId)}`,
    `/api/properties/details/${encodeURIComponent(propertyId)}`,
    `/api/properties/property-details/${encodeURIComponent(propertyId)}`,
  ];
  for (const path of detailPaths) {
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) continue;
      const payload = result?.data?.property || result?.property || result?.data || result;
      if (payload && typeof payload === "object") return payload;
    } catch {
      // Try next endpoint.
    }
  }
  return null;
}

export default function PostPropertyDashboard() {
  const [property, setProperty] = useState(() => normalizeProperty({}));
  const [properties, setProperties] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [ownerPostedCount, setOwnerPostedCount] = useState(0);
  const [ownerTotalResponses, setOwnerTotalResponses] = useState(0);
  const [activityPropertyId, setActivityPropertyId] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [actionsAnchorEl, setActionsAnchorEl] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = getAuthUser();
  const ownerName = String(user?.fullName || user?.name || "Owner").trim() || "Owner";
  const ownerInitials = getUserInitials(user, "O");

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const token = getAuthToken();
      const propertyId = String(localStorage.getItem("postPropertyId") || "").trim();
      if (!token) {
        setProperty(normalizeProperty({}));
        setProperties([]);
        setOwnerPostedCount(0);
        setOwnerTotalResponses(0);
        setActivityPropertyId("");
        return;
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const list = await fetchOwnerPropertyList(token, apiBaseUrl);
      const sorted = [...list].sort((a, b) => {
        const aTime = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
        const bTime = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
        return bTime - aTime;
      });
      const normalizedSorted = sorted.map((item) => normalizeProperty(item));
      const latest = sorted[0] || {};
      const latestId = String(pickFirst(latest?.propertyId, latest?._id, propertyId)).trim();
      const totalResponses = list.reduce((sum, item) => sum + getResponseCount(item), 0);
      if (!isCancelled) {
        setProperties(normalizedSorted);
        setOwnerPostedCount(list.length || (propertyId ? 1 : 0));
        setOwnerTotalResponses(totalResponses);
        setActivityPropertyId(latestId);
      }

      if (!propertyId) {
        if (!isCancelled) {
          setProperty(normalizeProperty(latest || {}));
        }
        return;
      }
      const candidatePaths = [
        `/api/properties/${encodeURIComponent(propertyId)}`,
        `/api/properties/details/${encodeURIComponent(propertyId)}`,
        `/api/properties/property-details/${encodeURIComponent(propertyId)}`,
      ];

      let lastError = "";
      for (const path of candidatePaths) {
        try {
          const response = await fetch(`${apiBaseUrl}${path}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) {
            lastError = result?.message || `Failed to load details from ${path}`;
            continue;
          }
          const payload = result?.data || result?.property || result || {};
          if (!payload || typeof payload !== "object") continue;
          if (!isCancelled) {
            setProperty(normalizeProperty(payload));
            setErrorMessage("");
          }
          return;
        } catch {
          lastError = `Unable to load details from ${path}`;
        }
      }

      if (!isCancelled) {
        setProperty(normalizeProperty(latest || {}));
        setErrorMessage(lastError || "Could not load posted property details from DB.");
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, []);

  const primaryProperty = properties[0] || property;
  const propertyHeading = useMemo(() => {
    if (!primaryProperty.propertyId) return "Property ID -";
    return `Property ID - ${primaryProperty.propertyId} (${primaryProperty.title.replace("Sell Residential ", "")})`;
  }, [primaryProperty.propertyId, primaryProperty.title]);

  const shortActivityId = useMemo(() => {
    const id = String(activityPropertyId || primaryProperty.propertyId || "").trim();
    if (!id) return "N/A";
    if (id.length <= 18) return id;
    return `${id.slice(0, 18)}...`;
  }, [activityPropertyId, primaryProperty.propertyId]);

  const openActionsMenu = (event, propertyId) => {
    setSelectedPropertyId(String(propertyId || "").trim());
    setActionsAnchorEl(event.currentTarget);
  };

  const closeActionsMenu = () => {
    setSelectedPropertyId("");
    setActionsAnchorEl(null);
  };

  const getCurrentPropertyId = () =>
    String(selectedPropertyId || activityPropertyId || primaryProperty.propertyId || localStorage.getItem("postPropertyId") || "").trim();

  const persistEditDraftFromProperty = (item, overrideSource) => {
    const source =
      overrideSource && typeof overrideSource === "object"
        ? overrideSource
        : item?.raw && typeof item.raw === "object"
          ? item.raw
          : {};
    const basic = source?.basicDetails || source?.basic || {};
    const location = source?.locationDetails || source?.location || {};
    const profile = source?.propertyProfile || source?.profile || {};
    const media = source?.mediaDetails || {};
    const amenities = source?.amenitiesDetails || source?.amenities || {};

    const propertyIdForEdit = String(
      source?.propertyId || source?._id || item?.propertyId || localStorage.getItem("postPropertyId") || ""
    ).trim();

    clearPropertyDraftStorage();
    if (propertyIdForEdit) localStorage.setItem("postPropertyId", propertyIdForEdit);
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
    localStorage.setItem("postPropertyProfileDetails", JSON.stringify(profile || {}));
    localStorage.setItem("postPropertyMediaDetails", JSON.stringify(media || {}));
    localStorage.setItem("postPropertyAmenitiesDetails", JSON.stringify(amenities || {}));
    localStorage.setItem("postPropertyEditMode", "1");
  };

  const handlePreview = () => {
    closeActionsMenu();
    const propertyId = getCurrentPropertyId();
    if (propertyId) localStorage.setItem("previewPropertyId", propertyId);
    window.location.href = "/post-property/property-preview";
  };

  const handleAddEdit = async () => {
    closeActionsMenu();
    const editWindow = window.open("", "_blank");
    const propertyId = getCurrentPropertyId();
    const selected =
      properties.find((item) => String(item?.propertyId || "").trim() === propertyId) ||
      primaryProperty;
    const token = getAuthToken();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    let fullSource = null;
    if (propertyId && token) {
      fullSource = await fetchPropertyForEdit(propertyId, token, apiBaseUrl);
    }
    persistEditDraftFromProperty(selected, fullSource);
    if (editWindow) {
      editWindow.opener = null;
      editWindow.location.href = "/post-property/primary-details";
    } else {
      window.location.href = "/post-property/primary-details";
    }
  };

  const handleUpgrade = () => {
    const propertyId = getCurrentPropertyId();
    closeActionsMenu();
    if (propertyId) {
      localStorage.setItem("postPropertyId", propertyId);
      window.location.href = `/post-property/thank-you?propertyId=${encodeURIComponent(propertyId)}`;
      return;
    }
    window.location.href = "/post-property/thank-you";
  };

  const handleViewAllListings = () => {
    window.location.href = "/post-property/all-previews";
  };

  const handleDelete = async () => {
    closeActionsMenu();
    if (isDeleting) return;

    // Always redirect immediately.
    window.location.href = "/post-property/user-property-dashboard";
  };

  const propertiesToRender = properties.length ? properties : [property];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eceef3", fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif' }}>
      <Navbar sticky />

      <Box sx={{ mt: { xs: "56px", md: "64px" }, px: { xs: 1.2, sm: 2, md: 0 }, py: { xs: 1.6, md: 3.0 } }}>
        <Box sx={{ maxWidth: 1280, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 324px" }, gap: { xs: 1.6, md: 2.4 } }}>
          <Box>
            <Typography sx={{ color: "#6f7884", fontSize: { xs: 12, md: 15 } }}>
              Welcome to your dashboard, <Box component="span" sx={{ color: "#1d2f49", fontWeight: 700 }}>{ownerName}</Box>
            </Typography>
            <Typography sx={{ mt: 0.9, color: "#0a2440", fontSize: { xs: 18, md: 44 / 2 }, fontWeight: 800, lineHeight: 1.1 }}>
              Your Listings
            </Typography>

            <Box sx={{ mt: 0.7, display: "flex", alignItems: { xs: "flex-start", md: "center" }, flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", gap: 1.0 }}>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5, color: "#2b3f57", fontSize: { xs: 13, md: 30 / 2 } }}>
                <Typography sx={{ fontSize: "inherit", color: "#58677b" }}>Manage listing for</Typography>
                <Typography sx={{ fontSize: "inherit", fontWeight: 700 }}>{propertyHeading}</Typography>
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: "#6b7a8f" }} />
              </Box>
              <Typography
                component="button"
                type="button"
                onClick={handleViewAllListings}
                sx={{
                  border: 0,
                  p: 0,
                  m: 0,
                  background: "transparent",
                  color: "#1868ac",
                  fontSize: { xs: 12, md: 14 },
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                View all Listings
              </Typography>
            </Box>

            <Box sx={{ mt: 1.7, display: "grid", gap: 1.4 }}>
              {propertiesToRender.map((item, index) => (
                <Box key={item.propertyId || `property-${index}`} sx={{ border: "1px solid #d8dde7", borderRadius: "14px", overflow: "hidden", bgcolor: "white" }}>
                  <Box sx={{ px: { xs: 1.0, md: 1.8 }, py: { xs: 1.0, md: 1.7 }, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "170px 1fr", md: "190px 1fr" }, gap: { xs: 1.0, md: 1.8 } }}>
                    <Box sx={{ height: { xs: 110, md: 130 }, bgcolor: "#dce5f2", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <Box sx={{ position: "absolute", left: 10, top: 9, bgcolor: "#4f5867", color: "white", fontSize: 11, px: 1, borderRadius: "4px", fontWeight: 700 }}>
                        Not Verified
                      </Box>
                      {item.imageUrl ? (
                        <Box
                          component="img"
                          src={item.imageUrl}
                          alt={item.title || "Property image"}
                          sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                        />
                      ) : (
                        <HomeRoundedIcon sx={{ fontSize: { xs: 56, md: 64 }, color: "#7d9bbf" }} />
                      )}
                    </Box>

                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 1 }}>
                        <Typography sx={{ color: "#0d2644", fontSize: { xs: 18, md: 42 / 2 }, fontWeight: 700 }}>
                          {item.title}
                        </Typography>
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}>
                          <Box sx={{ bgcolor: "#eceff3", color: "#616f7f", fontSize: { xs: 11, md: 13 }, px: { xs: 0.8, md: 1.1 }, py: 0.3, borderRadius: "14px", whiteSpace: "nowrap", fontWeight: 700 }}>
                            Free Plan
                          </Box>
                          <IconButton size="small" onClick={(event) => openActionsMenu(event, item.propertyId)} sx={{ color: "#5f6f82" }}>
                            <MoreVertRoundedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography sx={{ mt: 0.45, color: "#5f6f82", fontSize: { xs: 12, md: 15 } }}>
                        {item.locationText}
                      </Typography>

                      <Box sx={{ mt: { xs: 0.8, md: 1.2 }, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr", md: "120px 1fr 1fr" }, gap: 0.9 }}>
                        <Box>
                          <Typography sx={{ color: "#8b95a4", fontSize: { xs: 11, md: 13 } }}>Price</Typography>
                          <Typography sx={{ color: "#172b44", fontSize: { xs: 14, md: 17 }, fontWeight: 700 }}>{item.priceText}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ color: "#8b95a4", fontSize: { xs: 11, md: 13 } }}>Property ID</Typography>
                          <Typography sx={{ color: "#172b44", fontSize: { xs: 13, md: 17 }, fontWeight: 700, wordBreak: "break-all" }}>{item.propertyId || "-"}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ color: "#8b95a4", fontSize: { xs: 11, md: 13 } }}>Duration</Typography>
                          <Typography sx={{ color: "#172b44", fontSize: { xs: 13, md: 17 }, fontWeight: 700 }}>{item.postedDate}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ borderTop: "1px solid #e2e6ed", display: "grid", gridTemplateColumns: { xs: "1fr", md: "165px 1fr" } }}>
                    <Box sx={{ py: 1.1, px: 1.2, borderRight: { md: "1px solid #e2e6ed" }, display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Box sx={{ width: 50, height: 50, borderRadius: "50%", border: "7px solid #d8dde6", borderTopColor: "#e4524a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#27384d", fontSize: 10 }}>
                        {item.visibilityPercent}%
                      </Box>
                      <Box>
                        <Typography sx={{ color: "#56667a", fontSize: { xs: 11, md: 12 }, lineHeight: 1.2 }}>Current Visibility</Typography>
                        <Typography sx={{ mt: 0.5, color: "#d44c49", fontSize: { xs: 10, md: 11 }, fontWeight: 700 }}>
                          {item.pendingActions} pending actions!
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ py: 1.1, px: 1.4, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.2 }}>
                      <Box>
                        <Typography sx={{ color: "#152a44", fontSize: { xs: 13, md: 16 }, fontWeight: 700 }}>
                          1. Get upto 2X views on listing
                        </Typography>
                        <Typography sx={{ mt: 0.25, color: "#5f6f82", fontSize: { xs: 11, md: 12 } }}>
                          Add at least 4 photos of your property. Easy WhatsApp upload
                        </Typography>
                      </Box>
                      <Typography sx={{ color: "#2e6fab", fontSize: { xs: 11, md: 12 }, fontWeight: 700 }}>+10%</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {errorMessage && (
              <Alert severity="warning" sx={{ mt: 1.5 }}>
                {errorMessage} Showing available saved details.
              </Alert>
            )}
            {isDeleting && (
              <Typography sx={{ mt: 1, color: "#6a7688", fontSize: 12 }}>
                Deleting property...
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "grid",
              alignContent: "start",
              gap: 1.4,
              position: { xs: "static", lg: "sticky" },
              top: { lg: "80px" },
              alignSelf: "start",
              height: "fit-content",
            }}
          >
            <Box sx={{ bgcolor: "white", border: "1px solid #d8dde7", borderRadius: "14px", p: { xs: 1.2, md: 1.6 }, minHeight: { md: 310 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box sx={{ width: 46, height: 46, borderRadius: "50%", bgcolor: "#cfe2d0", color: "#2f7b2f", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {ownerInitials}
                </Box>
                <Box>
                  <Typography sx={{ color: "#1a304d", fontSize: { xs: 16, md: 20 }, fontWeight: 700 }}>{ownerName}</Typography>
                  <Typography sx={{ color: "#6f7a88", fontSize: { xs: 12, md: 16 / 2 } }}>Owner</Typography>
                </Box>
              </Box>

              <Typography sx={{ mt: 1.1, color: "#818c9b", fontSize: { xs: 12, md: 14 }, fontWeight: 700, letterSpacing: 0.6 }}>
                YOUR RECENT ACTIVITY
              </Typography>
              <Box sx={{ mt: 0.65, color: "#48596e", fontSize: { xs: 12, md: 16 }, display: "flex", alignItems: "center", gap: 0.4, wordBreak: "break-all" }}>
                Property ID - {shortActivityId}
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: "#6f7a88" }} />
              </Box>

              <Box sx={{ mt: 1.1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.8 }}>
                  <Box sx={{ border: "1px solid #e0e5ed", borderRadius: "10px", p: 1.3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#162c47", fontWeight: 700, fontSize: { xs: 14, md: 18 } }}>{ownerPostedCount}</Typography>
                    <LaunchRoundedIcon sx={{ color: "#346b9d", fontSize: 18 }} />
                  </Box>
                  <Typography sx={{ mt: 0.6, color: "#6f7a88", fontSize: { xs: 10, md: 10 } }}>Property Posted</Typography>
                </Box>
                <Box sx={{ border: "1px solid #e0e5ed", borderRadius: "10px", p: 1.3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#162c47", fontWeight: 700, fontSize: { xs: 14, md: 18 } }}>{ownerTotalResponses}</Typography>
                    <LaunchRoundedIcon sx={{ color: "#346b9d", fontSize: 18 }} />
                  </Box>
                  <Typography sx={{ mt: 0.6, color: "#6f7a88", fontSize: { xs: 10, md: 10 } }}>Total Responses</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 1.0, border: "1px solid #efc7ca", borderRadius: "10px", bgcolor: "#fff3f3", p: 0.9, display: "flex", gap: 0.7 }}>
                <ReportProblemOutlinedIcon sx={{ color: "#d85656", fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography sx={{ color: "#4f5f73", fontSize: { xs: 10, md: 11 }, lineHeight: 1.25 }}>
                    Free listing is visible to only {primaryProperty.visibilityPercent || 0}% buyers
                  </Typography>
                  <Typography sx={{ mt: 0.3, color: "#2b67a1", fontSize: { xs: 11, md: 12 }, fontWeight: 700 }}>
                    Get upto 10X Responses - Upgrade
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "white", border: "1px solid #d8dde7", borderRadius: "14px", p: { xs: 1.2, md: 1.6 }, minHeight: { md: 150 } }}>
              <Typography sx={{ color: "#162b44", fontSize: { xs: 24 / 2, md: 21 }, fontWeight: 700, lineHeight: 1.2 }}>
                Get a Relationship
                <br />
                Manager
              </Typography>
              <Typography sx={{ mt: 0.8, color: "#707d8d", fontSize: { xs: 11, md: 11 }, lineHeight: 1.35 }}>
                Get filtered and genuine leads
                <br />
                with end-to-end assistance.
              </Typography>
            </Box>
          </Box>
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

      <Menu
        anchorEl={actionsAnchorEl}
        open={Boolean(actionsAnchorEl)}
        onClose={closeActionsMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            minWidth: 210,
            borderRadius: "10px",
            border: "1px solid #dbe2eb",
            boxShadow: "0 10px 24px rgba(12,37,68,0.16)",
          },
        }}
      >
        <MenuItem onClick={handlePreview}>
          <ListItemIcon sx={{ minWidth: 32 }}><PreviewRoundedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Preview" />
        </MenuItem>
        <MenuItem onClick={handleAddEdit}>
          <ListItemIcon sx={{ minWidth: 32 }}><EditRoundedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Add/Edit Details" />
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "#b42318" }}>
          <ListItemIcon sx={{ minWidth: 32, color: "#b42318" }}><DeleteOutlineRoundedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
        <MenuItem onClick={handleUpgrade}>
          <ListItemIcon sx={{ minWidth: 32 }}><UpgradeRoundedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Upgrade" />
        </MenuItem>
      </Menu>
    </Box>
  );
}

